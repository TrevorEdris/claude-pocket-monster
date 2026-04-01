import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Eye, SpriteData } from './types.js'
import { EYE_PLACEHOLDER, SPRITE_LINES, SPRITE_WIDTH } from './types.js'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const SPRITES_DIR = join(__dirname, '..', 'data', 'sprites')

export function loadSprite(id: number, name: string): SpriteData {
  const padded = String(id).padStart(3, '0')
  const filename = `${padded}-${name.toLowerCase()}.json`
  const filepath = join(SPRITES_DIR, filename)
  const raw = readFileSync(filepath, 'utf8')
  return JSON.parse(raw) as SpriteData
}

export function loadAllSprites(): SpriteData[] {
  const files = readdirSync(SPRITES_DIR).filter((f) => f.endsWith('.json'))
  return files.map((f) => {
    const raw = readFileSync(join(SPRITES_DIR, f), 'utf8')
    return JSON.parse(raw) as SpriteData
  })
}

export type SpriteValidationError = {
  sprite: string
  frame: number
  line: number
  message: string
}

export function validateSprite(sprite: SpriteData): SpriteValidationError[] {
  const errors: SpriteValidationError[] = []
  const label = `${sprite.id}-${sprite.name}`

  if (sprite.frames.length !== 3) {
    errors.push({ sprite: label, frame: -1, line: -1, message: `Expected 3 frames, got ${sprite.frames.length}` })
    return errors
  }

  let hasEye = false
  for (let fi = 0; fi < sprite.frames.length; fi++) {
    const frame = sprite.frames[fi]!
    if (frame.length !== SPRITE_LINES) {
      errors.push({ sprite: label, frame: fi, line: -1, message: `Expected ${SPRITE_LINES} lines, got ${frame.length}` })
      continue
    }
    for (let li = 0; li < frame.length; li++) {
      const line = frame[li]!
      const rendered = line.replace(/\{E\}/g, 'x')
      if (rendered.length !== SPRITE_WIDTH) {
        errors.push({
          sprite: label,
          frame: fi,
          line: li,
          message: `Rendered width ${rendered.length}, expected ${SPRITE_WIDTH}`,
        })
      }
      if (line.includes(EYE_PLACEHOLDER)) hasEye = true
    }
  }

  if (!hasEye) {
    errors.push({ sprite: label, frame: -1, line: -1, message: `No ${EYE_PLACEHOLDER} placeholder found in any frame` })
  }

  return errors
}

export function renderSprite(sprite: SpriteData, frame: number, eye: Eye): string[] {
  const f = sprite.frames[frame]
  if (!f) throw new Error(`Frame ${frame} not found for ${sprite.name}`)
  return f.map((line) => line.replace(/\{E\}/g, eye))
}
