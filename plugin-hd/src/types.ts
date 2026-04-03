// JSON sent by Claude Code on stdin to the statusLine command
export type StatusLineInput = {
  model?: {
    display_name?: string
    id?: string
  }
  context_window?: {
    context_window_size?: number
    size?: number
    current_usage?: {
      input_tokens?: number
      output_tokens?: number
      cache_creation_input_tokens?: number
      cache_creation_tokens?: number
      cache_read_input_tokens?: number
      cache_read_tokens?: number
    }
    used_percentage?: number
  }
  rate_limits?: {
    five_hour?: { used_percentage?: number; resets_at?: string }
    seven_day?: { used_percentage?: number; resets_at?: string }
  }
  transcript_path?: string
  cwd?: string
}

export type PetState = 'idle' | 'thinking' | 'celebrating' | 'alarmed' | 'sleeping'

export type TTYChannel = {
  devicePath: string
  fd: number
  write(data: string | Buffer): void
  close(): void
}

export type SpriteInfo = {
  pokemonId: number
  pokemonName: string
  pngBuffer: Buffer
  shiny: boolean
}

export type Position = {
  row: number
  col: number
}
