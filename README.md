# claude-pocket-monster

Deterministic Pokemon companion system. Given a user ID, rolls a Pokemon with consistent results using Mulberry32 PRNG. Includes ASCII sprites with shiny rainbow rendering.

## PoC (v0.1)

10 Pokemon: Kanto starter lines (Bulbasaur through Blastoise) + Salamence.

## Usage

```bash
npm install
npx tsx src/cli.ts <userId>
```

### Example

```
$ npx tsx src/cli.ts my-user-id
User: my-user-id
Pokemon: Squirtle (#7)
Types: water
Rarity: common
Shiny: no
Eye: ·

              
    ( -- )    
   (·  ·)     
    ( ~~ )    
   d' @@ 'b   
```

Shiny Pokemon (~1/512 chance) get sparkle treatment:

```
 ✨ S H I N Y ✨
 ·    _{@@@@}_    ·
 .   / ★   ★ \    "
 ·  |  \  -- |    ·
 "   \  '---'/    .
 ·   `''   ''`    ·
```

## API

```typescript
import { roll, loadSprite, renderSprite, wrapShiny } from 'claude-pocket-monster'

const result = roll('user-id')
// { pokemon: PokemonEntry, shiny: boolean, eye: Eye }

const sprite = loadSprite(result.pokemon.id, result.pokemon.name)
const lines = result.shiny
  ? wrapShiny(sprite, 0)
  : renderSprite(sprite, 0, result.eye)
```

## Sprite Format

Each sprite file (`data/sprites/NNN-name.json`) contains:

- `id`: Pokedex number
- `name`: Pokemon name
- `frames`: 3 arrays of 5 strings each
  - Each line: 14 characters rendered width
  - `{E}` placeholder for eye character (replaced at render time)
  - Frame 0: idle, Frame 1: fidget, Frame 2: special (type flourish)

## Validate Sprites

```bash
npm run validate-sprites
```

## Tests

```bash
npm test
```

## Roll Algorithm

1. `seed = FNV-1a(userId + "pocket-monster-2026")`
2. `rng = Mulberry32(seed)`
3. Roll rarity (weighted: common=50, uncommon=25, rare=15, epic=7, legendary=2, mythical=1)
4. Pick Pokemon from rarity-filtered pool
5. Roll shiny: `rng() < 1/512`
6. Pick eye character

Same user ID always produces the same Pokemon.

## License

MIT
