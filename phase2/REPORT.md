# Phase 2 — MikroTik Track + Approved Features — REPORT (2026-10-24)

Built into `web-app/index.html` (build watermark updated to 2026-10-24), synced to
`windows-exe/app/index.html`, and shipped as a rebuilt release-signed APK.
Phase 1 (mobile redesign, Save & Resume, progression lock, owner mode) is preserved —
regression-checked below. All work is additive: one extra `<style>`, three new views,
one extra `<script>` (sources kept beside this report: p2-core/mt/mtlabs/mtplay/feat.js).

## Part 1 — MikroTik module
- **RouterOS console** (per-lab + Sandbox): real parser for /interface print, /ip address
  add/print/remove, /ip dhcp-client, /ip dhcp-server setup wizard + add/print, leases,
  /ip firewall nat add (masquerade), /ip firewall filter add, /ip route add/print with
  distance + check-gateway, /ip dns set, /queue simple, /interface wireless (SSID/WPA2),
  /system identity, /user password, /export, ping — output styled like RouterOS.
- **WinBox-style panel** (Interfaces / IP→Addresses, DHCP Client, DHCP Server, NAT,
  Routes, DNS, Firewall / Wireless / Queues / System) sharing the SAME device state —
  verified: an address added in the console appears in the panel (06-winbox.png).
- **8 auto-verified kid-simple labs** (EN + kid + Roman-Urdu step text, tap chips,
  Type-it-for-me, hints, XP/stars): Meet MikroTik (four access doors: WinBox, WebFig
  192.168.88.1, SSH, console), Name+IP, DHCP Server, NAT Masquerade, Firewall, WiFi,
  Simple Queues, ⭐ Dual-WAN Auto-Failover.
- **Failover star lab**: two ISPs, routes distance 1 (check-gateway=ping) + distance 2;
  animated ping; "✂️ Cut ISP 1" visibly switches the traffic badge + topology to ISP 2
  by itself; repair switches back to ISP 1. Step checks are sequential (fixed during
  verification: a later step can no longer pass before its turn). Mid-event evidence:
  07-failover-mid.png (traffic = ISP 2, lab not yet complete), 08-mt-done.png.
- **Sandbox**: 📡 MikroTik tool adds a MikroTik device with the same console + WinBox
  tab. MT labs are their own always-open track — the Cisco progression lock is untouched.

## Part 2 — Approved features (no TTS/read-aloud added — #6 stayed rejected)
1. **Certificate**: full-category completion unlocks a claim form (Name/Email/Contact —
   stored locally only). In-app certificate replicates approved Design A exactly:
   monogram-only transparent logo + faint watermark, name ONLY in the signature block
   and © footer, NO QR/scan box, unique ID (CA-2026-0001…), Issue Date = today,
   Valid Until = +2 years, print/PDF button, then a connect step (LinkedIn for
   professionals, Instagram i.huwaris for students). Evidence: 13-certificate.png.
2. **Urdu Mode**: 🇵🇰/🇬🇧 toggle in the top bar — nav, buttons, home sections, mission
   and MT lab instructions switch English ⇄ Roman Urdu; persisted. 02-home-urdu.png.
3. **Multiple Profiles**: picker on start + 👤 top-bar button; add/switch/delete; each
   profile has its own save slot (XP/labs/position/streak) mirrored from the Phase-1
   save; existing progress became profile "Hero 1"; owner mode RHU-OWNER stays global.
   03-profiles.png.
4. **Daily Mission**: one deterministic quiz question per day on Home, 🔥 streak,
   +20 XP, date rollover. 01-home.png.
5. **Mock Exam**: 30 questions from the full quiz bank + MikroTik questions, 45-minute
   countdown, score + pass/fail (70%), wrong-answer review, best score kept. 10-exam.png.
6. **Progress Card**: canvas card (monogram, profile name, lab, stars, XP, © line) after
   every MT lab and via Home/Cisco completion; downloadable. 09-progress-card.png.

## Verification (headless Chrome, scripted, zero page errors)
- 360×740 AND 390×844: zero horizontal overflow on Home, MT list, MT lab, Cisco Lab 1.
- Console↔WinBox state sync; identity rename changes the prompt to [admin@HeroTik].
- Failover full cycle incl. no-early-completion regression after the sequencing fix.
- Save/Resume regression: reload → ▶ Continue card present, XP + active profile kept.
- Cisco Lab 1 spot check: opens, terminal present (11-cisco-lab1.png).
- Desktop 1280px home: 14-desktop-home.png.
Screenshots: 01-home, 02-home-urdu, 03-profiles, 04-mt-list, 05-ros-console, 06-winbox,
07-failover-mid, 08-mt-done, 09-progress-card, 10-exam, 11-cisco-lab1, 12-home-resumed,
13-certificate, 14-desktop-home, 15-mt-step-390 (all in this folder).

## APK
- Rebuilt with `android-apk/native/build-apk.sh` (JDK 17 + SDK 35 in ~/workspace/tools).
- **Release-signed with the EXISTING keystore** — apksigner: Verifies, v2 ✓, v3 ✓,
  Signer DN "CN=Raja Huwaris Usmani, O=Course Ahead, L=Karachi, ST=Sindh, C=PK",
  **SHA-256 ca1bdaf8f244de4be3307e230bbba42abc971a9d4158e01c9bf3296f95a583c7** —
  identical to Phase 1, so it installs as an update over the current release APK.
- Size: **3,027,501 bytes** → copied to `~/workspace/your_files/ccna-labs-packages/Course-Ahead-CCNA-Labs.apk`.
- Embedded assets/index.html confirmed to be the Phase-2 build (Build: 2026-10-24).

## Honest notes
- Urdu Mode covers UI chrome, home, mission and MikroTik lab steps; Cisco lab step
  bodies remain English (their kid/Roman-Urdu toggle is the pre-existing Kids Mode text).
- Certificate "Issue Date" uses the device's local date (correct PKT date on the user's phone).
- Windows EXEs were NOT rebuilt (per instructions) — only the synced index.html was left
  in windows-exe/app/ for the separate Windows Setup workstream.
