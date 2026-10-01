# AGENTS.md

A small browser game starring Cardy, the Stanford Tree. Students build it during a 30-minute workshop, so favor small, working steps over big rewrites.

## Run

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000. There is no build step and nothing to install.

## Project layout

- `index.html`: page shell. Loads `game.js`.
- `game.js`: canvas setup, game loop, input, and image loading at the top; the game itself in `update(dt)` and `draw()` at the bottom.
- `assets/tree.png` (834x1076) and `assets/tree-small.png` (198x256): Cardy, transparent PNGs.
- `SPEC.md`: the plan for this game. It is the source of truth for what "done" means.

## Rules

- Plain JavaScript and the Canvas 2D API only. No npm, no frameworks, no CDNs, no build tools. The game must work offline.
- Keep Cardy as the hero. Draw other art with canvas shapes or add small images to `assets/`.
- Reuse the helpers in `game.js` (`input.isDown`, `input.wasPressed`, `input.pointer`, `loadImage`, `drawImage`, `screen.width/height`) instead of adding new event listeners or resize logic.
- Scale positions and sizes from `screen.width` and `screen.height` so the game works on any window size, including phones.
- `game.js` can grow into more files. Add each as a plain `<script>` tag in `index.html` before `game.js`.

## Workflow: plan, build, test, ship

1. **Plan.** If `SPEC.md` still says "Not planned yet", run the `plan-game` skill before writing any game code.
2. **Build.** Implement `SPEC.md` one Definition of done item at a time. After each item, make sure the game still loads.
3. **Test.** Run the `playtest` skill before saying the game or a feature is done. Every Definition of done item must pass.
4. **Ship.** Commit after each working step with a short message that says what the player can now do.

Do not start stretch goals until every Definition of done item passes.

## Verify

- `node --check game.js` (and any other `.js` files) passes, if Node is installed.
- The page loads with no errors in the browser console.
- The controls listed in `SPEC.md` work.
