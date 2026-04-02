#!/usr/bin/env node
// Debug: dump all env vars that might carry auth
const keys = Object.keys(process.env).sort();
for (const k of keys) {
  if (k.includes('CLAUDE') || k.includes('ANTHROPIC') || k.includes('API') || k.includes('TOKEN') || k.includes('AUTH')) {
    const v = process.env[k];
    console.log(`${k}=${v ? v.slice(0, 20) + '...' : '(empty)'}`);
  }
}
