import { describe, it, expect } from 'vitest'
import { roll, mulberry32, hashString, rollRarity } from '../src/roll.js'
import { RARITY_WEIGHTS } from '../src/types.js'

describe('mulberry32', () => {
  it('produces deterministic output from same seed', () => {
    const rng1 = mulberry32(42)
    const rng2 = mulberry32(42)
    const seq1 = Array.from({ length: 10 }, () => rng1())
    const seq2 = Array.from({ length: 10 }, () => rng2())
    expect(seq1).toEqual(seq2)
  })

  it('produces different output from different seeds', () => {
    const rng1 = mulberry32(42)
    const rng2 = mulberry32(99)
    const v1 = rng1()
    const v2 = rng2()
    expect(v1).not.toEqual(v2)
  })

  it('produces values between 0 and 1', () => {
    const rng = mulberry32(12345)
    for (let i = 0; i < 1000; i++) {
      const v = rng()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })
})

describe('hashString', () => {
  it('produces same hash for same input', () => {
    expect(hashString('test')).toBe(hashString('test'))
  })

  it('produces different hashes for different input', () => {
    expect(hashString('alice')).not.toBe(hashString('bob'))
  })
})

describe('roll', () => {
  it('returns same Pokemon for same userId', () => {
    const r1 = roll('test-user-1')
    const r2 = roll('test-user-1')
    expect(r1.pokemon.id).toBe(r2.pokemon.id)
    expect(r1.shiny).toBe(r2.shiny)
    expect(r1.eye).toBe(r2.eye)
  })

  it('returns different Pokemon for different userIds', () => {
    const results = new Set<number>()
    for (let i = 0; i < 100; i++) {
      results.add(roll(`user-${i}`).pokemon.id)
    }
    // With 100 users and 10 Pokemon, we should see at least 3 distinct Pokemon
    expect(results.size).toBeGreaterThanOrEqual(3)
  })

  it('returns valid Pokemon fields', () => {
    const r = roll('test-user-1')
    expect(r.pokemon.id).toBeGreaterThan(0)
    expect(r.pokemon.name).toBeTruthy()
    expect(r.pokemon.types.length).toBeGreaterThan(0)
    expect(typeof r.shiny).toBe('boolean')
    expect(r.eye).toBeTruthy()
  })
})

describe('rollRarity distribution', () => {
  it('roughly matches configured weights over 10,000 rolls', () => {
    const counts: Record<string, number> = {}
    const totalWeight = Object.values(RARITY_WEIGHTS).reduce((a, b) => a + b, 0)

    for (let i = 0; i < 10000; i++) {
      const rng = mulberry32(i * 7919) // distinct seeds
      const rarity = rollRarity(rng)
      counts[rarity] = (counts[rarity] ?? 0) + 1
    }

    // Common should be ~50% (allow 40-60%)
    const commonPct = (counts['common'] ?? 0) / 10000
    expect(commonPct).toBeGreaterThan(0.40)
    expect(commonPct).toBeLessThan(0.60)

    // Uncommon should be ~25% (allow 18-32%)
    const uncommonPct = (counts['uncommon'] ?? 0) / 10000
    expect(uncommonPct).toBeGreaterThan(0.18)
    expect(uncommonPct).toBeLessThan(0.32)

    // Epic should be ~7% (allow 3-12%)
    const epicPct = (counts['epic'] ?? 0) / 10000
    expect(epicPct).toBeGreaterThan(0.03)
    expect(epicPct).toBeLessThan(0.12)
  })
})

describe('shiny rate', () => {
  it('is approximately 1/512 over large sample', () => {
    let shinyCount = 0
    const n = 50000
    for (let i = 0; i < n; i++) {
      const r = roll(`shiny-test-${i}`)
      if (r.shiny) shinyCount++
    }
    const rate = shinyCount / n
    // 1/512 = ~0.00195. Allow 0.0005 to 0.005
    expect(rate).toBeGreaterThan(0.0005)
    expect(rate).toBeLessThan(0.005)
  })
})
