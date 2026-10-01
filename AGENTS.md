# AGENTS.md

Tree Run: a retro pixel-art runner starring Cardy, the Stanford Tree, shown on an old-school computer. Students remix it during a 30-minute workshop, so favor small, working steps over big rewrites.

## Run

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000. There is no build step and nothing to install.

## Project layout

Scripts load in this order from `index.html`: `sprites.js`, `engine.js`, `game.js`.

- `game.js`: the game. Tuning constants at the top, then state, `update(dt)`, and `draw()`.
- `sprites.js`: `PALETTE` (one letter per color) and `SPRITES` (pixel art as rows of letters, `.` is transparent).
- `engine.js`: the 256x192 screen, `rect`, `clear`, `drawSprite`, `spriteSize`, `drawText`, `textWidth`, `input`, `beep`, `rand`, `pick`, `overlaps`, `save`, `load`, and the game loop. Change it only when a helper is missing.
- `index.html` and `style.css`: the retro computer (monitor, CRT effects, keyboard). Elements with `data-key="Space"` and similar act as on-screen keys and light up when the key is pressed.
- `assets/tree.png` (834x1076) and `assets/tree-small.png` (198x256): high-resolution Cardy, transparent PNGs.
- `SPEC.md`: the plan for the student's remix. It is the source of truth for what "done" means.

## Rules

- Plain JavaScript and the Canvas 2D API only. No npm, no frameworks, no CDNs, no build tools. The game must work offline.
- Keep the retro pixel look. Draw everything on the 256x192 screen with the engine helpers, in whole pixels. Add new art as sprites in `sprites.js` using `PALETTE` letters (add colors to `PALETTE` if needed), and use `drawText` for text. Don't turn on image smoothing or draw high-resolution images in gameplay.
- Keep Cardy as the hero, and keep the game inside the retro computer.
- Reuse the helpers in `engine.js` instead of adding new event listeners, loops, or resize logic. For a new on-screen control, add an element with a `data-key` attribute.
- New game files go in as plain `<script>` tags in `index.html`, after `engine.js` and before `game.js`.

## Workflow: plan, build, test, ship

1. **Plan.** If `SPEC.md` still says "Not planned yet", run the `plan-game` skill before changing game code.
2. **Build.** Implement `SPEC.md` one Definition of done item at a time. After each item, make sure the game still loads.
3. **Test.** Run the `playtest` skill before saying the game or a feature is done. Every Definition of done item must pass.
4. **Ship.** Commit after each working step with a short message that says what the player can now do.

Do not start stretch goals until every Definition of done item passes.

## Verify

- `node --check` passes on every `.js` file, if Node is installed.
- The page loads with no errors in the browser console.
- The controls listed in `SPEC.md` work.
- Game state lives in top-level variables (`state`, `score`, `speed`, `cardy`, `obstacles`), so a browser tool can read them to confirm behavior.
