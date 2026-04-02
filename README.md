# claude-pocket-monster

A Pokemon companion for Claude Code. Get a random Pokemon that appears throughout your coding session with contextual quips.

## Installation

```bash
# Register the marketplace (one-time)
/plugin marketplace add TrevorEdris/claude-pocket-monster

# Install the plugin
/plugin install claude-pocket-monster@claude-pocket-monster
```

## Commands

| Command | What it does |
|---------|-------------|
| `/pokemon` | Show your current Pokemon |
| `/pokemon reroll` | Swap to a new random Pokemon |

## What it looks like

Your Pokemon appears on session start and pops up throughout the session — after tests, commits, pushes, and idle moments — with Haiku-generated quips based on what's happening in the session.

```
  ★ COMMON    WATER

  ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠤⠒⠉⠉⠁⠉⠉⠐⠢⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
  ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡞⠅⠀⠀⠀⠀⠀⢐⡠⣀⠀⠀⠱⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
  ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⡁⠀⠀⠀⠀⠀⠀⠀⠠⠀⡄⠀⠀⠘⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
  ⠀⠀⠀⠀⠀⠀⠀⠀⢀⣖⠀⠀⠀⠀⠀⠀⢀⠀⠔⠐⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
  ⠀⠀⠀⠀⠀⠀⠀⠀⠠⢄⠀⢂⡀⣀⣀⣀⡀⠉⠉⠉⢀⠀⠀⠀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
  ⠀⠀⠀⠀⠀⠀⠀⠀⠈⢎⠉⠁⠀⠀⠀⠀⠀⠉⠉⠉⠁⠀⠀⡐⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
  ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣑⡦⢀⠀⠀⠀⠀⠀⠀⠀⢀⡠⡈⠐⠢⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
  ⠀⠀⠀⠀⠀⢀⡠⠔⠊⠉⢀⠞⠀⠉⠁⠒⠒⠒⢒⠞⠉⠀⠈⠙⡦⢜⢄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
  ⠀⠀⠀⡒⠒⡁⠀⠀⠀⢠⠋⠢⠄⣀⡀⠀⠀⢠⠃⠀⠀⠀⠀⠀⢀⠀⠙⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
  ⠀⠀⢠⠃⠘⠂⠀⠀⠀⡄⠀⠀⠀⠀⠠⠈⠉⠅⣠⠄⠀⠀⠀⢀⠎⠀⠀⢡⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
  ⠀⠀⠈⠉⠉⠁⠒⠀⠩⠠⠀⠀⠀⠀⠀⠀⣔⠔⠁⠈⠐⢲⣠⠊⢠⠀⠀⢀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
  ⠀⠀⠀⠀⠀⠀⠀⠀⠈⢀⠐⠠⠤⠄⢃⣀⣀⣉⣐⡖⠒⠉⠈⠀⠀⠀⠀⡤⠀⠀⣀⠤⠤⠤⠤⣀⠀⠀⠀⠀
  ⠀⠀⠀⠀⠀⠀⠀⠀⡐⢊⠀⠀⠀⠀⠀⠀⠀⠀⠀⠑⣄⠠⠤⢀⡐⡠⠊⠄⢠⠊⠁⠀⠀⠀⠀⠀⠁⡀⠀⠀
  ⠀⠀⠀⠀⠀⠀⠀⡜⠀⠈⢢⠀⠀⠀⡂⠀⠀⠀⠀⡔⠁⠀⠀⠀⠈⠅⣜⠔⠀⠀⠀⡠⠒⠒⠄⠀⠀⡃⠀⠀
  ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠑⢖⠈⠉⠒⠤⢄⡈⠀⠀⠀⠀⠀⠀⠀⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⠄⠀⠀
  ⠀⠀⠀⠀⠀⠀⣠⠀⠀⠀⠀⠀⢠⠉⠑⠒⠂⠠⠮⡄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠑⢄⣀⣀⡠⠊⠀⠀⠀
  ⠀⠀⠀⠀⠀⠈⠢⠤⢄⣀⠤⠔⠂⠀⠀⠀⠀⠀⠀⠘⡀⠀⠀⠀⠀⠀⠉⠉⠐⠒⠒⠒⠒⠊⠁⠀⠀⠀⠀⠀
  ⠀⠀⠀⠀⠀⠀⠀⠀⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠂⠤⢀⠀⡠⢄⡆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀

  Squirtle

  HP       ██░░░░░░░░   44
  ATK      ██░░░░░░░░   48
  DEF      ███░░░░░░░   65
  SP.ATK   ██░░░░░░░░   50
  SP.DEF   ███░░░░░░░   64
  SPEED    ██░░░░░░░░   43
```

Shiny Pokemon (~1/512 chance) render with per-character rainbow ANSI colors.

## When your Pokemon appears

| Event | Chance |
|-------|--------|
| Session start | 100% |
| Each prompt you type | 40% |
| After tests pass/fail | 50% |
| After `git commit` | 60% |
| After `git push` | 100% |
| Before dangerous commands | 100% |
| When assistant finishes | 40% |

## Available Pokemon (PoC)

Bulbasaur, Ivysaur, Venusaur, Charmander, Charmeleon, Charizard, Squirtle, Wartortle, Blastoise, Salamence

## License

MIT
