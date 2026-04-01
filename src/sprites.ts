import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { SpriteData } from './types.js'

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

  if (sprite.frames.length < 1) {
    errors.push({ sprite: label, frame: -1, line: -1, message: `No frames found` })
    return errors
  }

  for (let fi = 0; fi < sprite.frames.length; fi++) {
    const frame = sprite.frames[fi]!
    if (frame.length < 1) {
      errors.push({ sprite: label, frame: fi, line: -1, message: `Empty frame` })
    }
  }

  return errors
}

export function renderSprite(sprite: SpriteData, frame: number): string[] {
  const f = sprite.frames[frame % sprite.frames.length]
  if (!f) throw new Error(`Frame ${frame} not found for ${sprite.name}`)
  return [...f]
}
