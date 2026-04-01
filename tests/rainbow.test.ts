import { describe, it, expect } from 'vitest'
import { wrapShiny, SHINY_EYE } from '../src/rainbow.js'
import { loadSprite } from '../src/sprites.js'
import { EYE_PLACEHOLDER } from '../src/types.js'

describe('wrapShiny', () => {
  it('replaces eyes with star character', () => {
    const sprite = loadSprite(4, 'Charmander')
    const output = wrapShiny(sprite, 0)
    const joined = output.join('\n')
    expect(joined).toContain(SHINY_EYE)
    expect(joined).not.toContain(EYE_PLACEHOLDER)
  })

  it('includes SHINY header', () => {
    const sprite = loadSprite(7, 'Squirtle')
    const output = wrapShiny(sprite, 0)
    expect(output[0]).toContain('S H I N Y')
  })

  it('has 11 lines total (1 header + 10 sprite)', () => {
    const sprite = loadSprite(1, 'Bulbasaur')
    const output = wrapShiny(sprite, 0)
    expect(output).toHaveLength(11)
  })

  it('wraps each sprite line with sparkle characters', () => {
    const sprite = loadSprite(373, 'Salamence')
    const output = wrapShiny(sprite, 0)
    // Lines 1-5 should have sparkle decoration
    for (let i = 1; i < output.length; i++) {
      expect(output[i]!.length).toBeGreaterThan(14)
    }
  })
})
