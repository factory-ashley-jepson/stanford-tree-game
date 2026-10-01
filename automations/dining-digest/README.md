# Stanford Dining Digest

A scheduled Factory automation that checks every Stanford dining hall menu each morning and DMs you where to eat.

- `fetch_menus.py` pulls today's lunch and dinner menus for all 9 halls from [R&DE](https://rdeapps.stanford.edu/dininghallmenu/) as JSON. Python 3.9+ standard library only; a run takes about 10-20 seconds.
- `PROMPT.md` is the automation's instructions. Edit the "My preferences" list to match your taste before you paste it in.

## Change your preferences later

Your preferences live in the automation's instructions, so the next run always uses the latest version.

- **In the app:** open [app.factory.ai/automations](https://app.factory.ai/automations), choose your automation, edit the "My preferences" list in its instructions, and save. Press **Run now** to see the new picks right away.
- **From Droid:** in any session, ask `update my Stanford Dining Digest automation: I'm vegan now and I don't like eggplant`.

The last line of every DM shows the preferences it used, so you can tell when a change took effect.

## Set it up

1. Open [app.factory.ai/automations](https://app.factory.ai/automations) and choose **New automation**, then **Create with Droid**.
2. Paste the contents of `PROMPT.md` and say when it should run, for example `every day at 10am Pacific`.
3. Pick where it runs. A Droid Computer keeps it running when your laptop is closed.

Or ask Droid in any session: `create a scheduled automation that runs every day at 10am Pacific with the instructions in automations/dining-digest/PROMPT.md`.

## Try the script

```bash
python3 fetch_menus.py                          # today, lunch and dinner, all halls
python3 fetch_menus.py --halls Arrillaga,Wilbur --meals Dinner
```

Halls with no posted menu come back as `"status": "closed"`. The site only offers today plus the next 6 days.
