import { describe, it, expect } from 'vitest'
import { loadAllSprites, loadSprite, validateSprite, renderSprite } from '../src/sprites.js'

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

  it('all sprites have at least one frame with content', () => {
    const sprites = loadAllSprites()
    for (const sprite of sprites) {
      expect(sprite.frames.length).toBeGreaterThan(0)
      for (const frame of sprite.frames) {
        expect(frame.length).toBeGreaterThan(0)
      }
    }
  })
})

describe('renderSprite', () => {
  it('returns lines from the sprite', () => {
    const sprite = loadSprite(4, 'Charmander')
    const rendered = renderSprite(sprite, 0)
    expect(rendered.length).toBeGreaterThan(0)
    expect(rendered.some((line) => line.replace(/[\u2800\s]/g, '') !== '')).toBe(true)
  })
})
