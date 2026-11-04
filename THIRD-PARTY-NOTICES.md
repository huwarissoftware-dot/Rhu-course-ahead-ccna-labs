# Third-Party Notices — Course Ahead CCNA Labs

This app is an original, from-scratch pure simulator (own device state machines +
an original Cisco IOS-subset teaching parser). No Cisco IOS images, Packet Tracer
files/artwork, NetAcad text, or exam-dump content are included anywhere.

Design/format inspiration and legally reusable patterns, with thanks:

- c4geeks/ccna-labs (MIT) — per-lab folder format (README + per-device config +
  topology.json) used as the model for `labs-data/`; topics cross-checked.
- YJDoc2/Network-Simulator (Apache-2.0 / MIT) — in-browser simulator + step/play
  packet-animation pattern.
- CS4G Netsim (MIT, code only; its Flaticon images are NOT used) — fixed,
  kid-friendly scenario pattern.
- AboodiAbdo/CCNA_200-301_Lab_Guide_Full (MIT) — lab topic cross-check.
- xterm.js (MIT) — web-terminal UX pattern. React Flow / Cytoscape.js / Drawflow
  (MIT) — topology-canvas interaction patterns. Tabler Icons (MIT) — icon style
  reference for our own hand-drawn device SVGs.
- Quiz JSON schema shape {question, options[], correct, category, explanation}
  follows the community cisco-ccna-examtest format; every question in this repo
  is original Course Ahead wording.
- Packaging routes: Electron or Tauri (MIT/Apache-2.0) for Windows, Capacitor
  (MIT) for Android.

Reference only (no code, text, or assets reused): GNS3, PTAnywhere, NetLab,
SwitchLab, Networkers Home simulators, BuildTheNet, Cisco Packet Tracer.

Netro the Networking Hero is an original Course Ahead character.
