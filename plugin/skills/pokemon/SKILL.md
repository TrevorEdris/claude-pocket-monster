---
name: pokemon
description: "Roll a deterministic Pokemon companion based on user identity. Displays ASCII sprite art with shiny rainbow rendering. Triggered by: pokemon, pocket monster, roll pokemon, my pokemon, what pokemon am I."
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

### Step 2: Roll the Pokemon

Run the CLI from the plugin's package directory:

```bash
cd PLUGIN_BASE_DIR/../ && npx tsx src/cli.ts <userId>
```

Where `PLUGIN_BASE_DIR` is the directory containing this SKILL.md file. The actual repo root is three levels up from this skill file:

```bash
REPO_ROOT="$(cd "$(dirname "SKILL_PATH")/../../../" && pwd)"
```

Use the Bash tool to run:

```bash
cd ~/src/github.com/TrevorEdris/claude-pocket-monster && npx tsx src/cli.ts <userId>
```

### Step 3: Display the Result

Show the full CLI output to the user as-is. The output includes:
- Pokemon name, ID, types, rarity
- Shiny status
- ASCII sprite art (with shiny sparkle rendering if applicable)

If the Pokemon is shiny, add excitement — it's a 1/512 chance!
