---
name: playtest
description: Test the game against SPEC.md's Definition of done and report pass or fail for each item. Use after building a feature, before calling the game done, or when the user asks to test, playtest, or check the game.
---

# Playtest

This is the **Test** step of plan, build, test, ship. Check the game against every item in `SPEC.md` and report evidence, not impressions.

## Steps

1. **Read the spec.** Open `SPEC.md` and list its Definition of done items. If it still says "Not planned yet", stop and suggest `/plan-game` first.
2. **Static checks.** If Node is installed, run `node --check` on every `.js` file. Fix syntax errors before going further.
3. **Serve the game.** Check whether something already answers at http://localhost:8000 (`curl -sf http://localhost:8000/ > /dev/null`). If not, start `python3 -m http.server 8000` in the background. Then confirm `index.html`, `style.css`, `sprites.js`, `engine.js`, `game.js`, and any other file referenced in `index.html` return HTTP 200.
4. **Play it.**
   - If you have a browser tool, open http://localhost:8000, take a screenshot, read the console for errors, and exercise each control from the spec (press the keys, click or tap). Take a screenshot after the actions that matter, such as scoring and game over. Game state lives in top-level variables (`state`, `score`, `speed`, `cardy`, `obstacles`), so you can read them with the browser tool's JavaScript eval to confirm what happened, for example that `state` becomes `"over"` after a crash. If the page still shows old code after an edit, open it with a new query string such as `?v=2`.
   - If you don't have a browser tool, read the code paths for each Definition of done item, then ask the student to play for 30 seconds and confirm the items you could not verify yourself (use the AskUser tool if you have it, one question per unverified item, with Yes / No / Sort of options).
5. **Report** a table with one row per Definition of done item:

   | Item | Result | Evidence |
   | ---- | ------ | -------- |
   | Pressing Space makes Cardy jump | Pass | After pressing Space, `cardy.onGround` was false and the screenshot shows Cardy in the air |

   Results are **Pass**, **Fail**, or **Not verified**. Then list any bugs you noticed outside the spec, such as blurry pixels, input that sticks, on-screen keys that don't respond, or a game that can't restart.

6. **Next step.**
   - If anything failed, propose the smallest fix for each failure and ask before changing code. After fixing, run this skill again.
   - If everything passed, check the boxes in `SPEC.md`, suggest a commit (the **Ship** step), and offer the first stretch goal.

## Rules

- Never mark an item Pass without evidence from a screenshot, console output, a command, a game-state read, or the student's confirmation.
- Don't edit game code while testing; testing and fixing are separate steps.
- Leave the server running when you finish so the student can keep playing.
