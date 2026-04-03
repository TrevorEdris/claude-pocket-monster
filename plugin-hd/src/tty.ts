import { execSync } from 'node:child_process'
import { openSync, writeSync, closeSync } from 'node:fs'
import type { TTYChannel } from './types.js'

/**
 * Discover the user's real terminal by walking the process tree.
 * Claude Code's statusLine command runs in a piped subprocess —
 * stdout is captured, so we need /dev/tty* for Kitty graphics.
 * We skip /dev/tty itself (Claude Code's internal Ink PTY would eat it).
 */
export function discoverTTY(): TTYChannel | null {
  try {
    const psOutput = execSync('ps -o pid=,ppid=,tty= -ax', {
      encoding: 'utf8',
      timeout: 3000,
    })

    // Build pid → { ppid, tty } map
    const procs = new Map<number, { ppid: number; tty: string }>()
    for (const line of psOutput.split('\n')) {
      const parts = line.trim().split(/\s+/)
      if (parts.length >= 2) {
        const pid = parseInt(parts[0]!, 10)
        const ppid = parseInt(parts[1]!, 10)
        const tty = parts[2] || ''
        if (!isNaN(pid) && !isNaN(ppid)) {
          procs.set(pid, { ppid, tty })
        }
      }
    }

    // Walk ancestors up to 15 levels
    let current = process.ppid
    for (let i = 0; i < 15 && current > 1; i++) {
      const info = procs.get(current)
      if (!info) break

      if (info.tty && info.tty !== '??' && info.tty !== '-') {
        // Try to open this TTY device
        const devPath = info.tty.startsWith('/dev/')
          ? info.tty
          : `/dev/${info.tty}`

        try {
          const fd = openSync(devPath, 'w')
          return {
            devicePath: devPath,
            fd,
            write(data: string | Buffer) {
              const buf = typeof data === 'string' ? Buffer.from(data) : data
              writeSync(fd, buf)
            },
            close() {
              try { closeSync(fd) } catch { /* already closed */ }
            },
          }
        } catch {
          // Can't open this device, try next ancestor
        }
      }

      current = info.ppid
    }
  } catch {
    // ps failed — no TTY
  }

  return null
}
