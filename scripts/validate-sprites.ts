import { loadAllSprites, validateSprite } from '../src/sprites.js'

const sprites = loadAllSprites()
let totalErrors = 0

for (const sprite of sprites) {
  const errors = validateSprite(sprite)
  if (errors.length > 0) {
    for (const e of errors) {
      const loc = e.frame >= 0 ? ` frame ${e.frame}` + (e.line >= 0 ? ` line ${e.line}` : '') : ''
      console.error(`[FAIL] ${e.sprite}${loc}: ${e.message}`)
    }
    totalErrors += errors.length
  } else {
    console.log(`[OK] ${sprite.id}-${sprite.name}`)
  }
}

if (totalErrors > 0) {
  console.error(`\n${totalErrors} error(s) found.`)
  process.exit(1)
} else {
  console.log(`\nAll ${sprites.length} sprites valid.`)
}
