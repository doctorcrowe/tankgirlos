# Changelog

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
