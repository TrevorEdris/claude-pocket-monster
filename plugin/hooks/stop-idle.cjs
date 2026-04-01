#!/usr/bin/env node
/**
 * Pokemon Stop/Idle Hook
 * Occasionally shows the Pokemon when the assistant finishes responding.
 * Low probability — just a random idle appearance.
 *
 * @hook {"event":"Stop","matcher":"","description":"Pokemon occasionally appears when assistant stops"}
 */

const { renderPokemon, readEvent, respond } = require('./pokemon-common.cjs');

async function main() {
  await readEvent();
  const sprite = renderPokemon('minimal', { chance: 0.40 });
  respond('Stop', sprite);
}

main();
