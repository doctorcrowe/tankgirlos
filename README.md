# Tank Girl OS

A single-file cyberpunk AI chat interface that calls the [Fireworks AI](https://fireworks.ai) inference API directly from your browser. Pair it with the included local server for full filesystem and terminal access — like Claude Code, but with your own aesthetic and any model you want.

Built as a personal daily work tool and model testing environment.

---

## Getting started

### Browser-only mode (no server)
1. Open `index.html` in any modern browser
2. Click **⚙ CUSTOMIZE** (sidebar) to open Settings
3. Paste your Fireworks API key (`fw_xxxxxxxxxxxxxxxx`) — get one free at [fireworks.ai](https://fireworks.ai)
4. Hit **APPLY** and start chatting

### Full mode (with local server)
1. Double-click **`start.command`** — Terminal opens, server starts on `http://127.0.0.1:3001`
2. Open `http://127.0.0.1:3001` in your browser
3. Add your API key in Settings → APPLY
4. The green dot in the inference bar confirms the server is online

Your API key is stored on your machine only. It never leaves your device.

---

## Features

### Models
- **Inline model selector** in the inference bar — switch models without opening settings
- Curated list of Fireworks models grouped by tier (Frontier / Mid / Fast)
- Custom model ID field in Settings for anything not in the list
- **Split / compare mode** — send the same message to two models simultaneously and see both responses labeled side by side. Primary model's response saves to history; compare response is ephemeral

### Conversations
- **Persistent history** — conversations survive page refreshes via localStorage
- **Multiple threads** — create, switch, rename, and delete named conversation sessions
- **Sidebar** — always-visible left panel grouping threads by Today / Yesterday / Older
- **Automatic summarization** — when a conversation exceeds 20 messages, older messages are compressed into a memory note and injected into the system prompt. Your character builds an understanding of you over time without the context window growing forever
- **Clear history** — Settings → HISTORY section

### Character system
- **Character name + bio** — injected into the AI system prompt to define personality
- **Wiki Fill** — auto-populate a character bio from Wikipedia
- **Mood slider** — 5 levels from FERAL (chaotic, ≤300 tokens) to STRICTLY BUSINESS (thorough, ≤4096 tokens). Controls both personality and response length
- **Avatar** — click the character panel to upload any image as a sprite
- **Cyberpunk visualizer** — animated radial bar equalizer behind the avatar. Reacts to live audio if you allow mic access; animates on its own otherwise
- **Skin export/import** — bundle name, bio, mood, and avatar into a `.skin.json` file to save or share
- **Share link** — generates a URL with the skin encoded in the hash

### Local server (requires `node server.js`)
The server gives Tank Girl OS full filesystem and terminal access — similar to Claude Code.

| Tool | What it does |
|---|---|
| `read_file` | Read any file within your home directory |
| `write_file` | Create or edit files |
| `list_dir` | Browse the filesystem |
| `run_command` | Run shell commands (requires your approval each time) |
| `web_fetch` | Fetch any URL and return readable text |
| `slack` | List channels, read history, search, send messages |
| `linear` | List teams/issues, get details, create issues |

Tool calls show as a collapsible trace above each answer so you can see what the model did.

### Integrations
- **Slack** — add a bot token in Settings → INTEGRATIONS. Create a bot at [api.slack.com/apps](https://api.slack.com/apps) with scopes: `channels:read channels:history groups:read groups:history search:read chat:write`
- **Linear** — add an API key in Settings → INTEGRATIONS (Settings → API → Personal API keys in Linear)

### Productivity
- **Context attachment** — 📎 button attaches a file or pasted text to your next message
- **Copy button** — hover any message to copy it. Shows **copied!** on success
- **Thread search** — sidebar search filters your thread list by name
- **Markdown rendering** — responses render bold, italic, code blocks, lists, and headings

### Keyboard shortcuts

| Shortcut | Action |
|---|---|
| `Enter` | Send message |
| `Shift+Enter` | New line in input |
| `Escape` | Close any open panel |
| `Cmd/Ctrl + K` | Focus model selector |
| `Cmd/Ctrl + ,` | Open settings |
| `Cmd/Ctrl + Shift + C` | Toggle compare mode |

---

## Security

The local server is hardened for personal use:

- **Secret token** — generated on first start, saved to `.tgos-secret`, injected into the page at serve time. Every API request requires it. Unauthorized processes and websites are blocked
- **CORS restriction** — only `http://127.0.0.1:3001` and `file://` are allowed
- **Path sandbox** — file operations are restricted to your home directory and `/tmp`. System files, SSH keys, and credentials outside your home are unreachable
- **Command confirmation** — every shell command the model wants to run shows a modal with the exact command, requiring your explicit approval before anything executes
- `.tgos-secret` and `.tgos-config.json` are gitignored and never committed

---

## How memory works

Tank Girl OS uses a layered memory system:

1. **Active messages** — the last 6 messages are always sent verbatim to the API
2. **Summary** — when history exceeds 20 messages, older ones are compressed by the model into a dense memory note (who you are, what you're working on, key decisions). This note lives in the system prompt on every future call
3. **Persistence** — everything is stored in `localStorage` and (when the server is running) `.tgos-config.json`

---

## How conversation threads work

Each thread is stored independently in `localStorage`:

```
tgos_convs          → index: [{id, name, preview, updatedAt}]
tgos_conv_{id}      → data:  {messages, tokenCount, summary}
tgos_active_conv    → the currently active thread ID
tgos_config         → settings: {charName, bio, apiKey, model, slackToken, linearKey}
```

When the server is running, settings are also persisted to `.tgos-config.json` on disk so they survive across browser origins.

---

## Tech stack

- Vanilla HTML, CSS, JavaScript — no frameworks, no build step
- [Fireworks AI inference API](https://fireworks.ai) — streaming chat completions + tool calling
- Node.js + Express — local server for filesystem/terminal/integration access
- `localStorage` + `.tgos-config.json` — all persistence
- [Wikipedia REST API](https://en.wikipedia.org/api/rest_v1/) — Wiki Fill feature
- Web Audio API — visualizer mic input

---

## Skins

A skin bundles your character's name, bio, mood level, and avatar image into a portable `.skin.json` file. Export from Settings → SKIN → Export .skin. Import someone else's skin to load their character instantly. Share links encode the skin as base64 in the URL hash (images over ~6KB should use file export instead).
