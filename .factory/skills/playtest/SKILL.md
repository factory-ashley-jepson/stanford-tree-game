---
name: playtest
description: Test the game against SPEC.md's Definition of done and report pass or fail for each item. Use after building a feature, before calling the game done, or when the user asks to test, playtest, or check the game.
---

# Playtest

This is the **Test** step of plan, build, test, ship. Check the game against every item in `SPEC.md` and report evidence, not impressions.

## Steps

1. **Read the spec.** Open `SPEC.md` and list its Definition of done items. If it still says "Not planned yet", stop and suggest `/plan-game` first.
2. **Static checks.** If Node is installed, run `node --check` on every `.js` file. Fix syntax errors before going further.
3. **Serve the game.** Check whether something already answers at http://localhost:8000 (`curl -sf http://localhost:8000/ > /dev/null`). If not, start `python3 -m http.server 8000` in the background. Then confirm `index.html`, `game.js`, and every image referenced in the code return HTTP 200.
4. **Play it.**
   - If you have a browser tool, open http://localhost:8000, take a screenshot, read the console for errors, and exercise each control from the spec (press the keys, click or tap). Take a screenshot after the actions that matter, such as scoring and game over.
   - If you don't have a browser tool, read the code paths for each Definition of done item, then ask the student to play for 30 seconds and confirm the items you could not verify yourself (use the AskUser tool if you have it, one question per unverified item, with Yes / No / Sort of options).
5. **Report** a table with one row per Definition of done item:

   | Item | Result | Evidence |
   | ---- | ------ | -------- |
   | Pressing Space makes Cardy jump | Pass | Screenshot after pressing Space shows Cardy above the ground |

   Results are **Pass**, **Fail**, or **Not verified**. Then list any bugs you noticed outside the spec, such as things off screen on small windows, input that sticks, or a game that can't restart.

6. **Next step.**
   - If anything failed, propose the smallest fix for each failure and ask before changing code. After fixing, run this skill again.
   - If everything passed, check the boxes in `SPEC.md`, suggest a commit (the **Ship** step), and offer the first stretch goal.

## Rules

- Never mark an item Pass without evidence from a screenshot, console output, a command, or the student's confirmation.
- Don't edit game code while testing; testing and fixing are separate steps.
- Leave the server running when you finish so the student can keep playing.
