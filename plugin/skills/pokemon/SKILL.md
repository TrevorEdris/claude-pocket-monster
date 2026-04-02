---
name: pokemon
description: "Show your Pokemon companion or reroll for a new one. Displays braille sprite art with shiny rainbow rendering. Triggered by: pokemon, pocket monster, roll pokemon, my pokemon, what pokemon am I, reroll, new pokemon, swap pokemon."
user-invocable: true
argument-hint: "[reroll]"
allowed-tools: Bash
tags: [fun, companion]
---

# Pokemon

Show your Pokemon companion, or reroll for a new one.

---

## Usage

```
/pokemon              # Show your current Pokemon
/pokemon reroll       # Swap to a new random Pokemon
```

---

## Process

### Step 1: Run the CLI

- If the argument is `reroll`: add `--reroll` flag
- Otherwise: no flags

```bash
cd ~/src/github.com/TrevorEdris/claude-pocket-monster && npx tsx src/cli.ts [--reroll]
```

### Step 2: Show the Output

**CRITICAL: Copy the ENTIRE Bash output into your response verbatim, preserving all braille characters and ANSI codes. Do NOT describe what the sprite looks like — just show it. The braille art IS the point.**

After the verbatim output, you may add one short sentence. If the user re-rolled, mention their companion changed.
