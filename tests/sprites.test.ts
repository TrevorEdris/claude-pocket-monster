import { describe, it, expect } from 'vitest'
import { loadAllSprites, loadSprite, validateSprite, renderSprite } from '../src/sprites.js'
import { SPRITE_LINES, SPRITE_WIDTH, EYE_PLACEHOLDER } from '../src/types.js'

describe('loadAllSprites', () => {
  it('loads all 10 PoC sprites', () => {
    const sprites = loadAllSprites()
    expect(sprites).toHaveLength(10)
  })
})

describe('validateSprite', () => {
  it('all sprites pass validation with no errors', () => {
    const sprites = loadAllSprites()
    for (const sprite of sprites) {
      const errors = validateSprite(sprite)
      expect(errors, `${sprite.name} has validation errors: ${JSON.stringify(errors)}`).toHaveLength(0)
    }
  })

  it('all frames are exactly 5 lines', () => {
    const sprites = loadAllSprites()
    for (const sprite of sprites) {
      for (let fi = 0; fi < sprite.frames.length; fi++) {
        expect(sprite.frames[fi]).toHaveLength(SPRITE_LINES)
      }
    }
  })

  it('all lines render to exactly 14 chars', () => {
    const sprites = loadAllSprites()
    for (const sprite of sprites) {
      for (const frame of sprite.frames) {
        for (const line of frame) {
          const rendered = line.replace(/\{E\}/g, 'x')
          expect(rendered).toHaveLength(SPRITE_WIDTH)
        }
      }
    }
  })

  it('all sprites contain {E} placeholder in at least one frame', () => {
    const sprites = loadAllSprites()
    for (const sprite of sprites) {
      const hasEye = sprite.frames.some((frame) => frame.some((line) => line.includes(EYE_PLACEHOLDER)))
      expect(hasEye, `${sprite.name} missing ${EYE_PLACEHOLDER}`).toBe(true)
    }
  })
})

describe('renderSprite', () => {
  it('replaces {E} with the given eye character', () => {
    const sprite = loadSprite(4, 'Charmander')
    const rendered = renderSprite(sprite, 0, '\u00b7')
    for (const line of rendered) {
      expect(line).not.toContain(EYE_PLACEHOLDER)
    }
    const hasEye = rendered.some((line) => line.includes('\u00b7'))
    expect(hasEye).toBe(true)
  })

  it('preserves rendered line width after eye substitution', () => {
    const sprite = loadSprite(1, 'Bulbasaur')
    const rendered = renderSprite(sprite, 0, '@')
    for (const line of rendered) {
      expect(line).toHaveLength(SPRITE_WIDTH)
    }
  })
})
