#!/usr/bin/env python3
"""Replace existing questions with generated KG1 questions.

This script looks for existing question data files in common locations
and replaces them with the KG1 dataset located at data/kg1_questions.json.
Old versions are backed up under data/backup with a timestamp.
"""

import json
import shutil
import time
from pathlib import Path

NEW_DATA = Path("data/kg1_questions.json")
BACKUP_DIR = Path("data/backup")
POSSIBLE_OLD = [
    Path("data/questions.json"),
    Path("data/kg1_questions.json"),
    Path("data/kg1_questions_all.json"),
    Path("data/kg1.json"),
]


def find_existing_old():
    for p in POSSIBLE_OLD:
        if p.exists():
            return p
    return None


def make_backup(src: Path) -> Path:
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    ts = time.strftime("%Y%m%d-%H%M%S")
    dest = BACKUP_DIR / f"{src.name}.{ts}.bak.json"
    shutil.copy2(src, dest)
    return dest


def main():
    if not NEW_DATA.exists():
        print(f"No new data found at {NEW_DATA}, aborting.")
        return 1

    existing = find_existing_old()
    if existing is None:
        # No existing file detected, write to a sensible default location
        existing = Path("data/questions.json")
        existing.parent.mkdir(parents=True, exist_ok=True)

    # If there is an existing file, back it up before replacing
    if existing.exists() and existing != NEW_DATA:
        backup = make_backup(existing)
        print(f"Backed up {existing} -> {backup}")

    # Copy new data to the target location if different location
    if existing.resolve() != NEW_DATA.resolve():
        shutil.copy2(NEW_DATA, existing)
        print(f"Replaced questions at {existing} with KG1 dataset from {NEW_DATA}")
    else:
        print(f"KG1 dataset already at {existing}; no copy needed.")

    # Also ensure a canonical copy exists at data/questions.json for downstream code
    CANON = Path("data/questions.json")
    if CANON.resolve() != NEW_DATA.resolve():
        if CANON.exists():
            backup_can = make_backup(CANON)
            print(f"Backed up canonical {CANON} -> {backup_can}")
        shutil.copy2(NEW_DATA, CANON)
        print(f"Canonical copy updated at {CANON}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
