import { execSync } from 'node:child_process'
import { openSync, writeSync, closeSync, appendFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import type { TTYChannel } from './types.js'

const LOG = join(tmpdir(), 'cpm-hd-debug.log')
function log(msg: string) {
  appendFileSync(LOG, `[${new Date().toISOString()}] tty: ${msg}\n`)
}

export function discoverTTY(): TTYChannel | null {
  try {
    const psOutput = execSync('ps -o pid=,ppid=,tty= -ax', {
      encoding: 'utf8',
      timeout: 3000,
    })

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

    // Log the full ancestry chain
    log(`My PID: ${process.pid}, PPID: ${process.ppid}`)
    let walk = process.pid
    const chain: string[] = []
    for (let i = 0; i < 15 && walk > 1; i++) {
      const info = procs.get(walk)
      if (!info) break
      chain.push(`pid=${walk} ppid=${info.ppid} tty=${info.tty || '(none)'}`)
      walk = info.ppid
    }
    log(`Ancestry chain:\n  ${chain.join('\n  ')}`)

    // Walk ancestors starting from parent
    let current = process.ppid
    for (let i = 0; i < 15 && current > 1; i++) {
      const info = procs.get(current)
      if (!info) break

      if (info.tty && info.tty !== '??' && info.tty !== '-') {
        const devPath = info.tty.startsWith('/dev/')
          ? info.tty
          : `/dev/${info.tty}`

        log(`Found TTY candidate: ${devPath} (from pid=${current})`)

        try {
          const fd = openSync(devPath, 'w')
          log(`Opened ${devPath} as fd=${fd}`)

          // Test write — send a no-op Kitty query
          const testData = '\x1b_Gi=99,q=2;AAAA\x1b\\'
          writeSync(fd, Buffer.from(testData))
          log(`Test write to ${devPath} succeeded`)

          return {
            devicePath: devPath,
            fd,
            write(data: string | Buffer) {
              const buf = typeof data === 'string' ? Buffer.from(data) : data
              writeSync(fd, buf)
            },
            close() {
              try { closeSync(fd) } catch {}
            },
          }
        } catch (e: any) {
          log(`Failed to open ${devPath}: ${e.message}`)
        }
      }

      current = info.ppid
    }

    log('No suitable TTY found in ancestry')
  } catch (e: any) {
    log(`TTY discovery failed: ${e.message}`)
  }

  return null
}
