#!/usr/bin/env python3
"""
Grade 1 Kangaroo-style questions generator (original content).
Generates N simple arithmetic questions suitable for Grade 1 level
and writes them as JSON to the specified output file.
"""

import json
import random
import argparse
from pathlib import Path


def generate_question(i, rng):
    a = rng.randint(0, 9)
    b = rng.randint(0, 9)
    op = rng.choice(["+", "-"])
    if op == "+":
        text = f"What is {a} + {b}?"
        correct = a + b
    else:
        text = f"What is {a} - {b}?"
        correct = a - b
    options = {str(correct)}
    while len(options) < 4:
        options.add(str(rng.randint(0, 18)))
    opts = list(options)
    rng.shuffle(opts)
    try:
        idx = opts.index(str(correct))
    except ValueError:
        idx = 0
        opts[0] = str(correct)
    return {
        "id": f"G1Q{i:04d}",
        "text": text,
        "choices": [f"{o}" for o in opts],
        "answer": idx,
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--count", type=int, default=1000, help="Number of questions to generate"
    )
    parser.add_argument(
        "--output", default="data/kg1_questions.json", help="Output JSON file path"
    )
    parser.add_argument(
        "--seed", type=int, default=42, help="Random seed for reproducibility"
    )
    args = parser.parse_args()

    rng = random.Random(args.seed)
    questions = []
    seen = set()
    for i in range(args.count):
        while True:
            q = generate_question(i, rng)
            key = (q["text"], tuple(q["choices"]))
            if key not in seen:
                seen.add(key)
                break
        questions.append(q)

    out_path = Path(args.output)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump({"questions": questions}, f, indent=2, ensure_ascii=False)
    print(f"Wrote {len(questions)} questions to {out_path}")


if __name__ == "__main__":
    main()
