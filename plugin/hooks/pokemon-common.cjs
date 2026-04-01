#!/usr/bin/env node
/**
 * Shared utilities for Pokemon hooks.
 */

const { execSync } = require('child_process');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const CLI_PATH = path.join(REPO_ROOT, 'src', 'cli.ts');

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getUserId() {
  try {
    return execSync('whoami', { encoding: 'utf8' }).trim();
  } catch {
    return 'default-user';
  }
}

/**
 * Render the Pokemon sprite.
 * mode: 'minimal' (hook greeting) or 'full' (slash command card)
 * Returns string or null if chance gate fails.
 */
function renderPokemon(mode, opts = {}) {
  const { chance = 1.0 } = opts;
  if (Math.random() > chance) return null;

  try {
    const userId = getUserId();
    const flag = mode === 'minimal' ? '--minimal' : '';
    const output = execSync(`npx tsx "${CLI_PATH}" ${flag} "${userId}"`, {
      encoding: 'utf8',
      cwd: REPO_ROOT,
      timeout: 10000,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return output.trim();
  } catch {
    return null;
  }
}

/**
 * Read stdin JSON event data.
 */
async function readEvent() {
  let input = '';
  for await (const chunk of process.stdin) input += chunk;
  try {
    return JSON.parse(input);
  } catch {
    return {};
  }
}

/**
 * Emit hook response via systemMessage.
 */
function respond(hookEventName, message) {
  if (!message) return console.log('{}');
  console.log(JSON.stringify({ systemMessage: message }));
}

module.exports = { renderPokemon, readEvent, respond, pick };
