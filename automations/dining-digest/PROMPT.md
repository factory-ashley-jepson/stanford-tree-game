# Stanford Dining Digest

Tell me where to eat today, based on every Stanford dining hall's menu and my preferences.

## My preferences

Edit this list any time. The next run uses it.

- Vegetarian: only count items tagged `vegetarian` or `vegan`.
- I love spicy food: favor items with chili, curry, jalapeño, sriracha, gochujang, harissa, or "spicy" in the name or ingredients.
- No mushrooms: ignore any item with mushroom in its name or ingredients.

## Each run

1. **Get the menus.** If `fetch_menus.py` is not in the working directory, download it:
   `curl -fsSL https://raw.githubusercontent.com/factory-ashley-jepson/stanford-tree-game/main/automations/dining-digest/fetch_menus.py -o fetch_menus.py`
   Then run `python3 fetch_menus.py --out reports/menus-$(TZ=America/Los_Angeles date +%F).json`. Skip halls whose status is `closed`. If every hall errors, DM me that the menu site is down and stop.
2. **Use my preferences** from the "My preferences" section above. They always win over anything saved from earlier runs.
3. **Rank the open halls** separately for lunch and dinner. Score each hall by how many items I'd actually want, with extra weight for spicy dishes and a real main dish (not just sides or toppings).
4. **Avoid repeats.** Read `memory/history.md`. Don't make the same hall my top pick for the same meal three days in a row; use the next-best hall instead.
5. **Send me a Slack DM** using Slack mrkdwn, exactly in this layout (blank lines included, dish names shortened to fit one line):

   ```
   :evergreen_tree:  *Where to eat today*  ·  Thursday, Oct 1

   :sunny:  *LUNCH  →  Florence Moore*
   • :hot_pepper: Miso Tofu Stir-Fry
   • Collard Greens
   • Seasonal Vegetable Board

   :crescent_moon:  *DINNER  →  Arrillaga*
   • :hot_pepper: Rasta Pasta
   • Wild Rice Pilaf with Cranberries
   • Fried Plantain

   :repeat:  _Runners-up:_  Lakeside for lunch  ·  Wilbur for dinner
   :gear:  _Picked for: vegetarian · loves spicy · no mushrooms_
   ```

   List 2-3 dishes per meal, best first. Put :hot_pepper: only before spicy dishes. Use short hall names (drop "Dining" and "Commons"). The last line summarizes the "My preferences" section in a few words.
6. **Remember.** Append today's date and top picks to `memory/history.md`. Keep only the last 14 days.
