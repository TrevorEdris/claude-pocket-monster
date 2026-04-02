#!/usr/bin/env bash
# Generate Unicode sprites from PokeAPI official artwork using chafa
# Requires: chafa (brew install chafa), curl
#
# Usage: ./scripts/generate-sprites.sh [width] [symbol-mode]
#   width: output columns (default: 24)
#   symbol-mode: block, braille, or block+braille (default: braille)

set -euo pipefail

WIDTH="${1:-24}"
SYMBOLS="${2:-braille}"
SPRITE_DIR="data/sprites"
TMP_DIR="/tmp/pokemon-sprites"

mkdir -p "$TMP_DIR"

# PoC Pokemon: id, padded-id, name
POKEMON=(
  "1:001:bulbasaur"
  "2:002:ivysaur"
  "3:003:venusaur"
  "4:004:charmander"
  "5:005:charmeleon"
  "6:006:charizard"
  "7:007:squirtle"
  "8:008:wartortle"
  "9:009:blastoise"
  "373:373:salamence"
)

for entry in "${POKEMON[@]}"; do
  IFS=: read -r id padded name <<< "$entry"
  png="$TMP_DIR/${padded}-${name}.png"

  # Download official artwork (high-res, transparent background)
  if [ ! -f "$png" ]; then
    echo "Downloading $name (#$id)..."
    curl -sL -o "$png" "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png"
  fi

  echo "=== $name (${WIDTH}w, $SYMBOLS) ==="
  chafa --format symbols --symbols "$SYMBOLS" -s "$WIDTH" -c none "$png"
  echo ""
done

echo "Done. To save as JSON sprite files, pipe through scripts/chafa-to-json.ts"
