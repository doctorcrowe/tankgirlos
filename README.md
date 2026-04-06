# Tank Girl OS

A single-file cyberpunk AI chat interface that calls the [Fireworks AI](https://fireworks.ai) inference API directly from your browser. No backend, no build step, no dependencies — just open `index.html` and go.

Built as a personal daily work tool and model testing environment.

---

## Getting started

1. Open `index.html` in any modern browser
2. Click **⚙** (top right) or **⚙ CUSTOMIZE** (sidebar) to open Settings
3. Paste your Fireworks API key (`fw_xxxxxxxxxxxxxxxx`) — get one free at [fireworks.ai](https://fireworks.ai)
4. Hit **APPLY**
5. Start chatting

Your API key is stored in your browser only. It never leaves your device.

---

## Features

### Models
- **Inline model selector** in the inference bar — switch models without opening settings
- Curated list of current Fireworks models grouped by tier (Frontier / Mid / Fast)
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
- **Skin export/import** — bundle name, bio, mood, and avatar into a `.skin.json` file to save or share
- **Share link** — generates a URL with the skin encoded in the hash

### Productivity
- **Context attachment** — 📎 button attaches a file or pasted text to your next message. Supports `.txt`, `.md`, `.js`, `.ts`, `.py`, `.json`, `.html`, `.css`, `.yaml`, `.sh`, `.csv`
- **Copy button** — hover any message to reveal a copy icon at the bottom right
- **Thread search** — sidebar search filters your thread list by name
- **Markdown rendering** — responses render bold, italic, code blocks, lists, and headings

### Keyboard shortcuts

| Shortcut | Action |
|---|---|
| `Enter` | Send message |
| `Escape` | Close any open panel |
| `Cmd/Ctrl + K` | Focus model selector |
| `Cmd/Ctrl + ,` | Open settings |
| `Cmd/Ctrl + Shift + C` | Toggle compare mode |

---

## How memory works

Tank Girl OS uses a layered memory system:

1. **Active messages** — the last 6 messages are always sent verbatim to the API
2. **Summary** — when history exceeds 20 messages, older ones are compressed by the model into a dense memory note (who you are, what you're working on, key decisions). This note lives in the system prompt on every future call
3. **Persistence** — everything is stored in `localStorage` under your browser, keyed per conversation thread

This means your character accumulates context about you over time without the API cost of sending thousands of messages on every call.

---

## How conversation threads work

Each thread is stored independently in `localStorage`:

```
tgos_convs          → index: [{id, name, preview, updatedAt}]
tgos_conv_{id}      → data:  {messages, tokenCount, summary}
tgos_active_conv    → the currently active thread ID
tgos_config         → settings: {charName, bio, apiKey, model}
```

Threads are grouped in the sidebar by recency. Summarization and memory run independently per thread.

---

## Tech stack

- Vanilla HTML, CSS, JavaScript — no frameworks, no build step
- [Fireworks AI inference API](https://fireworks.ai) — streaming chat completions
- `localStorage` — all persistence
- [Wikipedia REST API](https://en.wikipedia.org/api/rest_v1/) — Wiki Fill feature

---

## Skins

A skin bundles your character's name, bio, mood level, and avatar image into a portable `.skin.json` file. Export from Settings → SKIN → Export .skin. Import someone else's skin to load their character instantly. Share links encode the skin as base64 in the URL hash (images over ~6KB should use file export instead).
