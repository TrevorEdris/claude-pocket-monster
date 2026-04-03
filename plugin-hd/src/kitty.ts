import type { TTYChannel, Position } from './types.js'

const CHUNK_SIZE = 4096

/**
 * Send a PNG image to the terminal via Kitty graphics protocol.
 * Uses base64-encoded chunks with escape sequences written to the TTY fd.
 */
function transmitAndDisplay(
  tty: TTYChannel,
  png: Buffer,
  imageId: number,
  pos: Position,
): void {
  const b64 = png.toString('base64')
  const chunks: string[] = []
  for (let i = 0; i < b64.length; i += CHUNK_SIZE) {
    chunks.push(b64.slice(i, i + CHUNK_SIZE))
  }

  // Save cursor
  tty.write('\x1b[s')
  // Move to target position
  tty.write(`\x1b[${pos.row};${pos.col}H`)

  for (let i = 0; i < chunks.length; i++) {
    const isFirst = i === 0
    const isLast = i === chunks.length - 1
    const more = isLast ? 0 : 1

    if (isFirst) {
      // First chunk: transmit + display with all params
      tty.write(
        `\x1b_Ga=T,f=100,i=${imageId},p=1,q=2,z=1000,m=${more};${chunks[i]}\x1b\\`,
      )
    } else {
      // Continuation chunk
      tty.write(`\x1b_Gm=${more};${chunks[i]}\x1b\\`)
    }
  }

  // Restore cursor
  tty.write('\x1b[u')
}

function deleteImage(tty: TTYChannel, imageId: number): void {
  tty.write(`\x1b_Ga=d,d=i,i=${imageId},q=2\x1b\\`)
}

function deleteAll(tty: TTYChannel): void {
  tty.write('\x1b_Ga=d,d=a,q=2\x1b\\')
}

/**
 * Double-buffered Kitty renderer. Alternates between two image IDs
 * to prevent flicker during frame replacement.
 */
export class KittyRenderer {
  private currentId = 100
  private nextId = 101
  private tty: TTYChannel

  constructor(tty: TTYChannel) {
    this.tty = tty
  }

  render(png: Buffer, pos: Position): void {
    // Display new frame with next ID
    transmitAndDisplay(this.tty, png, this.nextId, pos)
    // Delete old frame
    deleteImage(this.tty, this.currentId)
    // Swap IDs
    ;[this.currentId, this.nextId] = [this.nextId, this.currentId]
  }

  cleanup(): void {
    deleteAll(this.tty)
  }
}
