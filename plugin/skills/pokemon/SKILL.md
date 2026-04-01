---
name: pokemon
description: "Roll a deterministic Pokemon companion based on user identity. Displays braille sprite art with shiny rainbow rendering. Triggered by: pokemon, pocket monster, roll pokemon, my pokemon, what pokemon am I."
user-invocable: true
argument-hint: "[userId or empty for default]"
allowed-tools: Bash
tags: [fun, companion]
---

# Pokemon

Roll a deterministic Pokemon companion. Same user always gets the same Pokemon.

---

## Usage

```
/pokemon              # Roll with default user
/pokemon my-username  # Roll for a specific user
```

---

## Process

### Step 1: Determine User ID

- If the user provided an argument, use it as the userId
- If no argument, use `whoami` to get the system username

### Step 2: Roll and Display the Pokemon

Run the CLI and **output its result verbatim** — do NOT summarize, interpret, or redescribe the output. The CLI produces formatted braille art that must be shown exactly as printed.

```bash
cd ~/src/github.com/TrevorEdris/claude-pocket-monster && npx tsx src/cli.ts <userId>
```

### Step 3: Show the Output

**CRITICAL: Copy the ENTIRE Bash output into your response verbatim, preserving all braille characters (⠀⣿⠀ etc), ANSI codes, and formatting. Do NOT describe what the sprite looks like — just show it. Do NOT say "here is your Pokemon" and then omit the sprite art. The braille art IS the point.**

If the output contains ANSI color codes (shiny Pokemon), reproduce them exactly — they render as rainbow colors in the terminal.

After the verbatim output, you may add one short sentence about the Pokemon (type, rarity, whether it's shiny).
