import { createInterface } from 'node:readline'
import { appendFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import type { StatusLineInput } from './types.js'
import { discoverTTY } from './tty.js'
import { KittyRenderer } from './kitty.js'
import { loadSprite } from './sprites.js'
import { getSpritePosition, updateTermSize, getTermSize } from './position.js'
import { renderMetrics } from './metrics.js'

const LOG = join(tmpdir(), 'cpm-hd-debug.log')
function log(msg: string) {
  appendFileSync(LOG, `[${new Date().toISOString()}] ${msg}\n`)
}

let inputState: StatusLineInput = {}
let renderer: KittyRenderer | null = null
let metricsTimer: ReturnType<typeof setInterval> | null = null
let renderTimer: ReturnType<typeof setInterval> | null = null
let rendered = false

async function main() {
  log('Starting cpm-hd...')

  // Load the user's Pokemon sprite
  const sprite = loadSprite()
  log(`Loaded sprite: ${sprite.pokemonName} (#${sprite.pokemonId}), ${sprite.pngBuffer.length} bytes, shiny=${sprite.shiny}`)

  // Discover real terminal for Kitty graphics
  const tty = discoverTTY()
  if (tty) {
    log(`TTY discovered: ${tty.devicePath}`)
    renderer = new KittyRenderer(tty)
  } else {
    log('No TTY found — metrics-only mode')
  }

  // Initial render
  if (renderer) {
    const pos = getSpritePosition()
    log(`Rendering at row=${pos.row}, col=${pos.col}`)
    renderer.render(sprite.pngBuffer, pos)
    rendered = true
    log('Initial render complete')
  }

  // Output initial metrics
  outputMetrics(sprite)

  // Handle terminal resize
  process.stdout.on('resize', () => {
    updateTermSize()
    if (renderer && rendered) {
      const pos = getSpritePosition()
      renderer.render(sprite.pngBuffer, pos)
    }
  })

  // Read stdin JSON lines from Claude Code
  const rl = createInterface({ input: process.stdin })
  rl.on('line', (line) => {
    try {
      const update = JSON.parse(line) as StatusLineInput
      inputState = { ...inputState, ...update }
    } catch {
      // ignore malformed lines
    }

    // Re-render sprite on update (position may have changed)
    if (renderer) {
      const pos = getSpritePosition()
      renderer.render(sprite.pngBuffer, pos)
      rendered = true
    }

    outputMetrics(sprite)
  })

  // Periodic refresh — re-render sprite every 500ms to fight Ink redraws,
  // and refresh metrics every 1000ms
  if (renderer) {
    renderTimer = setInterval(() => {
      updateTermSize()
      const pos = getSpritePosition()
      renderer!.render(sprite.pngBuffer, pos)
    }, 500)
  }
  metricsTimer = setInterval(() => outputMetrics(sprite), 1000)

  // Shutdown on stdin close
  rl.on('close', () => shutdown())

  // Signal handlers
  process.on('SIGINT', () => shutdown())
  process.on('SIGTERM', () => shutdown())
  process.on('uncaughtException', () => shutdown())
}

function outputMetrics(sprite: ReturnType<typeof loadSprite>) {
  const { cols } = getTermSize()
  const bar = renderMetrics(sprite, inputState, cols)
  process.stdout.write(bar + '\n')
}

function shutdown() {
  if (metricsTimer) clearInterval(metricsTimer)
  if (renderTimer) clearInterval(renderTimer)
  if (renderer) {
    renderer.cleanup()
    renderer = null
  }
  process.exit(0)
}

main().catch(() => process.exit(1))
