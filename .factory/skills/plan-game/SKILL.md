---
name: plan-game
description: Plan the student's game and write SPEC.md before any code is written. Use when the user wants to start, plan, or redesign their Stanford Tree game, or when SPEC.md still says "Not planned yet". Never writes game code.
---

# Plan the game

This is the **Plan** step of plan, build, test, ship. The output is a filled-in `SPEC.md` that the student approves. The game itself is theirs to invent; your job is to turn their idea into a plan small enough to build in about 15 minutes.

## Steps

1. Read `SPEC.md`. If it is already filled in, ask whether to revise it or start over.
2. Ask the student up to 4 questions in a single batch (use the AskUser tool if you have it). Offer 3-4 concrete options per question and let them write their own answer:
   - **The game:** what kind of game, and what Cardy does in it (for example: dodge falling acorns, run across Main Quad, fly between Hoover Towers, sort trash before the bin fills, rhythm game to the band).
   - **Goal:** how they score, lose, and (optionally) win.
   - **Controls:** keyboard, mouse or tap, or both.
   - **Vibe:** setting and mood (for example: Main Quad at sunset, Big Game night, finals week at Green Library).
   If the student already described their idea in the prompt, skip the questions they answered.
3. Write `SPEC.md` using the template's sections. Keep it short:
   - **Core loop:** one main mechanic. Cut anything that needs a second mechanic to be fun.
   - **Controls:** a table with every input the game uses.
   - **Definition of done:** 5-7 items. Each one must be checkable by playing for 30 seconds, for example "Pressing Space makes Cardy jump" or "The score goes up by 1 for each acorn dodged". Keep "The game loads at http://localhost:8000 with no console errors" as the first item. Include a game-over state and a way to restart.
   - **Stretch goals:** 3 ideas, ordered from easiest to hardest.
   - Remove the "Not planned yet" note.
4. Show the student a 3-line summary (pitch, core loop, how you win or lose) and ask them to approve it or change it.
5. Stop after approval. Tell them the next step is to ask Droid to build `SPEC.md`, then run `/playtest`.

## Rules

- Do not edit `game.js`, `index.html`, or anything other than `SPEC.md`.
- Respect the stack in `AGENTS.md` (plain JavaScript and canvas, no libraries), and don't plan features that need a server, accounts, or network calls.
- If the idea is too big for 15 minutes, keep the fun part and move the rest to stretch goals. Say what you moved.
