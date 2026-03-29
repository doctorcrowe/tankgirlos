# Changelog

## [1.1.0] - 2026-03-28

### Added
- **Wiki Fill** — auto-populates character bio from Wikipedia. Searches by name so fuzzy titles like "Incredible Hulk" work correctly
- **Default Tank Girl avatar** — animated pixel art GIF embedded in the file, loads on first open with no setup required
- **Default Tank Girl bio** — pre-loaded so the AI knows who she is out of the box
- **Dynamic welcome message** — updates to match the loaded character name; prompts setup steps for new users

### Changed
- **Mood system overhauled** — Feral and Chaotic stay in full character mode; Balanced keeps personality but always gives a real answer; Professional and Strictly Business drop the character entirely and prioritize useful, accurate responses
- **Bio injection** — character bio only injected in Feral/Chaotic/Balanced moods; Professional and Strictly Business ignore it so the AI doesn't cosplay when you need real help
- **Sprite sheet removed** — simplified avatar system, plain image upload only
- **Font sizes increased** across the board — messages, inference bar, stats, input
- **Header icons doubled in size** — ?, ⚙, and × buttons now much easier to click
- **Status dots doubled in size**
- **Feral mood** no longer hardcodes "You live in a tank" — works correctly for any character

### Fixed
- New characters (e.g. Hulk) no longer bleed Tank Girl lore in their responses
- Wiki Fill returns results for characters whose Wikipedia title doesn't exactly match the input

---

## [1.0.0] - 2026-03-27

### Initial release
- Single-file cyberpunk AI chat interface
- Fireworks AI integration (Kimi K2.5 Turbo via Fire Pass router)
- Animated avatar with idle/talking states
- Mood slider (Feral → Strictly Business) with accent color theming
- Skin export/import and share-by-URL
- Help/onboarding overlay
- Markdown rendering in responses
- Avatar and settings persistence via localStorage
