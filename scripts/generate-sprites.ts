import { execSync } from 'node:child_process'
import { writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import pokemonData from '../data/pokemon.json' with { type: 'json' }

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const SPRITES_DIR = join(__dirname, '..', 'data', 'sprites')
const TMP_DIR = '/tmp/pokemon-sprites'
const WIDTH = 40

mkdirSync(TMP_DIR, { recursive: true })

function downloadSprite(id: number): string {
  const png = join(TMP_DIR, `${id}.png`)
  if (!existsSync(png)) {
    console.log(`  Downloading #${id}...`)
    execSync(
      `curl -sL -o "${png}" "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png"`,
    )
  }
  return png
}

function edgeDetect(png: string): string {
  const edge = png.replace('.png', '-edge.png')
  execSync(`magick "${png}" -background white -flatten -canny 0x1+5%+15% "${edge}"`)
  return edge
}

function toBraille(edgePng: string, width: number): string[] {
  const raw = execSync(
    `chafa --format symbols --symbols braille -s ${width} -c none "${edgePng}"`,
    { encoding: 'utf8' },
  )
  return raw.split('\n')
}

function trimSprite(lines: string[]): string[] {
  // Remove leading/trailing blank lines (only braille blank ⠀ or space)
  let start = 0
  let end = lines.length - 1
  while (start < end && lines[start]!.replace(/[⠀\s]/g, '') === '') start++
  while (end > start && lines[end]!.replace(/[⠀\s]/g, '') === '') end--
  return lines.slice(start, end + 1)
}

for (const pokemon of pokemonData) {
  console.log(`Processing ${pokemon.name} (#${pokemon.id})...`)
  const png = downloadSprite(pokemon.id)
  const edge = edgeDetect(png)
  const raw = toBraille(edge, WIDTH)
  const trimmed = trimSprite(raw)

  const padded = String(pokemon.id).padStart(3, '0')
  const filename = `${padded}-${pokemon.name.toLowerCase()}.json`

  const sprite = {
    id: pokemon.id,
    name: pokemon.name,
    frames: [trimmed], // single frame from static image
  }

  writeFileSync(join(SPRITES_DIR, filename), JSON.stringify(sprite, null, 2) + '\n')
  console.log(`  -> ${filename} (${trimmed.length} lines)`)
}

console.log('\nDone.')
