// Inspect a Windows .exe: dump icon-group sizes and version strings.
// Optionally export the embedded icon as an .ico for pixel comparison.
// Usage: node tools/inspect-exe.js <exePath> [--icon-out <file.ico>]
const fs = require('fs');
const { NtExecutable, NtExecutableResource, Data, Resource } = require('resedit');

const exePath = process.argv[2];
const iconOutIdx = process.argv.indexOf('--icon-out');
const iconOut = iconOutIdx >= 0 ? process.argv[iconOutIdx + 1] : null;

const exe = NtExecutable.from(fs.readFileSync(exePath), { ignoreMissingSections: true });
const res = NtExecutableResource.from(exe);

const groups = Resource.IconGroupEntry.fromEntries(res.entries);
console.log(`icon groups: ${groups.length}`);
for (const g of groups) {
  const items = g.getIconItemsFromEntries(res.entries);
  const dims = items.map((it) => {
    const w = it.width != null ? it.width : (it.bitmapInfo ? it.bitmapInfo.width : '?');
    const h = it.height != null ? it.height : (it.bitmapInfo ? Math.abs(it.bitmapInfo.height) / 2 : '?');
    return `${w}x${h}`;
  });
  console.log(`  group id=${g.id} lang=${g.lang}: [${dims.join(', ')}]`);
  if (iconOut) {
    const f = new Data.IconFile();
    for (const it of items) f.icons.push({ data: it });
    fs.writeFileSync(iconOut, Buffer.from(f.generate()));
    console.log(`  icon exported -> ${iconOut}`);
  }
}

for (const vi of Resource.VersionInfo.fromEntries(res.entries)) {
  for (const l of vi.getAllLanguagesForStringValues()) {
    const values = vi.getStringValues(l);
    console.log(`version strings (lang=${l.lang}):`);
    for (const [k, v] of Object.entries(values)) console.log(`  ${k}: ${v}`);
  }
  const fi = vi.fixedInfo;
  const fv = `${fi.fileVersionMS >>> 16}.${fi.fileVersionMS & 0xffff}.${fi.fileVersionLS >>> 16}.${fi.fileVersionLS & 0xffff}`;
  console.log(`  fixed FileVersion: ${fv}`);
}
