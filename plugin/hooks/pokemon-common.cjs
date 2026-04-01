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
 * Get Pokemon name/types from the deterministic roll.
 */
function getPokemonInfo() {
  try {
    const userId = getUserId();
    const output = execSync(`npx tsx "${CLI_PATH}" "${userId}"`, {
      encoding: 'utf8', cwd: REPO_ROOT, timeout: 10000,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    const nameMatch = output.match(/^\s{2}(\w+)\s*$/m);
    const typeMatch = output.match(/(?:COMMON|UNCOMMON|RARE|EPIC|LEGENDARY|MYTHICAL)\s+([\w/]+)/);
    return {
      name: nameMatch ? nameMatch[1] : 'Pokemon',
      types: typeMatch ? typeMatch[1] : 'Normal',
    };
  } catch {
    return { name: 'Pokemon', types: 'Normal' };
  }
}

/**
 * Generate a quip. Tries Haiku via Claude CLI in background, falls back to
 * a curated pool keyed by context type. The pool keeps it snappy (no latency)
 * while still varying across appearances.
 */
const QUIP_POOL = {
  session_start: [
    name => `${name} is ready to code`,
    name => `${name} reporting for duty`,
    name => `${name} stretches and yawns`,
    name => `Let's get to work, says ${name}`,
    name => `${name} boots up alongside you`,
    name => `${name} shakes off sleep`,
  ],
  user_prompt: [
    name => `${name} perks up`,
    name => `${name} tilts head curiously`,
    name => `${name} watches intently`,
    name => `${name} nods along`,
    name => `Interesting, thinks ${name}`,
    name => `${name} leans in`,
  ],
  test_pass: [
    name => `${name} does a little dance`,
    name => `All green, ${name} approves`,
    name => `${name} high-fives the terminal`,
    name => `${name} puffs up proudly`,
    name => `Clean run, ${name} is pleased`,
  ],
  test_fail: [
    name => `${name} winces`,
    name => `${name} looks away awkwardly`,
    name => `Oof, ${name} felt that one`,
    name => `${name} offers moral support`,
    name => `${name} believes in you`,
  ],
  commit: [
    name => `${name} stamps it with approval`,
    name => `Another one in the books, says ${name}`,
    name => `${name} nods respectfully`,
    name => `Shipped, thinks ${name}`,
    name => `${name} watches the diff scroll by`,
  ],
  push: [
    name => `${name} waves goodbye to the code`,
    name => `Off it goes, says ${name}`,
    name => `${name} watches it fly to remote`,
    name => `${name} salutes the push`,
  ],
  danger: [
    name => `${name} flinches`,
    name => `${name} hides behind the terminal`,
    name => `Are you sure about that, asks ${name}`,
    name => `${name} backs away slowly`,
  ],
  idle: [
    name => `${name} is just vibing`,
    name => `${name} stares into the void`,
    name => `${name} scratches behind its ear`,
    name => `${name} yawns`,
    name => `${name} taps a claw idly`,
    name => `${name} is still here`,
  ],
};

function generateQuip(pokemonName, pokemonTypes, context) {
  // Determine context type from the raw context string
  let pool = QUIP_POOL.idle;
  if (context.includes('session just started') || context.includes('greeting')) {
    pool = QUIP_POOL.session_start;
  } else if (context.includes('user typed') || context.includes('user just said')) {
    pool = QUIP_POOL.user_prompt;
  } else if (context.includes('passed') || context.includes('Tests:')) {
    pool = QUIP_POOL.test_pass;
  } else if (context.includes('FAIL') || context.includes('failed') || context.includes('error')) {
    pool = QUIP_POOL.test_fail;
  } else if (context.includes('git commit') || context.includes('committed')) {
    pool = QUIP_POOL.commit;
  } else if (context.includes('git push') || context.includes('pushed')) {
    pool = QUIP_POOL.push;
  } else if (context.includes('rm') || context.includes('force') || context.includes('reset')) {
    pool = QUIP_POOL.danger;
  }

  const quipFn = pick(pool);
  return quipFn(pokemonName);
}

/**
 * Build context string from the raw hook event data.
 */
function buildContext(event) {
  const parts = [];
  const hookEvent = event?.hook_event_name || '';

  if (hookEvent === 'SessionStart') {
    parts.push('A new coding session just started.');
  }

  if (event?.user_prompt) {
    parts.push(`The user typed: "${event.user_prompt.slice(0, 120)}"`);
  }

  if (event?.tool_name) {
    parts.push(`Tool used: ${event.tool_name}`);
  }

  if (event?.tool_input?.command) {
    parts.push(`Command: ${event.tool_input.command.slice(0, 120)}`);
  }

  if (event?.tool_result) {
    const r = typeof event.tool_result === 'string'
      ? event.tool_result : JSON.stringify(event.tool_result);
    parts.push(`Output (truncated): ${r.slice(0, 200)}`);
  }

  if (event?.reason) {
    parts.push(`Stop reason: ${event.reason}`);
  }

  return parts.join('\n') || 'idle moment';
}

/**
 * Render the Pokemon sprite with a Haiku-generated quip.
 * Returns string or null if chance gate fails.
 */
function renderPokemon(mode, event, opts = {}) {
  const { chance = 1.0 } = opts;
  if (Math.random() > chance) return null;

  try {
    const userId = getUserId();
    const flag = mode === 'minimal' ? '--minimal' : '';
    const output = execSync(`npx tsx "${CLI_PATH}" ${flag} "${userId}"`, {
      encoding: 'utf8', cwd: REPO_ROOT, timeout: 10000,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    if (mode === 'minimal') {
      const info = getPokemonInfo();
      const context = buildContext(event);
      const quip = generateQuip(info.name, info.types, context);
      const lines = output.trim().split('\n');
      lines[0] = quip;
      return lines.join('\n');
    }

    return output.trim();
  } catch {
    return null;
  }
}

async function readEvent() {
  let input = '';
  for await (const chunk of process.stdin) input += chunk;
  try { return JSON.parse(input); } catch { return {}; }
}

function respond(hookEventName, message) {
  if (!message) return console.log('{}');
  console.log(JSON.stringify({ systemMessage: message }));
}

module.exports = { renderPokemon, readEvent, respond, pick, generateQuip, buildContext };
