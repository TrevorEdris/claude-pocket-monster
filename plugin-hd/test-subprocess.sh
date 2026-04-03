#!/bin/bash
# Simulate how statusLine works: run as a subprocess writing to discovered TTY.
# Run this FROM GHOSTTY directly.

echo "My PID: $$"
echo "My TTY: $(tty)"
echo ""

# Run a node subprocess that discovers TTY and writes Kitty graphics
node -e "
const { execSync } = require('child_process');
const { openSync, writeSync, closeSync, readFileSync } = require('fs');
const { join } = require('path');
const { homedir, tmpdir } = require('os');

// Discover TTY by walking process tree (same as tty.ts)
const psOut = execSync('ps -o pid=,ppid=,tty= -ax', { encoding: 'utf8' });
const procs = new Map();
for (const line of psOut.split('\n')) {
  const p = line.trim().split(/\s+/);
  if (p.length >= 2) {
    const pid = parseInt(p[0], 10);
    const ppid = parseInt(p[1], 10);
    const tty = p[2] || '';
    if (!isNaN(pid)) procs.set(pid, { ppid, tty });
  }
}

let current = process.ppid;
let ttyPath = null;
for (let i = 0; i < 15 && current > 1; i++) {
  const info = procs.get(current);
  if (!info) break;
  if (info.tty && info.tty !== '??' && info.tty !== '-') {
    ttyPath = info.tty.startsWith('/dev/') ? info.tty : '/dev/' + info.tty;
    break;
  }
  current = info.ppid;
}

if (!ttyPath) {
  console.log('ERROR: No TTY found');
  process.exit(1);
}
console.log('Discovered TTY:', ttyPath);

// Load sprite
const sprite = readFileSync(join(homedir(), '.config/claude-pocket-monster/sprite-cache/7-64.png'));
const b64 = sprite.toString('base64');
console.log('Sprite base64 length:', b64.length);

// Write Kitty protocol to discovered TTY
const fd = openSync(ttyPath, 'w');
const data = '\x1b[s\x1b[3;5H\x1b_Ga=T,f=100,t=d,i=77,q=2;' + b64 + '\x1b\\\\\x1b[u';
writeSync(fd, data);
closeSync(fd);
console.log('Wrote', data.length, 'bytes to', ttyPath);
console.log('Look for Squirtle at row 3, col 5');
"
