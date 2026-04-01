#!/usr/bin/env node
/**
 * Pokemon Session Start Hook
 * Shows the user's Pokemon companion when a session begins.
 *
 * @hook {"event":"SessionStart","matcher":"","description":"Shows Pokemon on session start"}
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const LOG_FILE = path.join(os.tmpdir(), 'pokemon-hook-debug.log');

function log(msg) {
  const ts = new Date().toISOString();
  fs.appendFileSync(LOG_FILE, `[${ts}] session-start: ${msg}\n`);
}

try {
  log('Hook started');
  const { renderPokemon, readEvent, respond } = require('./pokemon-common.cjs');

  const STATE_FILE = path.join(os.tmpdir(), 'pokemon-session-shown.json');
  const SESSION_TTL_MS = 30 * 60 * 1000;

  function isNewSession() {
    try {
      const data = JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
      const elapsed = Date.now() - data.lastShown;
      log(`Last shown ${elapsed}ms ago, TTL=${SESSION_TTL_MS}`);
      return elapsed > SESSION_TTL_MS;
    } catch (e) {
      log(`No state file or parse error: ${e.message}`);
      return true;
    }
  }

  function markShown() {
    fs.writeFileSync(STATE_FILE, JSON.stringify({ lastShown: Date.now() }));
  }

  async function main() {
    log('Reading event from stdin...');
    const event = await readEvent();
    const hookEvent = event?.hook_event_name || 'unknown';
    log(`Event: ${hookEvent} — ${JSON.stringify(event).slice(0, 200)}`);

    if (hookEvent === 'SessionStart') {
      // Always show on session start — no rate limiting
      log('SessionStart event — always rendering');
      markShown();
      const sprite = renderPokemon('minimal');
      log(`Sprite: ${sprite ? `${sprite.length} chars` : 'null'}`);
      respond('SessionStart', sprite);
      return log('Done');
    }

    // UserPromptSubmit — rate limited idle appearance
    const newSession = isNewSession();
    log(`New session: ${newSession}`);

    if (!newSession) {
      log('Not new session, rolling idle (8% chance)');
      const sprite = renderPokemon('minimal', { chance: 0.40 });
      log(`Idle sprite: ${sprite ? 'yes' : 'null'}`);
      return respond('UserPromptSubmit', sprite);
    }

    markShown();
    log('First prompt — rendering happy sprite...');
    const sprite = renderPokemon('minimal');
    log(`Happy sprite: ${sprite ? `${sprite.length} chars` : 'null'}`);
    respond('UserPromptSubmit', sprite);
    log('Done');
  }

  main().catch(e => {
    log(`Error in main: ${e.message}\n${e.stack}`);
    console.log('{}');
  });
} catch (e) {
  const fs2 = require('fs');
  const os2 = require('os');
  const path2 = require('path');
  fs2.appendFileSync(
    path2.join(os2.tmpdir(), 'pokemon-hook-debug.log'),
    `[${new Date().toISOString()}] FATAL: ${e.message}\n${e.stack}\n`
  );
  console.log('{}');
}
