# Mobile Fix + Save/Resume + Security — Change Log (2026-10-23)

Diagnosis: see DIAGNOSIS.md in this folder. Verification screenshots:
diagnosis/ (before) and verify/ (after).

## 1. Mobile redesign (index.html, additive CSS + JS "enhancer" only)
- ROOT CAUSE of the jumbled phone layout: the terminal `<input id="term-in">`
  had no `size` attribute, so its default intrinsic width (~255px) forced the
  whole app to lay out at ~473–508px on a 360–390px phone (zoomed-out, cut-off
  text). Fixed with `size="1"` (flex sizes it) — page now renders at exactly
  the device width, zero horizontal overflow everywhere.
- Topbar: was a 280px-tall sticky wrap of 5 rows. Now one compact row
  (tablets) / two-row static header (≤520px).
- NEW bottom navigation (≤900px): Home / Labs / Quiz / About, 70px tall,
  big icon+label buttons, active-view highlight.
- Lab screen is PINNED on one screen (no page scroll): current-step card on
  top (only the current step is shown; the list scrolls inside its own slot),
  topology in the middle (dvh-sized), device panel tabs, then the terminal
  docked at the bottom — step + map + terminal input all visible together.
  Page height == viewport height exactly (verified 740/740 and 844).
- One-thumb controls: terminal input 56px, Run button 56px, device chips
  46px, panel tabs 46px, step action buttons 48–54px, quiz options 58px,
  PC-window fields/buttons 50px.
- One-tap commands: the current step's commands render as tappable chips
  (tap = insert into the terminal, correct device auto-selected); the big
  "Type it for me" button is pinned under the step; a 🕘 history popover
  replays previous commands (arrow keys still work on desktop).
- Device switcher: the device chips are always visible in the terminal head.
- Sandbox: all six tool buttons fit and are tappable (elementFromPoint
  tested); the cable-type picker stays visible in sandbox only.
- Desktop ≥1200px: true 3-column lab (steps | map+panel | terminal) by
  moving #terminal into the grid; bottom nav hidden; all original layout
  below 1200px unchanged except the additive chips/history.

## 2. Save & Resume (localStorage key `rhu-labs-save-v1`)
Before this fix the app kept ALL progress in memory ("progress is kept in
memory for this session" — its own comment): every restart wiped stars, XP
and unlocks. Now saved on every milestone (step check, lab/quiz completion,
mode toggle, owner toggle, page hide):
- PROGRESS (stars per lab/quiz → unlock state derives from it), XP,
  SESSION_DONE with date rollover, day streak, Kids/Normal mode.
- Position: current lab id, per-step done flags, selected device, AND a
  full snapshot of the network state (every device's IPs, modes, PC config,
  terminal scrollback trimmed) — resume is exact, not a restart.
- Home shows a big green Continue card ("Welcome back, hero! You left
  <lab> at Step N of M") that reopens the lab exactly where it was left.
  Finishing a lab clears the position (the path's Next-Up takes over).
- Verified end-to-end (verify5): 25/26 assertions pass. The one "FAIL" is a
  test-expectation artifact: after resuming, completing step 2 also
  satisfied step 3's reachability check, so the app completed the lab at
  100% — all persistence assertions around it pass.

## 3. Security / copyright
- RELEASE SIGNING: the APK is now signed with a dedicated release keystore
  (alias `courseahead-ccna`, RSA-2048, 30-year validity, DN: CN=Raja
  Huwaris Usmani, O=Course Ahead, Karachi, PK). apksigner verifies v2 + v3.
  Keystore + credentials live in `android-apk/release/` (both chmod 0600,
  folder added to .gitignore, excluded from the GitHub ZIP — verified).
  build-apk.sh signs with it automatically; debug signing is only a
  fallback when the release folder is absent.
  NOTE: because the signing key changed, Android will NOT install this APK
  over the old debug-signed one — uninstall the old app once, then install.
  All future updates MUST use this same keystore or updates will fail.
- Copyright: "© 2026 Raja Huwaris Usmani — All Rights Reserved" now appears
  on the About page and in the home footer; LICENSE.txt (all rights
  reserved, no copying/modification/redistribution) is in the project root.
- Build watermark: HTML comment + author/copyright meta tags in <head>
  ("Build: 2026-10-23") so any leaked copy is provably his build.
- Minification deliberately SKIPPED: obfuscating the single-file app risks
  breaking the verified build; the code already ships packaged inside the
  APK's assets (not externally editable). Revisit only with a tested
  minifier pipeline.

## 4. Windows EXE — rebuilt with the final index.html (2026-10-23)
The portable EXE in the delivery folder is now built from the same final
index.html as the APK (app.asar hash verified identical). The build needed
toolchain repairs after a VM restart wiped them: wine + wine32 reinstalled,
a wine shim (~/workspace/tools/wine-shim/wine → /usr/lib/wine/wine64, the
stock preloader segfaults in this VM), and the cached rcedit-ia32.exe
replaced with the 64-bit rcedit binary (backup kept) because the 32-bit
wine loader crashes in this environment. EXE metadata (CompanyName /
LegalCopyright) is stamped by rcedit as before.
