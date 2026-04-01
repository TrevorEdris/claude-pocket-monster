#!/usr/bin/env node
/**
 * Pokemon Test Result Hook
 * Reacts to test pass/fail after Bash tool completes.
 *
 * @hook {"event":"PostToolUse","matcher":"Bash","description":"Pokemon reacts to test results"}
 */

const { renderPokemon, readEvent, respond } = require('./pokemon-common.js');

const TEST_PATTERNS = /\b(vitest|jest|pytest|npm\s+test|npx\s+vitest|npx\s+jest|cargo\s+test|go\s+test|make\s+test)\b/i;

async function main() {
  const event = await readEvent();
  const cmd = event?.tool_input?.command || '';

  if (!TEST_PATTERNS.test(cmd)) return console.log('{}');

  // Check if the tool result indicates failure
  const result = event?.tool_result || '';
  const resultStr = typeof result === 'string' ? result : JSON.stringify(result);
  const failed = resultStr.includes('FAIL') || resultStr.includes('failed') || resultStr.includes('error') || resultStr.includes('Exit code');

  const mood = failed ? 'sad' : 'happy';
  const sprite = renderPokemon(mood, { chance: 0.5 });
  respond('PostToolUse', sprite);
}

main();
