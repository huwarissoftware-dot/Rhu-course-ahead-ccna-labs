# Open-Source Help — What We Reuse, What We Only Study

Researched 2026-10-23 from GitHub / the open web for the Course Ahead CCNA Labs app.
Rule: this app is a **pure simulator written from scratch** (own device state + small Cisco IOS-subset parser).
Big simulators (GNS3, Kathará, Containerlab) are emulators that need proprietary Cisco IOS images — a blocker for a free offline kids' app — so they are reference only.

## Reusable with attribution (keep a THIRD-PARTY-NOTICES file in this repo)

| Project | License (as shown on repo) | What we take |
|---|---|---|
| c4geeks/ccna-labs | MIT | Lab format: per-lab folder = README (topology + addressing) + paste-ready config .txt per device + topology.json; topic cross-check for 19 labs (VLAN/trunk, EtherChannel, STP, static v4/v6, OSPF, router-on-a-stick, HSRP, NAT/PAT, DHCP, NTP, SNMP/syslog, DNS) |
| YJDoc2/Network-Simulator | Apache-2.0 OR MIT | 100% in-browser pure simulator pattern: step/play packet animation, JSON save/load |
| CS4G Netsim | MIT (code only; its Flaticon images excluded) | Fixed scenarios for school kids pattern |
| AboodiAbdo/CCNA_200-301_Lab_Guide_Full | MIT | Lab topic cross-check |
| xterm.js | MIT | Terminal component pattern (we write the IOS parser ourselves) |
| React Flow / Cytoscape.js / Drawflow | MIT | Topology canvas patterns |
| Tabler Icons | MIT | Base for drawing our OWN device SVGs |
| Tauri | MIT / Apache-2.0 | Windows EXE packaging option |
| Capacitor | MIT | Android APK packaging |
| Z-eq/cisco-ccna-examtest | NO license file — README claims MIT | Quiz JSON schema only `{question, options[], correct, category, explanation}`; questions must be our own originals |

## Reference only (patterns/ideas — no code, text or assets copied)

- SwitchLab — guided path, contextual tutor, lab verification, shareable lab files
- Networkers Home simulators — GitHub repos are README-only (no code/license; "free for educational and personal use, commercial use requires permission"). Study live features only: IOS CLI scenarios, Packet Flow OSI-layer encapsulation view, MAC learning, NAT rewrite view; CLI behaviours: `?` help, TAB completion, abbreviations, `|` modifiers
- GNS3 / Kathará / ENS (GPL-3.0), PTAnywhere (license unclear; remote-controls real Packet Tracer), Connected Dots, nuLAB
- UX patterns: Duolingo (path map, XP, streaks), Khan Academy Kids (mascot celebration, reward accumulation), Brilliant (learn-by-doing, hint ladders), TryHackMe (rooms with auto-ticking task checklists), Cybrary (skill-gap routing), Cisco Skills for All (module badges)

## Must NOT copy

Cisco IOS images, Packet Tracer binaries/artwork/.pkt content, NetAcad text, Cisco logos, exam-dump content, GoJS (commercial), GNS3 GPL device symbols, draw.io stencil sets, any platform's mascot/sounds/badge artwork. Netro is our own original mascot.

## Cisco official resources (link in the app, never copy)

- Packet Tracer: skillsforall.com (free NetAcad account)
- DevNet Sandbox: developer.cisco.com/sandbox
- Official 200-301 exam topics: Cisco Learning Network
