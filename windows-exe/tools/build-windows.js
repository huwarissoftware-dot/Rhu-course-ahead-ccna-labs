// Build the Windows packages on this Linux machine.
//   PHASE=dir   -> electron-builder --win --dir        (dist/win-unpacked)
//   PHASE=pack  -> electron-builder --win nsis portable --prepackaged dist/win-unpacked
// The committed package.json keeps "signAndEditExecutable": true so Windows /
// GitHub Actions builds stamp the exe natively via rcedit. Locally (no wine)
// we disable electron-builder's own editing and stamp resources afterwards
// with tools/stamp-exe.js (resedit, pure JS, NSIS-overlay safe).
const path = require('path');
const fs = require('fs');
const { build, Platform, Arch } = require('electron-builder');

const projectDir = path.join(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(projectDir, 'package.json'), 'utf8'));
const cfg = JSON.parse(JSON.stringify(pkg.build));
cfg.win.signAndEditExecutable = false; // local override only; resedit stamps instead

async function main() {
  const phase = process.env.PHASE || 'dir';
  if (phase === 'dir') {
    await build({
      projectDir,
      config: cfg,
      targets: Platform.WINDOWS.createTarget('dir', Arch.x64),
    });
    console.log('DIR BUILD OK');
  } else if (phase === 'pack') {
    await build({
      projectDir,
      config: cfg,
      prepackaged: path.join(projectDir, 'dist', 'win-unpacked'),
      targets: Platform.WINDOWS.createTarget(['nsis', 'portable'], Arch.x64),
    });
    console.log('PACK BUILD OK');
  } else if (phase === 'portable') {
    await build({
      projectDir,
      config: cfg,
      prepackaged: path.join(projectDir, 'dist', 'win-unpacked'),
      targets: Platform.WINDOWS.createTarget(['portable'], Arch.x64),
    });
    console.log('PORTABLE BUILD OK');
  } else {
    throw new Error('unknown PHASE ' + phase);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
