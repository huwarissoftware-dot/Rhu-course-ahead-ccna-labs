#!/usr/bin/env bash
# Build the Course Ahead CCNA Labs APK without Gradle/Android Studio.
# Needs: a JDK (javac, keytool) and an Android SDK with build-tools 35.0.0
# and platforms/android-35. Set JAVA_HOME and ANDROID_HOME, then run:
#   ./build-apk.sh
# Output: ../Course-Ahead-CCNA-Labs.apk  (debug-signed, ready to sideload)
set -e
cd "$(dirname "$0")"

JAVA_BIN="$JAVA_HOME/bin"
BT="$ANDROID_HOME/build-tools/35.0.0"
ANDROID_JAR="$ANDROID_HOME/platforms/android-35/android.jar"
WORK=build
rm -rf "$WORK"
mkdir -p "$WORK/assets" "$WORK/classes" "$WORK/dex"

# 1. App payload = the synced web app (single offline index.html)
cp ../../web-app/index.html "$WORK/assets/index.html"

# 2. Compile the wrapper
"$JAVA_BIN/javac" -encoding UTF-8 -source 8 -target 8 -cp "$ANDROID_JAR" -d "$WORK/classes" MainActivity.java

# 3. DEX the bytecode
"$BT/d8" --lib "$ANDROID_JAR" --output "$WORK/dex" $(find "$WORK/classes" -name '*.class')

# 4. Package
"$BT/aapt" package -f -M AndroidManifest.xml -S res --auto-add-overlay -A "$WORK/assets" -I "$ANDROID_JAR" -F "$WORK/unsigned.apk"
cd "$WORK"
( cd dex && zip -q ../unsigned.apk classes.dex )
"$BT/zipalign" -f 4 unsigned.apk aligned.apk

# 5. Sign the APK.
# Preferred: the RELEASE keystore in ../release/ (passwords live only in its
# 0600 keystore.properties — never in this script and never printed).
# Fallback: a throwaway debug keystore (local testing only).
REL_DIR="$(cd ../.. && pwd)/release"
REL_PROPS="$REL_DIR/keystore.properties"
if [ -f "$REL_PROPS" ]; then
  KS_FILE=$(grep '^storeFile=' "$REL_PROPS" | cut -d= -f2-)
  KS_PASS=$(grep '^storePassword=' "$REL_PROPS" | cut -d= -f2-)
  KEY_ALIAS=$(grep '^keyAlias=' "$REL_PROPS" | cut -d= -f2-)
  KEY_PASS=$(grep '^keyPassword=' "$REL_PROPS" | cut -d= -f2-)
  "$BT/apksigner" sign --ks "$REL_DIR/$KS_FILE" --ks-pass "pass:$KS_PASS" \
    --key-pass "pass:$KEY_PASS" --ks-key-alias "$KEY_ALIAS" \
    --v2-signing-enabled true --out ../../Course-Ahead-CCNA-Labs.apk aligned.apk
  echo "Signed with RELEASE keystore (alias: $KEY_ALIAS)"
else
  if [ ! -f debug.keystore ]; then
    "$JAVA_BIN/keytool" -genkeypair -keystore debug.keystore -storepass android \
      -alias androiddebugkey -keypass android -keyalg RSA -keysize 2048 \
      -validity 10950 -dname "CN=Android Debug,O=Android,C=US" >/dev/null 2>&1
  fi
  "$BT/apksigner" sign --ks debug.keystore --ks-pass pass:android \
    --key-pass pass:android --out ../../Course-Ahead-CCNA-Labs.apk aligned.apk
  echo "WARNING: signed with DEBUG keystore (no release keystore found)"
fi
cd ..
"$BT/apksigner" verify --print-certs ../Course-Ahead-CCNA-Labs.apk | head -3
echo "APK built: android-apk/Course-Ahead-CCNA-Labs.apk"
