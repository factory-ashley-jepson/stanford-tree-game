---
name: plan-game
description: Plan the student's remix of Big Game Run and write SPEC.md before any code is changed. Use when the user wants to start, plan, or redesign their Stanford Tree game, or when SPEC.md still says "Not planned yet". Never writes game code.
---

# Plan the game

This is the **Plan** step of plan, build, test, ship. The output is a filled-in `SPEC.md` that the student approves. The game starts as Big Game Run, a working retro runner (see `game.js` and `README.md`). The remix is theirs to invent; your job is to turn their idea into a plan small enough to build in about 15 minutes.

## Steps

1. Read `SPEC.md` and skim `game.js` so you know what Big Game Run already does. If `SPEC.md` is already filled in, ask whether to revise it or start over.
2. Ask the student up to 4 questions in a single batch (use the AskUser tool if you have it). Offer 3-4 concrete options per question and let them write their own answer:
   - **The remix:** what changes (for example: a new setting like finals week at Green Library, new obstacles like scooters or a Cal Bear boss, a new power-up, a new move like a dash, or a different game such as a flyer or a catch game on the same engine).
   - **Goal:** how they score, lose, and (optionally) win.
   - **Controls:** keep Space, Up, and Down, or add new inputs.
   - **Vibe:** setting, colors, and mood (for example: Main Quad at sunset, finals week at Green Library, night run with stars).
   If the student already described their idea in the prompt, skip the questions they answered.
3. Write `SPEC.md` using the template's sections. Keep it short:
   - **What changes:** list each change from Big Game Run. Keep everything else as is.
   - **Core loop:** one main mechanic. Cut anything that needs a second mechanic to be fun.
   - **Controls:** a table with every input the game uses.
   - **Definition of done:** 5-7 items. Each one must be checkable by playing for 30 seconds, for example "Scooters appear after 200 points and end the run on contact" or "Pressing P pauses the game". Keep "The game loads at http://localhost:8000 with no console errors" as the first item. Keep a game-over state and a way to restart.
   - **Stretch goals:** 3 ideas, ordered from easiest to hardest.
   - Remove the "Not planned yet" note.
4. Show the student a 3-line summary (pitch, what changes, how you win or lose) and ask them to approve it or change it.
5. Stop after approval. Tell them the next step is to ask Droid to build `SPEC.md`, then run `/playtest`.

## Rules

- Do not edit `game.js`, `sprites.js`, `engine.js`, `index.html`, `style.css`, or anything other than `SPEC.md`.
- Respect the stack and the retro pixel look in `AGENTS.md`, and don't plan features that need a server, accounts, or network calls.
- If the idea is too big for 15 minutes, keep the fun part and move the rest to stretch goals. Say what you moved.
