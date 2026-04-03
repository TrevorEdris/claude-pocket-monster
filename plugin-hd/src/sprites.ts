import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'
import type { SpriteInfo } from './types.js'

const CONFIG_DIR = join(homedir(), '.config', 'claude-pocket-monster')
const SPRITE_CACHE = join(CONFIG_DIR, 'sprite-cache')
const CONFIG_FILE = join(CONFIG_DIR, 'config.json')
const SPRITE_SIZE = 64

function ensureDirs(): void {
  mkdirSync(SPRITE_CACHE, { recursive: true })
}

/**
 * Read the user's current Pokemon from the shared cpm config.
 */
function loadPokemonConfig(): { seed?: string } {
  try {
    return JSON.parse(readFileSync(CONFIG_FILE, 'utf8'))
  } catch {
    return {}
  }
}

/**
 * Get the Pokemon ID and name by running the cpm CLI.
 * Falls back to Charmander (#4) if anything fails.
 */
function getPokemonFromCLI(): { id: number; name: string; shiny: boolean } {
  try {
    const repoRoot = join(__dirname, '..', '..')
    const output = execSync(`npx tsx "${join(repoRoot, 'src', 'cli.ts')}"`, {
      encoding: 'utf8',
      cwd: repoRoot,
      timeout: 10000,
      stdio: ['pipe', 'pipe', 'pipe'],
    })

    const nameMatch = output.match(/^\s{2}(\w+)\s*$/m)
    const shiny = output.includes('SHINY')

    // Map name to Pokedex ID
    const nameToId: Record<string, number> = {
      Bulbasaur: 1, Ivysaur: 2, Venusaur: 3,
      Charmander: 4, Charmeleon: 5, Charizard: 6,
      Squirtle: 7, Wartortle: 8, Blastoise: 9,
      Salamence: 373,
    }

    const name = nameMatch?.[1] || 'Charmander'
    const id = nameToId[name] || 4

    return { id, name, shiny }
  } catch {
    return { id: 4, name: 'Charmander', shiny: false }
  }
}

/**
 * Download a Pokemon sprite from PokeAPI if not cached.
 * Uses the 96x96 game-style pixel art, resized to 64x64.
 */
function downloadSprite(id: number, shiny: boolean): Buffer {
  ensureDirs()
  const suffix = shiny ? '-shiny' : ''
  const cached = join(SPRITE_CACHE, `${id}${suffix}-${SPRITE_SIZE}.png`)

  if (existsSync(cached)) {
    return readFileSync(cached)
  }

  const variant = shiny ? 'shiny' : 'pokemon'
  const url = shiny
    ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${id}.png`
    : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`

  const raw = join(SPRITE_CACHE, `${id}${suffix}-raw.png`)
  execSync(`curl -sL -o "${raw}" "${url}"`, { timeout: 10000 })

  // Resize to 64x64 with transparent background preserved
  execSync(
    `magick "${raw}" -resize ${SPRITE_SIZE}x${SPRITE_SIZE} -background none -gravity center -extent ${SPRITE_SIZE}x${SPRITE_SIZE} "${cached}"`,
    { timeout: 5000 },
  )

  return readFileSync(cached)
}

/**
 * Load the user's Pokemon sprite, downloading if needed.
 */
export function loadSprite(): SpriteInfo {
  const { id, name, shiny } = getPokemonFromCLI()
  const pngBuffer = downloadSprite(id, shiny)
  return { pokemonId: id, pokemonName: name, pngBuffer, shiny }
}
