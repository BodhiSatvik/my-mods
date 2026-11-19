# my-mods

Claude Code mods.

## screensaver

A different animated backdrop behind the conversation every 3 minutes, like a screensaver. Every scene is a dark one, so the app goes dark while it runs. You need a recent Claude desktop app, because that's where the backdrops draw.

The repo holds 12 scenes: 10 from [buildwithclaude.com/themes](https://buildwithclaude.com/themes) and two original Hong Kong ones, a pixel-art Victoria Harbour at night and a calm Nan Lian Garden with its golden pavilion on the lotus pond. Three more (Neon Tokyo, Marina Bay, Bat Cave) can be added; see [All 15 scenes](#all-15-scenes-mac).

| Command | What it does |
| --- | --- |
| `/screensaver` | Shows which scene is up and lists them all |
| `/screensaver next` | Skips to the next scene |
| `/screensaver hong-kong` | Pins one scene by its id or name |
| `/screensaver auto` | Goes back to rotating |
| `/screensaver off` | Turns it off |

### Install (12 scenes)

At the prompt of a terminal session:

```
/plugin install screensaver --marketplace BodhiSatvik/my-mods
```

From a shell:

```bash
claude plugin install screensaver --marketplace BodhiSatvik/my-mods
```

In the desktop app, where `/plugin` does not run: click + next to the prompt box, then Plugins, then Add marketplace with `BodhiSatvik/my-mods`, then Add plugin.

### All 15 scenes (Mac)

The repos for Neon Tokyo and Marina Bay ([markimoo09/claude-code-themes](https://github.com/markimoo09/claude-code-themes)) and Bat Cave ([Sumit189/bat-cave](https://github.com/Sumit189/bat-cave)) have no license file, so this repo doesn't include those scenes. [`screensaver/add-extras.sh`](screensaver/add-extras.sh) downloads them from those repos, at pinned commits, into your own copy.

Paste this into Terminal. It downloads this repo to `~/.claude/mod-sources/my-mods`, adds the three scenes and installs the mod:

```bash
D=~/.claude/mod-sources/my-mods && mkdir -p "$D" && curl -fsSL https://github.com/BodhiSatvik/my-mods/archive/refs/heads/main.tar.gz | tar -xz --strip-components=1 -C "$D" && sh "$D/screensaver/add-extras.sh" && CLAUDE="$(command -v claude || ls -td "$HOME/Library/Application Support/Claude/claude-code/"*/*/claude.app/Contents/MacOS/claude | head -1)" && "$CLAUDE" plugin marketplace add "$D" && "$CLAUDE" plugin install screensaver@my-mods --scope user
```

Or give Claude this prompt:

```text
Set up my Claude Code screensaver mod from github.com/BodhiSatvik/my-mods (my own repo). Keep this cheap: don't explore or review the repo, and don't load any skills. Run this as ONE Bash command, then reply in one line:

D=~/.claude/mod-sources/my-mods && mkdir -p "$D" && curl -fsSL https://github.com/BodhiSatvik/my-mods/archive/refs/heads/main.tar.gz | tar -xz --strip-components=1 -C "$D" && sh "$D/screensaver/add-extras.sh" && CLAUDE="$(command -v claude || ls -td "$HOME/Library/Application Support/Claude/claude-code/"*/*/claude.app/Contents/MacOS/claude | head -1)" && "$CLAUDE" plugin marketplace add "$D" && "$CLAUDE" plugin install screensaver@my-mods --scope user

- If it says the marketplace or plugin is already added or installed, that's fine: the files were updated in place. Say so and stop.
- If add-extras.sh fails: it fetches Neon Tokyo and Marina Bay from github.com/markimoo09/claude-code-themes (hooks/looks/neon-tokyo.ts, marina-bay.ts, pixel.ts, types.ts) and Bat Cave from github.com/Sumit189/bat-cave (hooks/register.tsx). Read the script, fix only the fetch, then run the rest of the command. The other 12 scenes work without it, so skipping it and finishing the install is fine too.
- If an organization policy or managed settings block anything, stop and tell me. Don't work around it.
```

Then start a new session and type `/screensaver`. To update later, run the same command again: it updates the files in place.

### Credits

- 10 scenes from Anthropic's [theme-examples](https://github.com/anthropics/claude-plugins-official/tree/main/plugins/theme-examples) (Apache-2.0)
- Neon Tokyo and Marina Bay by [markimoo09](https://github.com/markimoo09/claude-code-themes), and Bat Cave by [Sumit189](https://github.com/Sumit189/bat-cave), which `add-extras.sh` downloads and this repo doesn't include
- Hong Kong, Nan Lian Garden and the rotation itself are original to this repo
