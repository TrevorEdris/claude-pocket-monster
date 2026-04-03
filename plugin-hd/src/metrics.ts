import type { StatusLineInput, SpriteInfo } from './types.js'

// ANSI 256-color helpers
const color = (c: number, text: string) => `\x1b[38;5;${c}m${text}\x1b[0m`
const dim = (text: string) => `\x1b[2m${text}\x1b[0m`

const TYPE_COLORS: Record<string, number> = {
  fire: 208, water: 39, grass: 34, poison: 128,
  flying: 117, dragon: 99, normal: 250, electric: 226,
  ice: 51, fighting: 167, ground: 179, psychic: 206,
  bug: 107, rock: 137, ghost: 98, dark: 240, steel: 249, fairy: 213,
}

/**
 * Render the status bar text for stdout.
 * Format: "Squirtle (Water) | Ctx 78% | 5h:45%"
 */
export function renderMetrics(
  sprite: SpriteInfo,
  input: StatusLineInput,
  termCols: number,
): string {
  const parts: string[] = []

  // Pokemon name + type
  const typeStr = getTypeFromId(sprite.pokemonId)
  const typeColor = TYPE_COLORS[typeStr.toLowerCase()] || 250
  const nameStr = sprite.shiny
    ? color(226, `✨ ${sprite.pokemonName}`)
    : color(typeColor, sprite.pokemonName)
  parts.push(`${nameStr} ${dim(`(${typeStr})`)}`)

  // Context window usage
  const ctxPct = input.context_window?.used_percentage
  if (ctxPct !== undefined) {
    const ctxColor = ctxPct > 80 ? 196 : ctxPct > 60 ? 208 : 108
    parts.push(color(ctxColor, `Ctx ${Math.round(ctxPct)}%`))
  }

  // Rate limits
  const fiveHour = input.rate_limits?.five_hour?.used_percentage
  if (fiveHour !== undefined) {
    const rlColor = fiveHour > 80 ? 196 : fiveHour > 50 ? 208 : 108
    parts.push(color(rlColor, `5h:${Math.round(fiveHour)}%`))
  }

  return parts.join(dim(' | '))
}

function getTypeFromId(id: number): string {
  const types: Record<number, string> = {
    1: 'Grass', 2: 'Grass', 3: 'Grass',
    4: 'Fire', 5: 'Fire', 6: 'Fire',
    7: 'Water', 8: 'Water', 9: 'Water',
    373: 'Dragon',
  }
  return types[id] || 'Normal'
}
