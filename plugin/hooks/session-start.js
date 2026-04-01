#!/usr/bin/env node
/**
 * Pokemon Session Start Hook
 * Shows the user's Pokemon companion when a session begins.
 *
 * @hook {"event":"UserPromptSubmit","matcher":"","description":"Shows Pokemon on first prompt of session"}
 */

const fs = require('fs');
const path = require('path');
const { renderPokemon, readEvent, respond } = require('./pokemon-common.js');

const STATE_FILE = path.join(require('os').tmpdir(), 'pokemon-session-shown.json');
const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes — treat as new session after this

function isNewSession() {
  try {
    const data = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    const elapsed = Date.now() - data.lastShown;
    return elapsed > SESSION_TTL_MS;
  } catch {
    return true;
  }
}

function markShown() {
  fs.writeFileSync(STATE_FILE, JSON.stringify({ lastShown: Date.now() }));
}

async function main() {
  await readEvent();

  if (!isNewSession()) {
    // Not first prompt — use idle hook instead (low chance)
    const sprite = renderPokemon('idle', { chance: 0.08 });
    return respond('UserPromptSubmit', sprite);
  }

  markShown();
  const sprite = renderPokemon('happy');
  respond('UserPromptSubmit', sprite);
}

main();
