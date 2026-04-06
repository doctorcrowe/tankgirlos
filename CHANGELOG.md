# Changelog

## v1.3.1

### Slack improvements
- **Delete messages** — new `delete_message` action uses `chat.delete`; requires `ts` from `read_channel`
- **Edit messages** — new `edit_message` action uses `chat.update`; pass `ts` + new `text`
- **Channel name resolution** — AI now calls `list_channels` automatically when given a channel name instead of an ID; no more manual ID lookup
- **Raw `ts` in read_channel** — message history now includes `(ts:...)` alongside the human date so the model can reference and act on specific messages
- **Settings button fix** — `SERVER_URL` and `serverFetch` moved before `loadSettings` to prevent a JS crash that broke the settings panel on load

---

## v1.3.0

### Local Server & Tool Calling
- **`server.js`** — Express server on `127.0.0.1:3001` giving Tank Girl OS Claude Code-style capabilities
- **`start.command`** — double-click launcher for macOS (auto-kills previous instance on restart)
- **Custom icon** — Tank Girl face applied to `start.command` via `make_icon.py` + background removal
- **Tool loop** — when the server is running, messages go through a non-streaming tool-calling loop instead of direct streaming
- **Tools available to the model:**
  - `read_file` — read any file within your home directory
  - `write_file` — create or edit files
  - `list_dir` — browse the filesystem
  - `run_command` — execute shell commands (with confirmation prompt)
  - `web_fetch` — fetch any URL and return readable text
  - `slack` — list channels, read channel history, search messages, send messages
  - `linear` — list teams/issues, get issue details, create issues
- **Tool trace** — collapsible `[N tool calls]` block above each answer shows what the model did
- **Server status dot** — green/gray dot in the inference bar; pings every 15 seconds

### Integrations
- **Slack** — add a bot token in Settings → INTEGRATIONS. Needs `channels:read channels:history groups:read groups:history search:read chat:write` scopes
- **Linear** — add an API key in Settings → INTEGRATIONS. Supports listing, reading, and creating issues
- Settings panel has a dedicated INTEGRATIONS section

### Security
- **Secret token** — generated once on first server start, saved to `.tgos-secret`. Injected into the page at serve time and required on every API request (`X-TGOS-Token` header). Blocks any unauthorized local process or website from hitting the API
- **CORS hardened** — restricted from `*` to `http://127.0.0.1:3001` and `file://` only
- **Path sandbox** — file read/write/list operations restricted to home directory and `/tmp`. SSH keys, AWS credentials, and system files are unreachable
- **Command confirmation modal** — before any shell command runs, a red modal shows the exact command and requires Allow or Deny
- `.tgos-secret` and `.tgos-config.json` are gitignored

### Config persistence
- Settings (API keys, Slack token, Linear key, character, model) now saved to `.tgos-config.json` on disk via the server
- Survives origin changes — same config whether opening as `file://` or `http://127.0.0.1:3001`
- Falls back to `localStorage` if the server is offline

### Visual
- **Cyberpunk radial visualizer** — animated canvas behind the avatar; radial bars pulse pink → cyan in a ring with a rotating scan line
- Tries microphone via Web Audio API (bars react to live audio); falls back to a sine-wave animation if mic is denied or unavailable

### Bug fixes
- **Copy button** — now works on `file://` protocol using `execCommand` fallback; shows green **copied!** for 1.8s on success
- **Linear `create_issue`** — fixed "Argument Validation Error"; `team_id` now validated early with a clear message, `description` excluded from input if not provided, tool schema clarifies UUID vs. key

---

## v1.2.0

### Persistence & Memory
- **Persistent conversation history** — messages survive page refresh via `localStorage` (`tgos_history` → per-thread keys)
- **Conversation summarization** — after 20 messages, older history is compressed by the model into a memory note injected into the system prompt. Summaries layer over time so the character builds a running understanding of the user across sessions
- **Multiple conversation threads** — full session management with create, switch, rename, and delete. Each thread stores messages, token count, and summary independently
- **Migration** — existing single-key history auto-migrates to Thread 1 on first load

### UI
- **Always-visible sidebar** — left panel (220px) with thread list grouped by Today / Yesterday / Older, always in view
- **Sidebar search** — magnifying glass + search input filters thread list by name
- **+ NEW SESSION** button at top of sidebar
- **⚙ CUSTOMIZE** shortcut in sidebar footer opens Settings
- Removed floating search bar (was above inference area — wrong place)

### Model selector
- **Inline model selector** in the inference bar — switch Fireworks models without opening Settings
- Curated model list grouped by tier: Frontier, Mid, Fast, plus Custom fallback
- Changing model saves immediately to `tgos_config`

### Compare mode
- **SPLIT button** in the inference bar toggles compare mode
- Second model selector appears when active
- Both models stream simultaneously on send; primary response saves to history, compare response is ephemeral (labeled with model name, not persisted)
- `Cmd/Ctrl + Shift + C` keyboard shortcut

### Messages
- **Copy button** — hover any message to reveal a copy icon (two overlapping squares SVG) at the bottom right. Shows ✓ on success
- Copy works on historically restored messages (loadHistory now calls addMessage instead of duplicating DOM code)

### Context attachment
- **📎 attach button** next to the input opens an overlay
- Paste any text or upload a file (`.txt`, `.md`, `.js`, `.ts`, `.jsx`, `.tsx`, `.py`, `.json`, `.html`, `.css`, `.csv`, `.yaml`, `.yml`, `.sh`)
- Attached context is wrapped with a named header and prepended to the next message, then cleared
- Badge in the input area shows what's attached; × removes it

### Response length
- **Max tokens tied to mood** — FERAL: 300, CHAOTIC: 500, BALANCED: 1000, PROFESSIONAL: 2048, STRICTLY BUSINESS: 4096
- Prevents frontier models from ignoring soft brevity instructions

### Keyboard shortcuts
- `Escape` — close any open panel (settings, help, search)
- `Cmd/Ctrl + K` — focus model selector
- `Cmd/Ctrl + ,` — open settings
- `Cmd/Ctrl + Shift + C` — toggle compare mode

---

## v1.1.0

- Bigger UI
- Smarter Wiki Fill (search fallback when direct lookup fails)
- Mood system fixes
- Tank Girl set as default character

## v1.0.0

- Initial release
- Single-file HTML/CSS/JS
- Fireworks AI streaming chat completions
- Mood slider (5 levels, affects persona and accent color)
- Character name + bio system injected into system prompt
- Animated avatar with emoji or uploaded image sprite
- Skin export/import as `.skin.json`
- Share link via URL hash (base64-encoded skin)
- Wiki Fill — auto-populate bio from Wikipedia
