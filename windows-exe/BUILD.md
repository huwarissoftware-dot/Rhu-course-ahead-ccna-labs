# Build the Windows packages (Electron)

Publisher: **Raja Huwaris Usmani**. The EXEs ship with his RHU logo as the
executable icon and `CompanyName / Publisher = "Raja Huwaris Usmani"` in the
file properties. App code ships inside `resources/app.asar` (no loose
source); `LICENSE.txt` (all rights reserved) is installed next to the app.

## Outputs

| File | What it is |
|---|---|
| `Course-Ahead-CCNA-Labs-Setup.exe` | NSIS Setup — installs per-user, directory choice, license page, desktop + Start Menu shortcuts, Add/Remove Programs entry with uninstaller |
| `Course-Ahead-CCNA-Labs-Portable.exe` | Portable single file, runs directly, nothing installed |

## Normal build (Windows PC or GitHub Actions)

```bash
npm install
npm run dist        # electron-builder --win portable nsis
```

`package.json` sets `"signAndEditExecutable": true`, so on Windows
electron-builder stamps the app exe with `build/icon.ico` (the RHU logo,
generated from `../assets/logo/icon-512.png`) and the version metadata
(CompanyName from `author.name`, copyright from `build.copyright`)
natively via rcedit. The GitHub Actions workflow
(`../.github/workflows/build-all.yml`, job `windows`) does exactly this.

## Linux build (this machine — no wine possible)

This VM's kernel kills every 32-bit binary (the ia32 loader segfaults), so
wine can never run electron-builder's uninstaller pre-generation step.
The packages here are therefore produced in wine-free steps
(scripts in `tools/`, run per phase):

```bash
cp ../web-app/index.html app/index.html
PHASE=dir      node tools/build-windows.js   # unpacked app (resource editing off, locally)
node tools/stamp-exe.js "dist/win-unpacked/Course Ahead CCNA Labs.exe"
PHASE=portable node tools/build-windows.js   # portable exe (no wine needed)
# rebuild electron-builder's payload archive from the stamped dir with 7za, then:
makensis installer.nsi                        # Setup exe (native Linux makensis)
node tools/stamp-exe.js dist/Course-Ahead-CCNA-Labs-Portable.exe   # exact FileDescription
```

- `tools/stamp-exe.js` (resedit, pure JS) writes the RHU icon + version
  strings into an exe and is NSIS-overlay safe (payload verified
  byte-identical after stamping).
- `installer.nsi` is a classic NSIS script: it embeds electron-builder's
  `.nsis.7z` payload, extracts it with the Nsis7z plugin, and uses
  `WriteUninstaller` so the uninstaller is generated on the user's own
  machine (electron-builder pre-generates it only so it can be signed).
- Verify any produced exe with `tools/inspect-exe.js <file> --icon-out x.ico`
  and `tools/compare_icon.py x.ico build/icon.png` — the extracted icon must
  pixel-match the RHU logo at all 8 sizes, and CompanyName must read
  "Raja Huwaris Usmani". An exe still showing Electron's atom icon or
  "GitHub, Inc." metadata is a failed build — do not ship it.

## Code signing

The files are **not** Authenticode-signed. The publisher *name* is embedded
in the file properties, but Windows SmartScreen will still say "unknown
publisher" until a CA-issued code-signing certificate in the name
"Raja Huwaris Usmani" is used (roughly US$100–300/year, or Azure Trusted
Signing ~US$10/month). Self-signing was deliberately not used: an
untrusted self-signed signature adds warnings without adding trust.
