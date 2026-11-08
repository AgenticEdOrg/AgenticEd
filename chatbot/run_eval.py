"""Run the AgenticEd chatbot on the evaluation questions and save the evidence.

    python run_eval.py

Answerable questions pass if the bot answers (with sources) and the answer contains an
expected word. Missing-information questions pass only if the bot says it couldn't find it.
Results are printed and saved to eval/results.md (attach it to your PR as console output).
"""
import datetime
import json
import pathlib
import sys
import time

from rag import AgenticEdRAG, NOT_FOUND

EVAL_DIR = pathlib.Path(__file__).resolve().parent / "eval"


def check(q: dict, r: dict) -> tuple[bool, str]:
    if not q["answerable"]:
        ok = not r["found"] and r["answer"] == NOT_FOUND and not r["sources"]
        return ok, "refused as expected" if ok else "answered a question it should refuse"
    if not r["found"]:
        return False, "refused a question the site answers"
    answer = r["answer"].lower()
    if not any(word in answer for word in q["expect_any"]):
        return False, f"answer missing expected words {q['expect_any']}"
    note = "answered with sources"
    if q.get("expect_source") and not any(q["expect_source"] in s["url"] for s in r["sources"]):
        note += f" (note: expected a source containing '{q['expect_source']}')"
    return True, note


def main():
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, "reconfigure"):
            stream.reconfigure(encoding="utf-8")
    questions = [json.loads(l) for l in open(EVAL_DIR / "questions.jsonl", encoding="utf-8") if l.strip()]
    rag = AgenticEdRAG()
    model = str(rag.llm or "none (retrieval-only)")
    lines = [f"# AgenticEd chatbot evaluation", "",
             f"- Run: {datetime.datetime.now():%Y-%m-%d %H:%M}", f"- LLM: `{model}`",
             f"- Knowledge chunks: {len(rag.chunks)}", ""]
    passed = 0
    for q in questions:
        try:
            r = rag.ask(q["question"])
            ok, note = check(q, r)
        except Exception as e:                       # e.g. the model is down: record it, keep going
            r = {"answer": f"ERROR: {e}", "sources": [], "mode": "error", "best_similarity": "-"}
            ok, note = False, "the LLM call failed"
        passed += ok
        kind = "answerable" if q["answerable"] else "missing info"
        print(f"\n[{'PASS' if ok else 'FAIL'}] {q['id']} ({kind}): {q['question']}")
        print(f"  A: {r['answer']}")
        for s in r["sources"]:
            print(f"     [{s['n']}] {s['title']} › {s['section']} -> {s['url']}")
        print(f"  {note} | mode={r['mode']} similarity={r['best_similarity']}")

        lines += [f"## {'✅' if ok else '❌'} {q['id']} ({kind}): {q['question']}", "",
                  "**Answer:** " + r["answer"].replace("\n", " "), ""]
        lines += [f"- [{s['n']}] {s['title']} › {s['section']} (`{s['url']}`)" for s in r["sources"]]
        lines += ["", f"_{note}; mode `{r['mode']}`, best similarity {r['best_similarity']}_", ""]
        time.sleep(1)  # be gentle with free-tier rate limits

    summary = f"{passed}/{len(questions)} passed"
    lines.insert(5, f"- Result: **{summary}**")
    (EVAL_DIR / "results.md").write_text("\n".join(lines), encoding="utf-8")
    print(f"\n{summary}. Saved eval/results.md")
    sys.exit(0 if passed == len(questions) else 1)


if __name__ == "__main__":
    main()