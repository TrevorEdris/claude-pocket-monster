import type { Eye, PokemonEntry, PokemonRoll, Rarity } from './types.js'
import { EYES, RARITY_WEIGHTS } from './types.js'
import pokemonData from '../data/pokemon.json' with { type: 'json' }

const SALT = 'pocket-monster-2026'
const SHINY_THRESHOLD = 1 / 512

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

function pick<T>(arr: T[], rng: () => number): T {
  return arr[Math.floor(rng() * arr.length)]!
}

function rollRarity(rng: () => number): Rarity {
  const entries = Object.entries(RARITY_WEIGHTS) as [Rarity, number][]
  const totalWeight = entries.reduce((sum, [, w]) => sum + w, 0)
  let roll = rng() * totalWeight
  for (const [rarity, weight] of entries) {
    roll -= weight
    if (roll <= 0) return rarity
  }
  return entries[entries.length - 1]![0]
}

function getPokemonPool(): PokemonEntry[] {
  return pokemonData as PokemonEntry[]
}

export function roll(userId: string): PokemonRoll {
  const seed = hashString(userId + SALT)
  const rng = mulberry32(seed)

  const rarity = rollRarity(rng)
  const pool = getPokemonPool().filter((p) => p.rarity === rarity)

  // If no Pokemon match the rolled rarity (e.g., legendary/mythical in PoC), fall back to common
  const finalPool = pool.length > 0 ? pool : getPokemonPool().filter((p) => p.rarity === 'common')
  const pokemon = pick(finalPool, rng)

  const shiny = rng() < SHINY_THRESHOLD
  const eye = pick(EYES, rng)

  return { pokemon, shiny, eye }
}

// Exported for testing
export { mulberry32, hashString, rollRarity, pick }
