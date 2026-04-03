import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'
import type { SpriteInfo } from './types.js'

const CONFIG_DIR = join(homedir(), '.config', 'claude-pocket-monster')
const SPRITE_CACHE = join(CONFIG_DIR, 'sprite-cache')
const CONFIG_FILE = join(CONFIG_DIR, 'config.json')
const SPRITE_SIZE = 64

// Pokemon data (same as data/pokemon.json)
const POKEMON = [
  { id: 1, name: 'Bulbasaur', rarity: 'common' },
  { id: 2, name: 'Ivysaur', rarity: 'uncommon' },
  { id: 3, name: 'Venusaur', rarity: 'rare' },
  { id: 4, name: 'Charmander', rarity: 'common' },
  { id: 5, name: 'Charmeleon', rarity: 'uncommon' },
  { id: 6, name: 'Charizard', rarity: 'rare' },
  { id: 7, name: 'Squirtle', rarity: 'common' },
  { id: 8, name: 'Wartortle', rarity: 'uncommon' },
  { id: 9, name: 'Blastoise', rarity: 'rare' },
  { id: 373, name: 'Salamence', rarity: 'epic' },
]

const RARITY_WEIGHTS: Record<string, number> = {
  common: 50, uncommon: 25, rare: 15, epic: 7, legendary: 2, mythical: 1,
}

// Mulberry32 PRNG — same implementation as src/roll.ts
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hashString(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/**
 * Read the persisted seed and deterministically roll the same Pokemon
 * that the cpm plugin uses. This avoids shelling out to the CLI
 * (which would generate a new seed in a fresh process).
 */
function rollFromConfig(): { id: number; name: string; shiny: boolean } {
  let seedStr: string
  try {
    const config = JSON.parse(readFileSync(CONFIG_FILE, 'utf8'))
    seedStr = config.seed
  } catch {
    seedStr = `init-${Date.now()}-${Math.random()}`
    mkdirSync(CONFIG_DIR, { recursive: true })
    writeFileSync(CONFIG_FILE, JSON.stringify({ seed: seedStr }, null, 2) + '\n')
  }

  if (!seedStr) {
    seedStr = `init-${Date.now()}-${Math.random()}`
    mkdirSync(CONFIG_DIR, { recursive: true })
    writeFileSync(CONFIG_FILE, JSON.stringify({ seed: seedStr }, null, 2) + '\n')
  }

  const seed = hashString(seedStr)
  const rng = mulberry32(seed)

  // Roll rarity
  const entries = Object.entries(RARITY_WEIGHTS)
  const totalWeight = entries.reduce((sum, [, w]) => sum + w, 0)
  let roll = rng() * totalWeight
  let rarity = 'common'
  for (const [r, weight] of entries) {
    roll -= weight
    if (roll <= 0) { rarity = r; break }
  }

  // Pick from pool
  const pool = POKEMON.filter((p) => p.rarity === rarity)
  const finalPool = pool.length > 0 ? pool : POKEMON.filter((p) => p.rarity === 'common')
  const pokemon = finalPool[Math.floor(rng() * finalPool.length)]!

  const shiny = rng() < 1 / 512

  return { id: pokemon.id, name: pokemon.name, shiny }
}

function ensureDirs(): void {
  mkdirSync(SPRITE_CACHE, { recursive: true })
}

/**
 * Download a Pokemon sprite from PokeAPI if not cached.
 */
function downloadSprite(id: number, shiny: boolean): Buffer {
  ensureDirs()
  const suffix = shiny ? '-shiny' : ''
  const cached = join(SPRITE_CACHE, `${id}${suffix}-${SPRITE_SIZE}.png`)

  if (existsSync(cached)) {
    return readFileSync(cached)
  }

  const url = shiny
    ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${id}.png`
    : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`

  const raw = join(SPRITE_CACHE, `${id}${suffix}-raw.png`)
  execSync(`curl -sL -o "${raw}" "${url}"`, { timeout: 10000 })

  execSync(
    `magick "${raw}" -resize ${SPRITE_SIZE}x${SPRITE_SIZE} -background none -gravity center -extent ${SPRITE_SIZE}x${SPRITE_SIZE} "${cached}"`,
    { timeout: 5000 },
  )

  return readFileSync(cached)
}

/**
 * Load the user's Pokemon sprite using the same seed as the cpm plugin.
 */
export function loadSprite(): SpriteInfo {
  const { id, name, shiny } = rollFromConfig()
  const pngBuffer = downloadSprite(id, shiny)
  return { pokemonId: id, pokemonName: name, pngBuffer, shiny }
}
