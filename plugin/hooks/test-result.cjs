#!/usr/bin/env node
/**
 * Pokemon Test Result Hook
 * @hook {"event":"PostToolUse","matcher":"Bash","description":"Pokemon reacts to test results"}
 */

const { renderPokemon, readEvent, respond } = require('./pokemon-common.cjs');

const TEST_PATTERNS = /\b(vitest|jest|pytest|npm\s+test|npx\s+vitest|npx\s+jest|cargo\s+test|go\s+test|make\s+test)\b/i;

async function main() {
  const event = await readEvent();
  const cmd = event?.tool_input?.command || '';

  if (!TEST_PATTERNS.test(cmd)) return console.log('{}');

  const result = event?.tool_result || '';
  const resultStr = typeof result === 'string' ? result : JSON.stringify(result);
  const failed = resultStr.includes('FAIL') || resultStr.includes('failed') || resultStr.includes('error') || resultStr.includes('Exit code');

  const context = failed
    ? 'tests just failed — the user is debugging'
    : 'all tests just passed';
  const sprite = renderPokemon('minimal', event, { chance: 0.5 });
  respond('PostToolUse', sprite);
}

main();
