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
 * Generate a quip from the Pokemon using Haiku, given raw session context.
 */
function generateQuip(pokemonName, pokemonTypes, context) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return `${pokemonName} appeared!`;

  const prompt = `You are ${pokemonName}, a ${pokemonTypes}-type Pokemon companion sitting in a developer's terminal. Here's what just happened:\n\n${context}\n\nGenerate ONE short quip (under 60 chars, no quotes, no emoji) reacting to this. Be playful. Just the quip, nothing else.`;

  try {
    const body = JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 60,
      messages: [{ role: 'user', content: prompt }],
    });

    const result = execSync(`curl -s -X POST https://api.anthropic.com/v1/messages \
      -H "content-type: application/json" \
      -H "x-api-key: ${apiKey}" \
      -H "anthropic-version: 2023-06-01" \
      -d '${body.replace(/'/g, "'\\''")}'`, {
      encoding: 'utf8',
      timeout: 5000,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    const parsed = JSON.parse(result);
    const text = parsed?.content?.[0]?.text?.trim();
    if (text && text.length < 80) return text;
  } catch {
    // fall through
  }

  return `${pokemonName} appeared!`;
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
