# Mobile Diagnosis — Course Ahead CCNA Labs (before fix)
Date: 2026-10-23 · Viewport tested: 360×740 (headless Chrome, mobile emulation)
Screenshots: diag-1-home.png, diag-2-lablist.png, diag-3-lab1-viewport.png, diag-3b-lab1-fullpage.png, diag-4-cli.png

## What is broken on a phone

1. **Topbar explodes to ~280px tall.** At 360px wide, `#topbar` wraps into 5 stacked
   rows (logo / CCNA pill / stars+XP pill / Kids–Normal toggle / Simple Words +
   About buttons). It is `position:sticky`, so it permanently steals ~38% of a
   740px-tall screen on EVERY screen, including while scrolling the lab list.

2. **The lab screen renders WIDER than the phone.** Once Lab 1 opens, the layout
   viewport blows out from 360px to ~508px: steps panel measures 494px wide,
   terminal 494px wide. On a real phone the whole lab renders zoomed-out / sliced,
   with text cut off at the right edge (device panel heading, terminal input
   placeholder). This is the "agay pechay" (jumbled) effect the user reported.

3. **Instruction, map and terminal are NEVER on screen together.** DOM order on
   mobile is: steps panel (1,537px tall — all steps + tabs + exact-commands block)
   → network map (starts at y≈2,094) → device panel (y≈2,550) → terminal
   (y≈2,790 of a 3,294px page). To type a command a child scrolls ~4 screens down;
   to re-read the instruction, ~4 screens back up.

4. **Touch targets are far too small.** Terminal input is 41px tall; device chips
   are ~26px tall (3px vertical padding); panel tabs and step buttons are
   desktop-sized. The "Run ⏎" button is a `.btn.small`.

5. **No bottom navigation.** Home is a single ~28,300px-tall scroll (hero + path
   + badges + 9 category grids + quiz arena) with no quick way to jump between
   Home / Labs / Quiz / About.

6. **Command help is copy-paste based.** The current step's commands sit in a
   black box whose tap action is "copy" — a child on a phone then has to find
   the terminal (4 screens away) and paste. The one-tap "Type it for me" button
   exists but is small and buried inside the steps panel.

## Numbers (360×740, Lab 1 open)
- Page height: 3,294px · steps panel: y 543→2,080 · map: y≈2,094 · terminal: y≈2,790
- Terminal input height: 41px · term-out fixed height: 342px (desktop value)
- Home page height: 28,300px · topbar: 280px tall, sticky
