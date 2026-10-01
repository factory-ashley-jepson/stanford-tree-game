#!/usr/bin/env python3
"""Fetch Stanford R&DE dining hall menus for one day as JSON (stdlib only)."""
import argparse
import html
import http.cookiejar
import json
import os
import re
import ssl
import sys
import time
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

URL = "https://rdeapps.stanford.edu/dininghallmenu/"
try:
    TZ = ZoneInfo("America/Los_Angeles")
except Exception:  # noqa: BLE001 - minimal containers may lack tzdata; PST is close enough for "today"
    TZ = timezone(timedelta(hours=-8), "PST")
HALLS = {
    "Arrillaga": "Arrillaga Family Dining Commons",
    "Branner": "Branner Dining",
    "EVGR": "EVGR Dining",
    "FlorenceMoore": "Florence Moore Dining",
    "GerhardCasper": "Gerhard Casper Dining",
    "Lakeside": "Lakeside Dining",
    "Ricker": "Ricker Dining",
    "Stern": "Stern Dining",
    "Wilbur": "Wilbur Dining",
}
TAG_CLASSES = {"GF": "gluten-free", "V": "vegetarian", "VGN": "vegan", "HALAL": "halal", "KOSHER": "kosher"}
TIMEOUT, RETRIES, EMPTY_RETRIES, WORKERS = 20, 2, 3, 16
CA_FALLBACKS = ["/etc/ssl/certs/ca-certificates.crt", "/etc/pki/tls/certs/ca-bundle.crt", "/etc/ssl/cert.pem"]


def ssl_context():
    ctx = ssl.create_default_context()
    # Some Python builds (e.g. python.org macOS installers) ship without a CA bundle.
    if not ctx.cert_store_stats().get("x509_ca"):
        for path in CA_FALLBACKS:
            if os.path.exists(path):
                ctx.load_verify_locations(path)
                break
    return ctx


SSL_CTX = ssl_context()


def text(fragment):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", fragment))).strip()


def fetch_page(hall, day, meal):
    """GET the form, then post back the selection in a fresh cookie session."""
    opener = urllib.request.build_opener(
        urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()),
        urllib.request.HTTPSHandler(context=SSL_CTX),
    )
    opener.addheaders = [("User-Agent", "Mozilla/5.0 (stanford-dining-digest)")]
    page = opener.open(URL, timeout=TIMEOUT).read().decode("utf-8", "replace")
    form = {n: html.unescape(v) for n, v in re.findall(r'<input type="hidden" name="([^"]+)" id="[^"]*" value="([^"]*)"', page)}
    if "__VIEWSTATE" not in form:
        raise RuntimeError("form state not found on landing page")
    days = re.findall(r'<option[^>]*value="(\d+/\d+/\d{4})"', page)
    if day not in days:
        raise RuntimeError(f"date {day} not offered by site (available: {', '.join(days)})")
    form.update({
        "__EVENTTARGET": "GetMenulstMealType",
        "__EVENTARGUMENT": "",
        "ctl00$MainContent$lstLocations": hall,
        "ctl00$MainContent$lstDay": day,
        "ctl00$MainContent$lstMealType": meal,
    })
    body = urllib.parse.urlencode(form).encode()
    result = opener.open(URL, body, timeout=TIMEOUT).read().decode("utf-8", "replace")
    if "MainContent_lstLocations" not in result:
        raise RuntimeError("unexpected response (site error page)")
    return result


def parse_items(page):
    items = []
    for block in re.split(r"<li\b", page)[1:]:
        cls = re.match(r'[^>]*class="([^"]*)"', block)
        if not cls or "clsMenuItem" not in cls.group(1):
            continue
        block = block.split("</li>")[0]
        name = re.search(r'class="clsLabel_Name"[^>]*>(.*?)</h3>', block, re.S)
        if not name:
            continue
        tags = [TAG_CLASSES[c] for c in re.findall(r"cls([A-Z]+)_Row", cls.group(1)) if c in TAG_CLASSES]
        tags += [t.lower().replace(" ", "-") for t in re.findall(r'clsLabel_IconImage"[^>]*title="([^"]+)"', block)]
        if "vegan" in tags:
            tags.append("vegetarian")
        allergens = re.search(r'class="clsLabel_Allergens">.*?</span>(.*?)</span>', block, re.S)
        ingredients = re.search(r'class="clsLabel_Ingredients">.*?</span>(.*?)</span>', block, re.S)
        mindful = re.search(r'class="clsMindful">(.*?)</span>', block, re.S)
        items.append({
            "name": text(name.group(1)),
            "station": None,
            "tags": sorted(set(tags)),
            "allergens": [a.strip().lower() for a in text(allergens.group(1)).split(",") if a.strip()] if allergens else [],
            "ingredients": text(ingredients.group(1)) if ingredients else None,
            "description": text(mindful.group(1)) or None if mindful else None,
        })
    return items


def fetch_meal(hall, day, meal):
    last, empties, errors = None, 0, 0
    while empties <= EMPTY_RETRIES and errors <= RETRIES:
        try:
            items = parse_items(fetch_page(hall, day, meal))
            if items:
                return {"status": "ok", "items": items, "error": None}
            # The site often returns an empty menu for the first few seconds after a
            # hall/day/meal is first requested (cold server cache), so re-check with backoff.
            empties += 1
            if empties <= EMPTY_RETRIES:
                time.sleep(1 + empties)
        except Exception as exc:  # noqa: BLE001 - one hall must never break the run
            last, errors = exc, errors + 1
            if "not offered" in str(exc):
                break
            time.sleep(errors)
    if empties:
        return {"status": "closed", "items": [], "error": None}
    return {"status": "error", "items": [], "error": f"{type(last).__name__}: {last}"}


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--date", default=datetime.now(TZ).strftime("%Y-%m-%d"), help="YYYY-MM-DD (default: today, Pacific)")
    ap.add_argument("--meals", default="Lunch,Dinner", help="comma list of Breakfast,Lunch,Dinner,Brunch")
    ap.add_argument("--halls", default="all", help="'all' or comma list of hall keys/names, e.g. Arrillaga,Wilbur")
    ap.add_argument("--out", help="write JSON here instead of stdout")
    args = ap.parse_args()

    date = datetime.strptime(args.date, "%Y-%m-%d")
    day = f"{date.month}/{date.day}/{date.year}"
    meals = [m.strip().capitalize() for m in args.meals.split(",") if m.strip()]
    if args.halls.strip().lower() == "all":
        halls = list(HALLS)
    else:
        lookup = {k.lower(): k for k in HALLS} | {v.lower(): k for k, v in HALLS.items()}
        halls = []
        for h in args.halls.split(","):
            key = lookup.get(h.strip().lower()) or lookup.get(h.strip().lower() + " dining")
            if not key:
                sys.exit(f"unknown hall: {h!r}; choose from {', '.join(HALLS)}")
            halls.append(key)

    want_brunch = date.weekday() >= 5 and "Lunch" in meals and "Brunch" not in meals
    jobs = [(h, m) for m in meals for h in halls] + ([(h, "Brunch") for h in halls] if want_brunch else [])
    with ThreadPoolExecutor(max_workers=WORKERS) as pool:
        futures = {job: pool.submit(fetch_meal, job[0], day, job[1]) for job in jobs}
        results = {job: f.result() for job, f in futures.items()}

    out = {}
    for meal in meals:
        out[meal] = {HALLS[h]: results[(h, meal)] for h in halls}
    if want_brunch:
        brunch = {HALLS[h]: results[(h, "Brunch")] for h in halls
                  if results[(h, "Lunch")]["status"] != "ok" and results[(h, "Brunch")]["status"] == "ok"}
        if brunch:
            out["Brunch"] = brunch

    doc = {"date": args.date, "source": URL, "fetched_at": datetime.now(TZ).isoformat(timespec="seconds"), "meals": out}
    data = json.dumps(doc, indent=2, ensure_ascii=False)
    if args.out:
        with open(args.out, "w", encoding="utf-8") as fh:
            fh.write(data + "\n")
    else:
        print(data)


if __name__ == "__main__":
    main()
