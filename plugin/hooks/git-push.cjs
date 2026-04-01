#!/usr/bin/env node
/**
 * Pokemon Git Push Hook
 * Big celebration after pushing code.
 *
 * @hook {"event":"PostToolUse","matcher":"Bash","description":"Pokemon celebrates git push"}
 */

const { renderPokemon, readEvent, respond } = require('./pokemon-common.cjs');

async function main() {
  const event = await readEvent();
  const cmd = event?.tool_input?.command || '';

  if (!cmd.includes('git push')) return console.log('{}');

  // Always show for pushes — it's a big moment
  const sprite = renderPokemon('minimal');
  respond('PostToolUse', sprite);
}

main();
