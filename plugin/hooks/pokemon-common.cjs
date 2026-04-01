#!/usr/bin/env node
/**
 * Shared utilities for Pokemon hooks.
 * Renders the user's Pokemon sprite with optional reaction context.
 */

const { execSync } = require('child_process');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const CLI_PATH = path.join(REPO_ROOT, 'src', 'cli.ts');

// Reactions: mood + message pairs
const REACTIONS = {
  idle: [
    '...', '*yawn*', '♪', 'zzz', '~', '!',
  ],
  happy: [
    '!!', '♪♪♪', ':D', '!!!', '*dance*', 'woo!',
  ],
  sad: [
    '...', ':(', '*sigh*', 'oh no', '...',
  ],
  alarmed: [
    '?!', 'WAIT', '!!!', '*panic*', 'O_O',
  ],
  proud: [
    '*flex*', 'nice!', ':)', 'heh', '*nod*',
  ],
};

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
 * Render the Pokemon sprite with a reaction bubble.
 * Returns the string to output, or null if nothing to show.
 */
function renderPokemon(mood, opts = {}) {
  const { chance = 1.0 } = opts;

  // Random chance gate
  if (Math.random() > chance) return null;

  try {
    const userId = getUserId();
    const output = execSync(`npx tsx "${CLI_PATH}" "${userId}"`, {
      encoding: 'utf8',
      cwd: REPO_ROOT,
      timeout: 10000,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    const reaction = pick(REACTIONS[mood] || REACTIONS.idle);
    return `${output.trim()}\n\n  "${reaction}"`;
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
 * Emit hook response. Outputs the sprite as plain stdout so it appears
 * directly in the transcript (exit 0 = stdout shown to user).
 * Falls back to empty JSON if nothing to show.
 */
function respond(hookEventName, message) {
  if (!message) return console.log('{}');
  // Plain text to stdout — appears directly in the transcript
  // without Claude summarizing/interpreting it
  process.stdout.write(message + '\n');
}

module.exports = { renderPokemon, readEvent, respond, pick, REACTIONS };
