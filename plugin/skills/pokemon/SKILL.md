---
name: pokemon
description: "Roll a deterministic Pokemon companion based on user identity. Displays braille sprite art with shiny rainbow rendering. Triggered by: pokemon, pocket monster, roll pokemon, my pokemon, what pokemon am I, reroll, new pokemon, swap pokemon."
user-invocable: true
argument-hint: "[reroll | reset | userId]"
allowed-tools: Bash
tags: [fun, companion]
---

# Pokemon

Roll a deterministic Pokemon companion. Same user always gets the same Pokemon unless re-rolled.

---

## Usage

```
/pokemon              # Show your current Pokemon
/pokemon reroll       # Re-roll for a new random Pokemon
/pokemon reset        # Reset back to your original userId-based Pokemon
/pokemon my-username  # Roll for a specific user
```

---

## Process

### Step 1: Determine the Action

- If the argument is `reroll`: add `--reroll` flag
- If the argument is `reset`: add `--reset` flag
- If the argument is something else: use it as the userId
- If no argument: use `whoami` to get the system username

### Step 2: Run the CLI

```bash
cd ~/src/github.com/TrevorEdris/claude-pocket-monster && npx tsx src/cli.ts [--reroll | --reset | <userId>]
```

### Step 3: Show the Output

**CRITICAL: Copy the ENTIRE Bash output into your response verbatim, preserving all braille characters and ANSI codes. Do NOT describe what the sprite looks like — just show it. The braille art IS the point.**

After the verbatim output, you may add one short sentence about the Pokemon.

If the user re-rolled, mention that their companion has changed.
