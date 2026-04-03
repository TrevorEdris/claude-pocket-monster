import { createInterface } from 'node:readline'
import { appendFileSync, openSync, writeSync } from 'node:fs'
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

  // Delayed render — wait for Ink to finish its initial draw
  if (tty) {
    const b64 = sprite.pngBuffer.toString('base64')
    log(`Sprite ready: b64 length=${b64.length}, will render after 3s delay`)

    // Render every 2 seconds to fight Ink redraws
    setInterval(() => {
      const raw = `\x1b[s\x1b[3;60H\x1b_Ga=T,f=100,t=d,i=55,q=2,z=1000,K=1;${b64}\x1b\\\x1b[u`
      tty.write(raw)
    }, 2000)

    // Also try writing directly to the specific device path, not /dev/tty
    try {
      const specificFd = openSync('/dev/ttys020', 'w')
      log('Also opened /dev/ttys020 directly')
      setInterval(() => {
        const raw = `\x1b[s\x1b[3;5H\x1b_Ga=T,f=100,t=d,i=56,q=2,z=1000,K=1;${b64}\x1b\\\x1b[u`
        writeSync(specificFd, Buffer.from(raw))
      }, 2000)
    } catch (e: any) {
      log(`Could not open /dev/ttys020: ${e.message}`)
    }
  }

  if (renderer) {
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
