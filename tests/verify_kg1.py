import json
from pathlib import Path


def main():
    data_path = Path("data/questions.json")
    with open(data_path, "r", encoding="utf-8") as f:
        payload = json.load(f)
    qs = payload.get("questions", [])
    print(f"Loaded {len(qs)} KG1 questions from {data_path}")
    # basic sanity check: ensure each has id, text, choices, answer
    ok = True
    for q in qs:
        if not all(k in q for k in ("id", "text", "choices", "answer")):
            ok = False
            break
    print("Sanity check:", "OK" if ok else "FAIL")


if __name__ == "__main__":
    main()
