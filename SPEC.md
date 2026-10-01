# Game Spec

## Pitch

**Tree Run:** Cardy, the Stanford Tree, sprints across Main Quad at sunset, jumping over parked bikes and scooters; it's a one-button runner that gets faster the longer you survive.

## Core loop

Jump. Cardy stays about 20% from the left edge while bikes and scooters scroll in from the right. Time each jump to clear the next obstacle. The run speeds up a little every second, so the timing gets tighter.

## Controls

| Input | Action |
| ----- | ------ |
| Space, Arrow Up, W | Jump (only when Cardy is on the ground). Let go early for a short hop. |
| Click or tap | Jump |
| Enter, Space, click, or tap | Start from the title screen, or play again after game over |

## Win / lose

- **Score:** +1 for every obstacle Cardy clears. The best score is saved in `localStorage` under `treeRunHighScore`.
- **Lose when:** Cardy hits a bike or scooter. Hitboxes are inset about 22% from the sprite edges so near misses feel fair.
- **Win when (optional):** No win state. Beat your best score.

## Look and sound

Main Quad at sunset. A sky gradient from deep cardinal (#8C1515) to warm orange, a low sun, a Hoover Tower silhouette far back, and sandstone arches with red tile roofs in the middle distance. Both layers scroll slower than the ground (parallax). A green ground strip with a sandstone path. Bikes (two wheels and a frame) and scooters (deck and stem) are drawn with canvas shapes. Dust puffs when Cardy lands. Cardy (`assets/tree-small.png` in play, `assets/tree.png` on the title screen) is the hero.

Screens:

- **Title:** "TREE RUN", Cardy large, "press Space or tap to start", best score.
- **Playing:** score and best score in the top right.
- **Game over:** score, best score, "press Space or tap to play again".

## Definition of done

Every item must be something you can check by playing for 30 seconds.

- [x] The game loads at http://localhost:8000 with no console errors
- [x] Pressing Space (or Arrow Up, W, click, or tap) makes Cardy jump, only from the ground
- [x] Bikes and scooters spawn on the right, scroll left, and the run gets faster over time
- [x] The score goes up by 1 for each obstacle cleared, and the best score survives a page reload
- [x] Hitting an obstacle ends the run and shows a game over screen with score and best
- [x] Pressing Space, Enter, or tapping on the game over screen starts a fresh run

## Stretch goals

Only start these after every item in Definition of done passes.

1. Sound effects with the Web Audio API: a jump blip, a score tick, and a crash thud.
2. An acorn power-up that floats above the path and grants one double jump.
3. Phone polish: a short vibration on crash (`navigator.vibrate`) and a local top-5 leaderboard with initials.
