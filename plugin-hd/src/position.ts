import type { Position } from './types.js'

const GROUND_OFFSET = 4  // rows from bottom
const HOME_COL_PCT = 0.85 // 85% across terminal (right side, like /buddy)
const SPRITE_ROWS = 4 // ~4 terminal rows for a 64px sprite

let termRows = process.stdout.rows || 24
let termCols = process.stdout.columns || 80

export function updateTermSize(): void {
  try {
    termRows = process.stdout.rows || 24
    termCols = process.stdout.columns || 80
  } catch {
    // keep previous values
  }
}

export function getTermSize(): { rows: number; cols: number } {
  return { rows: termRows, cols: termCols }
}

/**
 * Calculate the sprite's top-left position.
 * Places the sprite at the right side of the terminal,
 * a few rows above the bottom (near the input box).
 */
export function getSpritePosition(): Position {
  const groundRow = Math.max(1, termRows - GROUND_OFFSET)
  const topRow = Math.max(1, groundRow - SPRITE_ROWS + 1)
  const col = Math.max(1, Math.round(termCols * HOME_COL_PCT))

  return { row: topRow, col }
}
