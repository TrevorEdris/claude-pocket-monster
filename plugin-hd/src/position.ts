import type { Position } from './types.js'

const GROUND_OFFSET = 4
const HOME_COL_PCT = 0.85
const SPRITE_ROWS = 4

let termRows = 24
let termCols = 80

export function updateTermSize(): void {
  try {
    // In a piped subprocess, stdout.rows may be undefined
    // Try to read from environment or use sensible defaults
    termRows = process.stdout.rows || parseInt(process.env.LINES || '24', 10)
    termCols = process.stdout.columns || parseInt(process.env.COLUMNS || '80', 10)
  } catch {
    // keep previous values
  }
}

export function getTermSize(): { rows: number; cols: number } {
  return { rows: termRows, cols: termCols }
}

export function getSpritePosition(): Position {
  // Try to get real terminal dimensions via tput (works on macOS)
  let rows = termRows
  let cols = termCols
  try {
    const { execSync } = require('child_process')
    const tputRows = execSync('tput lines 2>/dev/null', { encoding: 'utf8' }).trim()
    const tputCols = execSync('tput cols 2>/dev/null', { encoding: 'utf8' }).trim()
    if (tputRows) rows = parseInt(tputRows, 10) || rows
    if (tputCols) cols = parseInt(tputCols, 10) || cols
  } catch {
    // fall back
  }

  const groundRow = Math.max(1, rows - GROUND_OFFSET)
  const topRow = Math.max(1, groundRow - SPRITE_ROWS + 1)
  const col = Math.max(1, Math.round(cols * HOME_COL_PCT))

  return { row: topRow, col }
}
