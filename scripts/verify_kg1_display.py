#!/usr/bin/env python3
"""Validate KG1-generated questions for display correctness and duplicates.

Checks:
- Each question has id, text, choices (list[str]), and answer (int).
- answer is a valid index into choices.
- No duplicate questions (by (text, choices)).
- Each set has unique ids and non-empty text/choices.
- Basic display sanity: text length reasonable, choices are printable numbers/strings.
- No repeated questions across the dataset.
"""

import json
from pathlib import Path


DATA_PATH = Path("data/kg1_questions.json")


def load():
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        payload = json.load(f)
    return payload.get("questions", [])


def main():
    qs = load()
    issues = []
    seen = set()
    ids = set()
    for idx, q in enumerate(qs):
        # Basic shape checks
        if not isinstance(q, dict):
            issues.append((idx, "Not a dict"))
            continue
        if any(k not in q for k in ("id", "text", "choices", "answer")):
            issues.append((idx, f"Missing required keys in {q}"))
            continue
        qid = q.get("id")
        text = q.get("text")
        choices = q.get("choices")
        answer = q.get("answer")
        if not isinstance(qid, str) or not qid:
            issues.append((idx, "Invalid id"))
        if not isinstance(text, str) or not text.strip():
            issues.append((idx, "Empty or invalid text"))
        if not isinstance(choices, list) or len(choices) < 2:
            issues.append((idx, "Invalid or too-short choices"))
        if not isinstance(answer, int) or answer < 0 or answer >= len(choices):
            issues.append((idx, "Answer index out of range"))
        # duplicates within the question's own choices
        if len(set(map(str, choices))) != len(choices):
            issues.append((idx, "Duplicate choices within question"))
        # global duplicates by (text, choices)
        key = (text, tuple(choices))
        if key in seen:
            issues.append((idx, "Duplicate question detected"))
        else:
            seen.add(key)
        # id uniqueness
        if qid in ids:
            issues.append((idx, f"Duplicate id seen: {qid}"))
        else:
            ids.add(qid)

        # basic display sanity: limit text length
        if len(text) > 500:
            issues.append((idx, "Text too long"))
        # sanity: choices textual content should be printable
        for c in choices:
            if not isinstance(c, str):
                issues.append((idx, "Non-string choice"))
                break

    print(f"KG1 display verification: {len(qs)} questions analyzed.")
    if not issues:
        print("All questions pass display validation.")
    else:
        print(f"Found {len(issues)} issues:")
        for i, msg in issues[:50]:
            print(f"  [#{i}] {msg}")
        if len(issues) > 50:
            print(f"  ... and {len(issues) - 50} more issues.")

    # Exit with non-zero code if issues found
    raise SystemExit(1 if issues else 0)


if __name__ == "__main__":
    main()
