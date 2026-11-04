# Build the Android .APK (Capacitor)

The APK wraps the finished web app in `../web-app/` — one codebase, three deliveries (web / EXE / APK).

## Steps

1. Install Node.js (LTS) and Android Studio (for the Android SDK) on the build PC.
2. In this folder:

```bash
npm install
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "Course Ahead CCNA Labs" com.courseahead.ccnalabs --web-dir=../web-app
npx cap add android
npx cap sync
npx cap open android
```

3. In Android Studio: **Build → Build App Bundle(s) / APK(s) → Build APK(s)**.

`capacitor.config` keeps the app fully offline: all files are bundled inside the APK, no server URL.

## Output

`android/app/build/outputs/apk/debug/app-debug.apk` (debug) or a signed release APK via **Build → Generate Signed Bundle / APK** for sharing with students.

## App icon / logo

The official logo is provided by the owner and is currently a placeholder.
When it arrives: generate the Android adaptive-icon set from it into
`android/app/src/main/res/mipmap-*` (Android Studio: Image Asset wizard), then rebuild.
