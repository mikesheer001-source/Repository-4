#!/usr/bin/env python3
"""Update a public site's *basic* Artificial Analysis metrics when licensed.

No external dependencies. Only updates the optional updates.js overlay.
The existing 39-model snapshot and 10 component benchmarks are untouched.
"""
import datetime as dt
import json
import math
import os
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
API_URL = "https://artificialanalysis.ai/api/v2/language/models/free"
MAX_PAGES = 20


def normalized(name):
    """Allow harmless whitespace/punctuation variants, never fuzzy model matches."""
    return re.sub(r"[^a-z0-9]", "", name.casefold())


def valid_number(v, minimum, maximum):
    return (
        isinstance(v, (int, float)) and not isinstance(v, bool)
        and math.isfinite(v) and minimum <= v <= maximum
    )


def read_snapshot():
    raw = (ROOT / "data.js").read_text(encoding="utf-8")
    match = re.search(r"window\.AI_BENCHMARK_DATA\s*=\s*(\{.*\});\s*$", raw, re.S)
    if not match:
        raise ValueError("Missing or unparseable static snapshot. No changes made.")
    data = json.loads(match.group(1))
    if not data.get("models") or not isinstance(data["models"], list):
        raise ValueError("Missing model array in snapshot.")
    return data["models"]


def read_existing():
    path = ROOT / "updates.js"
    if not path.exists():
        return {"updated_at": None, "models": {}}
    raw = path.read_text(encoding="utf-8")
    match = re.search(r"window\.AI_DAILY_UPDATES\s*=\s*(\{.*\});\s*$", raw, re.S)
    if not match:
        raise ValueError("Existing updates.js is invalid; refusing to overwrite.")
    return json.loads(match.group(1))


def fetch_models(api_key):
    if not api_key:
        raise ValueError("AA_API_KEY is required.")
    models, version = [], None
    for page in range(1, MAX_PAGES + 1):
        request = urllib.request.Request(
            API_URL + "?page=" + str(page),
            headers={
                "x-api-key": api_key,
                "accept": "application/json",
                "User-Agent": "ModelScope-DailyUpdate/1.0",
            },
        )
        with urllib.request.urlopen(request, timeout=30) as response:
            body = json.load(response)
        if not isinstance(body, dict) or not isinstance(body.get("data"), list):
            raise ValueError("Unexpected API response; no update performed.")
        if body.get("intelligence_index_version") is not None:
            version = body["intelligence_index_version"]
        models.extend(body["data"])
        page_info = body.get("pagination") or {}
        if not page_info.get("has_more", False):
            return models, version
    raise ValueError("More than 20 API pages; refusing partial update.")


def build_overlay(snapshot, api_models):
    """Return only exact, unique normalized name matches, never guessed identities."""
    candidates = {}
    for entry in api_models:
        if isinstance(entry, dict) and isinstance(entry.get("name"), str):
            candidates.setdefault(normalized(entry["name"]), []).append(entry)
    result = {}
    for static in snapshot:
        name = static[0]
        matches = candidates.get(normalized(name), [])
        if len(matches) != 1:
            continue
        m = matches[0]
        evaluation = m.get("evaluations") or {}
        cost_obj = m.get("artificial_analysis_intelligence_index_cost") or {}
        raw_cost = (cost_obj.get("cost_per_task") or {}).get("total_cost")
        raw_index = evaluation.get("artificial_analysis_intelligence_index")
        update = {}
        if valid_number(raw_index, -100, 200):
            update["index"] = round(raw_index, 3)
        if valid_number(raw_cost, 0.000001, 1000):
            update["cost"] = round(raw_cost, 6)
        if update:
            result[name] = update
    if not result:
        raise ValueError("No uniquely matched valid models. Keeping previous data.")
    return result


def run(api_key):
    snapshot = read_snapshot()
    previous = read_existing()
    api_models, version = fetch_models(api_key)
    overlay = build_overlay(snapshot, api_models)
    if overlay == previous.get("models", {}) and version == previous.get("index_version"):
        print("Values unchanged; no commit needed.")
        return False
    result = {
        "updated_at": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z"),
        "source": "Artificial Analysis V2 Free API",
        "index_version": version,
        "models": overlay,
    }
    dest = ROOT / "updates.js"
    content = (
        "/* API-derived public data: publish only with confirmed redistribution rights. */\n"
        "window.AI_DAILY_UPDATES = " + json.dumps(result, ensure_ascii=False, separators=(",", ":")) + ";\n"
    )
    dest.write_text(content, encoding="utf-8")
    print("Prepared update for", len(overlay), "of", len(snapshot), "snapshot models.")
    return True


def tests():
    samples = [["GPT-6.1 Sol high", "GPT-6.1 Sol", 0.32, 50]]
    assert normalized("GPT-6.1 Sol (high)") == normalized(samples[0][0])
    fake = [{
        "name": "GPT-6.1 Sol (high)",
        "evaluations": {"artificial_analysis_intelligence_index": 51.2},
        "artificial_analysis_intelligence_index_cost": {
            "cost_per_task": {"total_cost": 0.335}
        },
    }]
    assert build_overlay(samples, fake) == {"GPT-6.1 Sol high": {"index": 51.2, "cost": 0.335}}
    try:
        build_overlay(samples, fake + fake)
    except ValueError:
        pass
    else:
        raise AssertionError("Ambiguous names must be rejected.")
    print("Updater self-tests passed.")


if __name__ == "__main__":
    if "--self-test" in sys.argv:
        tests()
    else:
        try:
            run(os.environ.get("AA_API_KEY", "").strip())
        except (ValueError, OSError, urllib.error.URLError, json.JSONDecodeError) as exc:
            print("Update aborted safely:", exc, file=sys.stderr)
            sys.exit(1)
