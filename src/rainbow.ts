import type { SpriteData } from './types.js'

// ANSI 256-color rainbow palette — full spectrum cycle
const RAINBOW = [
  196, 202, 208, 214, 220, 226, 190, 154, 118, 82, 46, 47, 48, 49, 50, 51,
  45, 39, 33, 27, 21, 57, 93, 129, 165, 201, 200, 199, 198, 197,
]

// Braille blank character
const BRAILLE_BLANK = '\u2800'

function isVisible(char: string): boolean {
  return char !== BRAILLE_BLANK && char !== ' '
}

export function renderShiny(lines: string[]): string[] {
  let colorIdx = 0
  return lines.map((line) => {
    let out = ''
    for (const char of line) {
      if (isVisible(char)) {
        const color = RAINBOW[colorIdx % RAINBOW.length]
        out += `\x1b[38;5;${color}m${char}\x1b[0m`
        colorIdx++
      } else {
        out += char
      }
    }
    return out
  })
}

export function wrapShiny(sprite: SpriteData, frame: number): string[] {
  const f = sprite.frames[frame % sprite.frames.length]
  if (!f) throw new Error(`Frame ${frame} not found for ${sprite.name}`)
  return renderShiny(f)
}
