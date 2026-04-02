#!/usr/bin/env node
/**
 * Pokemon Dangerous Command Hook
 * Pokemon looks alarmed before destructive operations.
 * Non-blocking — just adds a warning context, doesn't prevent the action.
 *
 * @hook {"event":"PreToolUse","matcher":"Bash","description":"Pokemon reacts to dangerous commands"}
 */

const { renderPokemon, readEvent, respond } = require('./pokemon-common.cjs');

const DANGER_PATTERNS = /\b(rm\s+-rf|reset\s+--hard|push\s+--force|drop\s+table|truncate|checkout\s+\.)\b/i;

async function main() {
  const event = await readEvent();
  const cmd = event?.tool_input?.command || '';

  if (!DANGER_PATTERNS.test(cmd)) return console.log('{}');

  const sprite = renderPokemon('minimal', event);
  respond('PreToolUse', sprite);
}

main();
