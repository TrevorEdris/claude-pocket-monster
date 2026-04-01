#!/usr/bin/env node
/**
 * Pokemon Git Commit Hook
 * Celebrates after a successful git commit.
 *
 * @hook {"event":"PostToolUse","matcher":"Bash","description":"Pokemon celebrates git commits"}
 */

const { renderPokemon, readEvent, respond } = require('./pokemon-common.cjs');

async function main() {
  const event = await readEvent();
  const cmd = event?.tool_input?.command || '';

  if (!cmd.includes('git commit')) return console.log('{}');

  const result = event?.tool_result || '';
  const resultStr = typeof result === 'string' ? result : JSON.stringify(result);
  const success = !resultStr.includes('error') && !resultStr.includes('Exit code');

  if (!success) return console.log('{}');

  const sprite = renderPokemon('minimal', { chance: 0.6 });
  respond('PostToolUse', sprite);
}

main();
