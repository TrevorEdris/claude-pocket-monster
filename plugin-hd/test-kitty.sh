#!/bin/bash
# Test Kitty graphics protocol directly in Ghostty.

SPRITE="$HOME/.config/claude-pocket-monster/sprite-cache/7-64.png"

if [ ! -f "$SPRITE" ]; then
  echo "No sprite at $SPRITE"
  exit 1
fi

echo "=== Test 1: chafa (should always work) ==="
chafa --format symbols --symbols braille -s 20 -c full "$SPRITE" 2>/dev/null || echo "chafa not found"

echo ""
echo "=== Test 2: Kitty protocol (single chunk, no line breaks) ==="

# base64 with no line wrapping (-w0 on linux, -b0 on mac)
B64=$(base64 -b0 < "$SPRITE" 2>/dev/null || base64 -w0 < "$SPRITE" 2>/dev/null)
echo "Base64 length: ${#B64}"

# Simple single-chunk transmit
printf '\e_Ga=T,f=100,t=d,i=50,q=2;%s\e\\' "$B64"
echo ""
echo "If you see a sprite above this line, Kitty works."
echo ""

echo "=== Test 3: Kitty with explicit position ==="
printf '\e[s'
printf '\e[3;5H'
printf '\e_Ga=T,f=100,t=d,i=51,q=2;%s\e\\' "$B64"
printf '\e[u'
echo ""
echo "If you see a sprite at top-left (row 3, col 5), positioning works."
