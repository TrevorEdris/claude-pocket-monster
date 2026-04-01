import { roll } from './roll.js'
import { loadSprite, renderSprite } from './sprites.js'
import { wrapShiny } from './rainbow.js'
import type { Rarity, PokemonEntry } from './types.js'

const userId = process.argv[2] || 'default-user'
const result = roll(userId)
const sprite = loadSprite(result.pokemon.id, result.pokemon.name)

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

function statBar(label: string, value: number, maxVal: number = 255): string {
  const barWidth = 10
  const filled = Math.round((value / maxVal) * barWidth)
  const bar = '\u2588'.repeat(filled) + '\u2591'.repeat(barWidth - filled)
  const valStr = String(value).padStart(3)
  return `  ${label.padEnd(8)} ${bar}  ${valStr}`
}

// Render sprite lines
const spriteLines = result.shiny
  ? wrapShiny(sprite, 0)
  : renderSprite(sprite, 0)

// Header
const p = result.pokemon
const rarityLabel = (result.shiny ? '\u2728 SHINY ' : '\u2605 ') + RARITY_LABELS[p.rarity]
const typeStr = p.types.map(t => TYPE_LABELS[t] || t.toUpperCase()).join('/')

console.log()
console.log(`  ${rarityLabel}    ${typeStr}`)
console.log()

// Sprite
for (const line of spriteLines) {
  console.log(`  ${line}`)
}

console.log()
console.log(`  ${p.name}`)
console.log()

// Stat bars
const stats = p.baseStats
console.log(statBar('HP', stats.hp))
console.log(statBar('ATK', stats.attack))
console.log(statBar('DEF', stats.defense))
console.log(statBar('SP.ATK', stats.spAtk))
console.log(statBar('SP.DEF', stats.spDef))
console.log(statBar('SPEED', stats.speed))
console.log()
