import type { SpriteData } from './types.js'
import { EYE_PLACEHOLDER } from './types.js'

const SHINY_EYE = '\u2605'
const SPARKLE_TOP = ' \u2728 S H I N Y \u2728'
const SPARKLE_CHARS = ['\u00b7', '.', '\u00b7', '"']

export function wrapShiny(sprite: SpriteData, frame: number): string[] {
  const f = sprite.frames[frame]
  if (!f) throw new Error(`Frame ${frame} not found for ${sprite.name}`)

  const rendered = f.map((line) => line.replace(/\{E\}/g, SHINY_EYE))
  const output: string[] = [SPARKLE_TOP]

  for (let i = 0; i < rendered.length; i++) {
    const left = SPARKLE_CHARS[i % SPARKLE_CHARS.length]!
    const right = SPARKLE_CHARS[(i + 2) % SPARKLE_CHARS.length]!
    output.push(` ${left} ${rendered[i]} ${right}`)
  }

  return output
}

export { SHINY_EYE }
