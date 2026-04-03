import { createInterface } from 'node:readline'
import type { StatusLineInput } from './types.js'
import { discoverTTY } from './tty.js'
import { KittyRenderer } from './kitty.js'
import { loadSprite } from './sprites.js'
import { getSpritePosition, updateTermSize, getTermSize } from './position.js'
import { renderMetrics } from './metrics.js'

let inputState: StatusLineInput = {}
let renderer: KittyRenderer | null = null
let metricsTimer: ReturnType<typeof setInterval> | null = null
let rendered = false

async function main() {
  // Load the user's Pokemon sprite
  const sprite = loadSprite()

  // Discover real terminal for Kitty graphics
  const tty = discoverTTY()
  if (tty) {
    renderer = new KittyRenderer(tty)
  }

  // Initial render
  if (renderer) {
    const pos = getSpritePosition()
    renderer.render(sprite.pngBuffer, pos)
    rendered = true
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

  // Periodic metrics refresh
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
  if (renderer) {
    renderer.cleanup()
    renderer = null
  }
  process.exit(0)
}

main().catch(() => process.exit(1))
