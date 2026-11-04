# Phase 2 Fix Pass — REPORT (2026-10-24)

Fix + full re-verification of Course Ahead CCNA Labs after the user's first real
test (APK + Setup feedback), plus the two urgent follow-ups (MT scrolling +
whole-app interaction audit). Built from `web-app/index.html`, watermark
`Build: 2026-10-24`. All verification was done in headless Chromium (152) at
360×740 and 390×844 through the real UI (clicks + typed commands), not code
inspection alone.

## 1. Language bug — Roman Urdu in English mode — FIXED

**Root cause.** In English mode with Kids Mode (the default), lab steps render the
`k` (kids) field. Phase 2 wrote the MikroTik `k` fields in Roman Urdu, so they
showed in English mode. All other Roman-Urdu strings were already gated.

**Fix (in `web-app/index.html`).**
- All 22 Roman-Urdu MikroTik `k` fields rewritten to kid-simple English
  (e.g. "Wizard chalao: /ip dhcp-server setup — sab kuch khud ban jayega!" →
  "Run the wizard: /ip dhcp-server setup — it builds everything by itself!").
- 3 hardcoded Roman-Urdu toasts gated with `T()` (profile-name prompt,
  profile-created, certificate-created) — Urdu text preserved for Urdu mode.

**Verification.**
- Static scan of the final file: 227 `k` fields, 228 `t` fields, 227 hints,
  81 `T()` English args — **0 Roman-Urdu tokens** in any of them.
- Live scans in English mode: home, MikroTik list, all 8 MT lab players,
  About, footer — **0 Roman-Urdu hits, 0 forbidden terms**.
- Urdu mode spot check: toggling to Urdu shows Roman Urdu where intended
  (aur, darwaze, ghar, kabhi, karo, mein, sab, yeh); toggling back restores
  zero Roman Urdu. The toggle button label "Roman Urdu" itself is the language
  name, not a leak.

## 2. About page rewrite — DONE exactly as specified

Maker card now contains exactly: photo, name "Raja Huwaris Usmani", role line
`Technical Expert · 6 years experience`, Instagram `@i.huwaris` badge. The old
details list (Karachi, CubeXS, BBA, book, magazine, free-promise lines) was
removed. File-wide: **CubeXS = 0, BBA = 0, graduation = 0** occurrences.
"Technical Lead" occurs exactly once — inside the certificate design's
signature block, which was separately approved and was NOT touched.

## 3. MikroTik end-to-end — all 8 labs 100% through the real UI

Played completely (tap steps, "Type it for me", chips + Send, Cut/Repair
buttons) at 360×740. Every lab finished with its done modal open:

| Lab | Steps | Stars | WinBox sync check |
|---|---|---|---|
| Meet MikroTik | 4/4 | ★☆☆ (typeforme) | ether1 shown |
| A Name & an Address | 3/3 | ★★★ (fully manual) | 192.168.88.1 on ether2 |
| DHCP Server | 3/3 | ★☆☆ | 192.168.88.x pool |
| NAT Masquerade | 3/3 | ★☆☆ | masquerade rule |
| Firewall Basics | 3/3 | ★☆☆ | 203.0.113.9 drop rule |
| WiFi | 3/3 | ★☆☆ | HeroWiFi SSID |
| Simple Queues | 3/3 | ★☆☆ | GamesPC 5M/5M |
| Dual-WAN Auto-Failover | 5/5 | ★☆☆ | traffic ISP 2 → ISP 1 |

- **Negative tests (all pass):** submitting a wrong command (`/wrong command`)
  never advances a step; terminal shows `bad command name /wrong`.
- **Failover traffic switching (visible):** Cut ISP 1 → `🌐 Traffic: ISP 2 🟢`;
  Repair ISP 1 → `🌐 Traffic: ISP 1 🟢`.
- **Stars note:** using "Type it for me" gives 1 star BY DESIGN
  (`typed > 0 → 1`); the fully-manual Name+IP lab earned ★★★, proving manual
  play still earns full stars.
- **Sequencing:** no step passes early (wrong commands and out-of-order
  actions do not advance steps).

## 4. MikroTik pages do not scroll (APK) — FIXED (root cause found)

**Root cause.** The mobile pinned layout sized a `.main` wrapper that does not
exist (views are direct children of `<body>`), so the MT player never got a
scrollable height while `body{overflow:hidden}` clipped everything below the
fold. Reproduced on the old file: panel scrollHeight == clientHeight
(maxScroll 0), terminal form at y=1808 on a 740px viewport, unreachable.

**Fix (mobile CSS only; Cisco's `v-lab` pinning untouched).**
- Size `#view-mt` itself (`100vh` fallback + `100dvh`, minus bottom nav).
- Hide `#topbar` inside the MT player (its wrapped mobile height varies, and
  it had pushed the terminal form behind the bottom nav).
- The player's `.panel` is now the touch-scrollable region
  (`-webkit-overflow-scrolling:touch`).

**Verification (before → after).**
- 360×740: view height 608→670 exact, panel 664/1727 scrollable, terminal
  form lands at 601–657, fully above the bottom nav (670).
- 390×844: view 774, form at 705–761, above the bottom nav (774).
- Every MT lab re-checked: terminal form reachable by scrolling
  (`formVisible: true` in all 8 labs).
- MT list page scrolls normally; Cisco lab one-screen assembly unchanged.

## 5. Full interaction audit — whole app swept

40 scripted checks + a 14-check retest of every initial failure. Final state:
**all areas pass.** Covered: bottomnav (5 destinations), home buttons, locked
lab message, Cisco Lab 1 (hint, device chips, full completion), Save & Resume
(Continue card after mid-lab exit → resumes at Step 2, 33%), Quiz Arena
(start, answer feedback, Next Question → Question 2), Sandbox (add
Router/Switch/PC, cable + delete tools), Profiles (add, switch via Learn
button), language toggle both ways, glossary, Kids/Normal toggle, Mock Exam
(intro, start, timer 45:00, answer), Certificates (claim form validation,
generated doc: name only, ID `CA-2026-…`, valid +2 years, email NOT printed),
About + owner-code rejection message, WinBox menus (4/5 changed by length
comparison; all 6 menus render distinct content per the MT sweep), manual
console typing (`/interface print` lists ether ports), page scrolling (home,
MT list, MT player — all with smooth-scroll-aware delayed reads).

**Disposition of the 8 first-run failures (all re-verified, none are app
bugs):** Continue card (only shows for unfinished labs — by design);
quiz Next (Quiz Arena lives on Home, not in the empty player container);
profiles open/switch (check used exact-match on card text; overlay was open);
certificate claim (seed used the wrong data shape — categories have no labs
array; labs carry `cat`; smallest is capstone, 1 lab); owner-code error
(form is a `<div>`, not a `<form>`; error text says "not right", and the
submit button is `#btn-owner-go`); home/MT-list scrolling (pages use
`scroll-behavior:smooth`, so immediate scroll reads show 0 — delayed reads
prove scrolling works).

## 6. Cisco regression — PASS

Cisco Lab 1 opens, hint shows, device chips switch, full completion via
"Type it for me" opens the done modal. Leaving a lab mid-way shows
▶ Continue Lab on Home and resumes at the saved step.

## Rebuilds + verification (2026-10-24)

- **APK** `Course-Ahead-CCNA-Labs.apk` — **3,027,501 B**. Release-signed with
  the EXISTING keystore, cert SHA-256
  `ca1bdaf8f244de4be3307e230bbba42abc971a9d4158e01c9bf3296f95a583c7`,
  apksigner: v2 ✓, v3 ✓. Payload `assets/index.html` hash-matches the
  fixed `web-app/index.html` exactly.
- **Setup.exe** `Course-Ahead-CCNA-Labs-Setup.exe` — **85,262,057 B**. NSIS
  installer built with native makensis from the verified `.nsis.7z`
  (83,760,430 B, contains the stamped 188,802,048-byte exe + the fixed asar).
  Icon extracted = RHU logo at all 8 sizes (pixel-exact); version info
  CompanyName "Raja Huwaris Usmani", LegalCopyright present. Payload file
  count: 74 (matches Phase 2).
- **Portable.exe** `Course-Ahead-CCNA-Labs-Portable.exe` — **84,152,721 B**.
  Self-extracting payload verified: embedded asar's `app/index.html`
  hash-matches the fixed file; icon = RHU logo (pixel-exact); same version
  info as Setup.
- **GitHub ZIP** refreshed with final sources + new APK + this report;
  scanned: zero keystore material (no `.keystore`, `keystore.properties`,
  `.pem`, or password strings). The stale `.idsig` was replaced by the fresh
  one generated with this APK build.
- All three packages copied to `~/workspace/your_files/ccna-labs-packages/`.

## Honest notes

- `PHASE=pack` (electron-builder nsis target) fails on this Linux box
  (app-builder cannot execute the wine-dependent uninstaller step) — the
  documented manual flow was used instead (dir → stamp → portable +
  manual 7z → makensis). The 272 KB stub from the failed pack run was
  discarded, not shipped.
- During the full-driver MT run, several steps fell back to manual
  chips+Send after "Type it for me" — isolated re-testing proves "Type it
  for me" completes every DHCP step in ~1 s each, so those fallbacks were a
  driver race, not an app bug.
- APK/EXEs are verified structurally (signature, icon, version, payload
  hash); they were not run on a physical phone/PC in this pass.
- The public web artifact still serves the pre-Phase-2 version (unchanged —
  update only if the user asks).

## Evidence in this folder

- `old-mt-failover.png` — the scroll bug reproduced (terminal unreachable).
- `new2-mt-failover.png` (360×740), `new3-mt-failover.png` (390×844) — fixed.
- `mt-{meet,nameip,dhcp,nat,firewall,wifi,queues,failover}-done.png` — done
  modal per lab.
- `audit-about.png`, `audit-cisco-done.png`, `audit-sandbox.png`,
  `retest-cert.png` — audit evidence.
- `play-mt-results.json`, `audit-results.json`, `retest-results.json` —
  machine-readable check logs.

## Addendum — late re-run discrepancy investigated (same day, after packaging)

A background re-run that finished after packaging reported 7/8 MT labs
"STUCK" (meet, nameip, dhcp, nat, wifi, queues at their last step; failover
at step 3). That verdict was re-investigated before delivery instead of
being passed on, and it does NOT hold up — it was a driver flaw, not an
app bug, for three provable reasons:

1. **Last-step progress never changes, even on success.** The progress
   pill is `min(done+1, total)` (renderMtSteps), so a finished lab still
   shows "Step 4 / 4" / "Step 3 / 3". The re-run driver treated "progress
   unchanged" as stuck and never checked the done modal — which is the
   real completion signal. Direct observation confirms it: "Type it for
   me" on Meet step 4 submits the command (visible in the terminal) and
   the `mt-done` modal opens.
2. **Failover step 3 is a 3-command step** (route + NAT ether1 + NAT
   ether2, ~9 s of typing animation) and steps 4–5 require the Cut /
   Repair ISP buttons BEFORE their ping/print commands. A driver that
   waits too briefly and never presses those buttons cannot pass them.
3. **Corrected re-run (fresh browser context per lab, done-modal as the
   completion signal, 20 s typeforme wait, chip+Send fallback, Cut/Repair
   pressed first) passes all 8 labs.** Results in
   `corrected-rerun-results.json` (this folder):

| Lab | Result | Stars | Panel scroll (360×740) |
|---|---|---|---|
| Meet MikroTik | DONE | ★☆☆ | 664 / 1228 |
| A Name & an Address | DONE | ★☆☆ | 664 / 1208 |
| DHCP Server | DONE | ★☆☆ | 664 / 1208 |
| NAT Masquerade | DONE | ★☆☆ | 664 / 1208 |
| Firewall Basics | DONE | ★☆☆ | 664 / 1208 |
| WiFi | DONE | ★☆☆ | 664 / 1208 |
| Simple Queues | DONE | ★☆☆ | 664 / 1208 |
| Dual-WAN Auto-Failover | DONE | ★☆☆ | 664 / 1393 |

   Failover traffic in the corrected run: Cut ISP 1 → "🌐 Traffic:
   ISP 2 🟢"; Repair ISP 1 → "🌐 Traffic: ISP 1 🟢". Stars are ★☆☆
   throughout because "Type it for me" was used (by design, `typed > 0
   → 1`); the earlier saved run's fully-manual Name+IP ★★★ still
   proves manual play earns full stars.

**No app code changed as a result of this investigation**, so no
rebuild was needed: `web-app/index.html` is byte-identical to the
shipped packages (md5 `7c2405bd5a15949caab51f16c025e000`). Re-verified
at addendum time: APK `assets/index.html` hash-matches it exactly;
apksigner verify: v2 ✓, v3 ✓; visible-text scan (base64 image data
stripped) — CubeXS 0, BBA 0, graduation 0, "Technical Lead" exactly
once, inside the approved certificate signature block only.
