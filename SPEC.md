# Game Spec

You start from **Tree Run**: Cardy runs right, jumps cones and bikes, ducks under birds, and the world speeds up until you crash. Your remix can change a little or a lot.

## Pitch

**Big Game Run:** Cardy sprints across campus on Big Game day, double-jumping Cal Bears and grabbing acorns and boba as the sun sets, so every run feels a little different and the night gets harder.

## What changes

- **New move:** a double jump. Press jump again in the air for one smaller extra jump.
- **New obstacle:** Cal Bears show up after 300 points and walk toward Cardy, faster than the scrolling world.
- **Collectible:** acorns float in the gaps between obstacles and are worth +25 points each.
- **Power-up:** boba gives Cardy a 4-second shield that smashes the next obstacle. A timer bar shows in the top-left corner.
- **Day and night:** every 500 points the sky fades between day and night, with stars and a crescent moon.

## Core loop

Run, jump or double-jump over cones, bikes, and bears, duck under birds, and grab acorns and boba for points and protection.

## Controls

| Input | Action |
| ----- | ------ |
| Space, Up, or tap the screen | Start, jump, and jump again in the air |
| Down | Duck |
| M | Mute sound |
| On-screen JUMP and Down keys | Jump and duck on a phone |

## Win / lose

- **Score:** distance run plus 25 for each acorn. The best score is saved in the browser.
- **Lose when:** Cardy hits an obstacle without a boba shield.
- **Win when (optional):** no win state; beat your best score.

## Look and sound

Stanford campus in the retro pixel style: green hills, Hoover Tower, and a sandy path in the day; navy hills, stars, and a moon at night. Cal Bears are gold and navy. Short `beep()` sounds play for jumps, the double jump, acorns, the shield, and crashes. Cardy stays the hero.

## Definition of done

Every item must be something you can check by playing for 30 seconds.

- [x] The game loads at http://localhost:8000 with no console errors
- [x] Pressing jump again in the air does a double jump, only once per jump
- [x] Grabbing an acorn adds 25 points and shows a "+25" popup
- [x] Grabbing boba gives a 4-second shield with a timer bar, and hitting an obstacle while shielded smashes it instead of ending the run
- [x] Cal Bears appear after 300 points and walk toward Cardy faster than the scroll
- [x] At 500 points the sky fades to night with stars and a moon, and the text and ground stay readable
- [x] Crashing shows game over, saves the best score, and restarting starts a fresh day run

## Stretch goals

Only start these after every item in Definition of done passes.

1. Background music made with `beep()`
2. A pause key
3. Lives or hearts instead of one-hit game over
