/**
 * Minimal Electron smoke test:
 * Spawns the app and quits as soon as Electron signals ready.
 */
const { spawn } = require('node:child_process');
const path = require('node:path');

const electronBin = path.resolve(
  __dirname,
  '..',
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'electron.cmd' : 'electron'
);

const child = spawn(electronBin, ['.'], {
  env: {
    ...process.env,
    ELECTRON_SMOKE: '1',
    ELECTRON_ENABLE_LOGGING: '1',
    ELECTRON_DISABLE_SECURITY_WARNINGS: '1',
  },
  stdio: ['ignore', 'pipe', 'pipe'],
});

let sawReady = false;

child.stdout.on('data', (buf) => {
  const s = buf.toString();
  process.stdout.write(s);
  if (s.includes('[smoke] app ready')) {
    sawReady = true;
  }
});

child.stderr.on('data', (buf) => process.stderr.write(buf));

child.on('exit', (code) => {
  if (sawReady && code === 0) {
    process.exit(0);
  } else {
    process.exit(code || 1);
  }
});

child.on('error', (err) => {
  console.error('Failed to start Electron:', err);
  process.exit(1);
});
