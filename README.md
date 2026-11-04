# Course Ahead CCNA Labs

A colorful, kid-friendly Cisco CCNA (200-301 v2.0) hands-on labs application — inspired by modern Packet Tracer, built so **even young kids can learn networking**.

**All labs are FREE and UNLOCKED.** No paywall, no signup.

By **Raja Huwaris Usmani** — Course Ahead (Instagram: i.huwaris)

## What is inside

- **Interactive labs** with step-by-step instructions in very simple English, a friendly guide (Netro the Networking Hero), hints and a "Show Me" button on every step
- **Working Cisco IOS CLI terminals** — a separate real-feeling terminal for every router and every switch (`enable`, `configure terminal`, `interface`, `ip address`, `vlan`, `switchport`, `router ospf`, `ip route`, `ping`, `show ...`)
- **Topology canvas** — modern colorful pictures of routers, switches, PCs and cables; links turn green and packets animate along the wires when you ping
- **Simulated Windows PC** — Run `ncpa.cpl`, open the adapter Properties, set IPv4 address / subnet mask / gateway / DNS exactly like real Windows, plus a working Command Prompt (`ipconfig`, `ping`, `tracert`)
- **Auto verification** — a progress bar fills as you type correct commands; Verify checks every objective with ticks and awards stars
- **Modes** — Kids Mode (extra simple, story style) and Normal Mode (standard CCNA wording), Challenge Mode (instructions hidden), free Sandbox, Troubleshooting tickets, and CCNA Quiz modules

## Lab categories (full CCNA 200-301 v2.0 syllabus)

| Folder | Category |
|---|---|
| `labs-data/layer2-switching/` | VLANs, trunks, EtherChannel, STP/RSTP, port security |
| `labs-data/ip-routing/` | Static routing, router-on-a-stick, OSPF, default routes |
| `labs-data/security-acl/` | Passwords, SSH, standard & extended ACLs, Layer 2 security |
| `labs-data/nat-dhcp-services/` | DHCP server/relay, NAT/PAT, DNS, NTP |
| `labs-data/ipv6/` | IPv6 addressing, static routes, OSPFv3 |
| `labs-data/troubleshooting/` | Pre-broken networks to find and fix (wrong gateway, duplicate IP, shutdown port, mask error...) |

## Repository layout — every part built separately

```
ccna-labs-app/
├── web-app/        # The web application (source + built site)
├── windows-exe/    # Windows .EXE packaging (Electron) — see windows-exe/BUILD.md
├── android-apk/    # Android .APK packaging (Capacitor) — see android-apk/BUILD.md
├── labs-data/      # Lab definitions, one structured file per lab, by category
├── assets/devices/ # Modern device pictures (router, switch, PC, cables)
└── docs/           # Syllabus checklist and lab catalogue
```

## Run the web app

Open `web-app/` build output in any modern browser — it works fully offline.

## Build the EXE and APK

- Windows: follow `windows-exe/BUILD.md`
- Android: follow `android-apk/BUILD.md`

Both wrap the **same** web app, so labs stay identical on web, PC and phone.

## License / content note

All lab text, stories and artwork in this repository are original Course Ahead content.
Cisco, CCNA and Packet Tracer are trademarks of Cisco Systems, Inc.; this is an independent educational project, not affiliated with Cisco.

## Logo (placeholder — owner to provide)

The official logo will be provided by the app owner (Raja Huwaris Usmani). Until
then every surface uses a simple dashed "LOGO" placeholder — no designed logo or
icon has been finalized. When the logo arrives, swap it in at exactly these slots:

1. **Web app** — `web-app/index.html`: replace the `.logo-slot` span in the top bar
   (marked with a `LOGO PLACEHOLDER` comment) with an `<img>` and put the file at
   `web-app/assets/logo.png`.
2. **Windows EXE** — set the same file as the app icon in the Electron/Tauri
   config (see `windows-exe/BUILD.md`, icon step).
3. **Android APK** — place the logo in the Capacitor/Android mipmap icon slots
   (see `android-apk/BUILD.md`, icon step).
4. **This README** — add the logo image at the top.
