import { describe, it, expect } from 'vitest'
import { wrapShiny, renderShiny } from '../src/rainbow.js'
import { loadSprite } from '../src/sprites.js'

describe('renderShiny', () => {
  it('adds ANSI color codes to visible characters', () => {
    const lines = ['⠀⠀⣿⠀⠀', '⠀⣿⣿⣿⠀']
    const result = renderShiny(lines)
    // Should contain ANSI escape sequences
    expect(result.some((line) => line.includes('\x1b[38;5;'))).toBe(true)
  })

  it('does not color blank braille or spaces', () => {
    const lines = ['⠀⠀⠀⠀⠀']
    const result = renderShiny(lines)
    expect(result[0]).toBe('⠀⠀⠀⠀⠀')
  })
})

describe('wrapShiny', () => {
  it('returns rainbow-colored sprite lines', () => {
    const sprite = loadSprite(4, 'Charmander')
    const output = wrapShiny(sprite, 0)
    expect(output.length).toBeGreaterThan(0)
    // At least some lines should have ANSI codes
    const hasColor = output.some((line) => line.includes('\x1b['))
    expect(hasColor).toBe(true)
  })
})
