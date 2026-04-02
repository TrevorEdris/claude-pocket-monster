export type PokemonType =
  | 'normal' | 'fire' | 'water' | 'grass' | 'electric'
  | 'ice' | 'fighting' | 'poison' | 'ground' | 'flying'
  | 'psychic' | 'bug' | 'rock' | 'ghost' | 'dragon'
  | 'dark' | 'steel' | 'fairy'

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythical'

export type PokemonEntry = {
  id: number
  name: string
  types: PokemonType[]
  generation: number
  rarity: Rarity
  baseStats: {
    hp: number
    attack: number
    defense: number
    spAtk: number
    spDef: number
    speed: number
  }
}

export type SpriteData = {
  id: number
  name: string
  frames: string[][]
}

export type Eye = '\u00b7' | '\u2726' | '\u00d7' | '\u25c9' | '@' | '\u00b0'

export type PokemonRoll = {
  pokemon: PokemonEntry
  shiny: boolean
  eye: Eye
}

export const EYES: Eye[] = ['\u00b7', '\u2726', '\u00d7', '\u25c9', '@', '\u00b0']

export const RARITY_WEIGHTS: Record<Rarity, number> = {
  common: 50,
  uncommon: 25,
  rare: 15,
  epic: 7,
  legendary: 2,
  mythical: 1,
}

export const SPRITE_LINES = 10
export const SPRITE_WIDTH = 24
export const EYE_PLACEHOLDER = '{E}'

// Unicode building blocks for sprites:
// Block elements: ░▒▓█▄▀
// Box drawing: ╭╮╰╯│─╲╱
// Geometric: ●○◆◇▲△▼▽■□
// Misc: ⟨⟩ ⌒ ∧∨ ≋ ⫘
