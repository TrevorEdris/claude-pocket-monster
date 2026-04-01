import { roll } from './roll.js'
import { loadSprite, renderSprite } from './sprites.js'
import { wrapShiny } from './rainbow.js'
import type { Rarity, PokemonEntry } from './types.js'

const userId = process.argv[2] || 'default-user'
const result = roll(userId)
const sprite = loadSprite(result.pokemon.id, result.pokemon.name)

const BOX_WIDTH = 48
const INNER = BOX_WIDTH - 2 // inside borders

const RARITY_LABELS: Record<Rarity, string> = {
  common: 'COMMON',
  uncommon: 'UNCOMMON',
  rare: 'RARE',
  epic: 'EPIC',
  legendary: 'LEGENDARY',
  mythical: 'MYTHICAL',
}

const TYPE_LABELS: Record<string, string> = {
  fire: 'FIRE', water: 'WATER', grass: 'GRASS', poison: 'POISON',
  flying: 'FLYING', dragon: 'DRAGON', normal: 'NORMAL', electric: 'ELECTRIC',
  ice: 'ICE', fighting: 'FIGHTING', ground: 'GROUND', psychic: 'PSYCHIC',
  bug: 'BUG', rock: 'ROCK', ghost: 'GHOST', dark: 'DARK', steel: 'STEEL', fairy: 'FAIRY',
}

function pad(s: string, width: number): string {
  return s + ' '.repeat(Math.max(0, width - s.length))
}

function center(s: string, width: number): string {
  const left = Math.floor((width - s.length) / 2)
  const right = width - s.length - left
  return ' '.repeat(Math.max(0, left)) + s + ' '.repeat(Math.max(0, right))
}

function statBar(label: string, value: number, maxVal: number = 255): string {
  const barWidth = 10
  const filled = Math.round((value / maxVal) * barWidth)
  const bar = '\u2588'.repeat(filled) + '\u2591'.repeat(barWidth - filled)
  const valStr = String(value).padStart(3)
  return `  ${label.padEnd(8)} ${bar}  ${valStr}`
}

function renderCard(p: PokemonEntry, shiny: boolean, eye: string, spriteLines: string[]): string {
  const lines: string[] = []
  const rarityLabel = (shiny ? '\u2728 SHINY ' : '\u2605 ') + RARITY_LABELS[p.rarity]
  const typeStr = p.types.map(t => TYPE_LABELS[t] || t.toUpperCase()).join('/')

  // Top border
  lines.push('\u256d' + '\u2500'.repeat(INNER) + '\u256e')

  // Empty line
  lines.push('\u2502' + ' '.repeat(INNER) + '\u2502')

  // Rarity + type header
  lines.push('\u2502' + ' ' + pad(rarityLabel, INNER - typeStr.length - 2) + typeStr + ' ' + '\u2502')

  // Empty line
  lines.push('\u2502' + ' '.repeat(INNER) + '\u2502')

  // Sprite (centered)
  for (const sl of spriteLines) {
    lines.push('\u2502' + center(sl, INNER) + '\u2502')
  }

  // Empty line
  lines.push('\u2502' + ' '.repeat(INNER) + '\u2502')

  // Pokemon name
  lines.push('\u2502' + '  ' + pad(p.name, INNER - 2) + '\u2502')

  // Empty line
  lines.push('\u2502' + ' '.repeat(INNER) + '\u2502')

  // Stat bars
  const stats = p.baseStats
  lines.push('\u2502' + pad(statBar('HP', stats.hp), INNER) + '\u2502')
  lines.push('\u2502' + pad(statBar('ATK', stats.attack), INNER) + '\u2502')
  lines.push('\u2502' + pad(statBar('DEF', stats.defense), INNER) + '\u2502')
  lines.push('\u2502' + pad(statBar('SP.ATK', stats.spAtk), INNER) + '\u2502')
  lines.push('\u2502' + pad(statBar('SP.DEF', stats.spDef), INNER) + '\u2502')
  lines.push('\u2502' + pad(statBar('SPEED', stats.speed), INNER) + '\u2502')

  // Empty line
  lines.push('\u2502' + ' '.repeat(INNER) + '\u2502')

  // Bottom border
  lines.push('\u2570' + '\u2500'.repeat(INNER) + '\u256f')

  return lines.join('\n')
}

// Render sprite
let spriteLines: string[]
if (result.shiny) {
  spriteLines = wrapShiny(sprite, 0)
} else {
  spriteLines = renderSprite(sprite, 0, result.eye)
}

console.log(renderCard(result.pokemon, result.shiny, result.eye, spriteLines))
