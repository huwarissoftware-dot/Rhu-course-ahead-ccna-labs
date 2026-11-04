// Stamp a Windows .exe with the Course Ahead CCNA Labs identity:
//   - icon  : build/icon.ico (the user's RHU logo, multi-resolution)
//   - version strings: Publisher/Company = Raja Huwaris Usmani, etc.
// Uses resedit (pure JS — no wine/rcedit needed on Linux).
// Usage: node tools/stamp-exe.js <exePath> [icoPath]
const fs = require('fs');
const path = require('path');
const { NtExecutable, NtExecutableResource, Data, Resource } = require('resedit');

const exePath = process.argv[2];
const icoPath = process.argv[3] || path.join(__dirname, '..', 'build', 'icon.ico');
if (!exePath) { console.error('usage: stamp-exe.js <exePath> [icoPath]'); process.exit(1); }

const STRINGS = {
  CompanyName: 'Raja Huwaris Usmani',
  ProductName: 'Course Ahead CCNA Labs',
  FileDescription: 'Course Ahead CCNA Labs — free CCNA labs by Raja Huwaris Usmani',
  LegalCopyright: '© 2026 Raja Huwaris Usmani — All Rights Reserved',
  FileVersion: '1.0.0',
  ProductVersion: '1.0.0',
  InternalName: 'Course Ahead CCNA Labs',
  OriginalFilename: path.basename(exePath),
};

const bin = fs.readFileSync(exePath);
const exe = NtExecutable.from(bin, { ignoreMissingSections: true });
const res = NtExecutableResource.from(exe);

// ---- icon ----
const iconFile = Data.IconFile.from(fs.readFileSync(icoPath));
const iconItems = iconFile.icons.map((i) => i.data);
const groups = Resource.IconGroupEntry.fromEntries(res.entries);
const gid = groups.length ? groups[0].id : 1;
const glang = groups.length ? groups[0].lang : 1033;
Resource.IconGroupEntry.replaceIconsForResource(res.entries, gid, glang, iconItems);

// ---- version info ----
const vis = Resource.VersionInfo.fromEntries(res.entries);
let vi;
if (vis.length) {
  vi = vis[0];
} else {
  vi = Resource.VersionInfo.create({
    lang: 1033,
    fixedInfo: { fileOS: 0x00040004, fileType: 1 },
    strings: [{ lang: 1033, codepage: 1200, values: {} }],
  });
}
const fixed = vi.fixedInfo;
fixed.fileVersionMS = (1 << 16) | 0;
fixed.fileVersionLS = 0;
fixed.productVersionMS = (1 << 16) | 0;
fixed.productVersionLS = 0;
let langs = vi.getAllLanguagesForStringValues();
if (!langs.length) langs = [{ lang: 1033, codepage: 1200 }];
for (const l of langs) {
  const existing = {};
  try { Object.assign(existing, vi.getStringValues(l)); } catch (e) { /* fresh table */ }
  vi.setStringValues(l, Object.assign(existing, STRINGS));
}
vi.outputToResourceEntries(res.entries);

res.outputResource(exe);
const out = Buffer.from(exe.generate());
fs.writeFileSync(exePath, out);
console.log(`stamped ${exePath} (${bin.length} -> ${out.length} bytes)`);
