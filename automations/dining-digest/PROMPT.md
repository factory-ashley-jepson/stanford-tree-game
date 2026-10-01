# Stanford Dining Digest

Tell me where to eat today, based on every Stanford dining hall's menu and my preferences.

## Each run

1. **Get the menus.** If `fetch_menus.py` is not in the working directory, download it:
   `curl -fsSL https://raw.githubusercontent.com/factory-ashley-jepson/stanford-tree-game/main/automations/dining-digest/fetch_menus.py -o fetch_menus.py`
   Then run `python3 fetch_menus.py --out reports/menus-$(TZ=America/Los_Angeles date +%F).json`. Skip halls whose status is `closed`. If every hall errors, DM me that the menu site is down and stop.
2. **Read my preferences** from `memory/preferences.md`. If the file doesn't exist, create it with:
   - Vegetarian: only count items tagged `vegetarian` or `vegan`.
   - I love spicy food: favor items with chili, curry, jalapeño, sriracha, gochujang, harissa, or "spicy" in the name or ingredients.
   - No mushrooms: ignore any item with mushroom in its name or ingredients.
3. **Rank the open halls** separately for lunch and dinner. Score each hall by how many items I'd actually want, with extra weight for spicy dishes and a real main dish (not just sides or toppings).
4. **Avoid repeats.** Read `memory/history.md`. Don't make the same hall my top pick for the same meal three days in a row; use the next-best hall instead.
5. **Send me a Slack DM** in this shape, eight lines or fewer:
   - `*Where to eat today* (Thursday, Oct 1)`
   - `*Lunch: <hall>*`, then the 2-3 dishes worth the walk
   - `*Dinner: <hall>*`, then the 2-3 dishes worth the walk
   - `_Runners-up:_` one hall for lunch, one for dinner
6. **Remember.** Append today's date and top picks to `memory/history.md`. Keep only the last 14 days.
