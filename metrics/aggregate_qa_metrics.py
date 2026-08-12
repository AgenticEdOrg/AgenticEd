"""Aggregate genuine Playwright QA events into public and historical metrics."""
from __future__ import annotations

import json
import statistics
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
RAW_PATH = ROOT / "metrics" / "raw" / "latest-run.json"
HISTORY_PATH = ROOT / "metrics" / "qa_history.json"
METRICS_PATH = ROOT / "metrics" / "qa_metrics.json"


def load(path: Path, fallback):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (FileNotFoundError, json.JSONDecodeError):
        return fallback


def annotations(run: dict):
    for test in run.get("tests", []):
        for annotation in test.get("annotations", []):
            annotation_type = annotation.get("type", "")
            if annotation_type.startswith("qa:"):
                yield annotation_type[3:], annotation.get("description", "1"), test


def summarize_run(run: dict) -> dict:
    counts: defaultdict[str, int] = defaultdict(int)
    lessons = {str(week): {"attempts": 0, "successful": 0} for week in range(1, 7)}
    page_loads: list[int] = []
    lesson_loads: list[int] = []
    components = {"available": 0, "expected": 0}
    for kind, description, _test in annotations(run):
        if kind in {"lesson_attempt", "lesson_validated"}:
            if description in lessons:
                key = "attempts" if kind == "lesson_attempt" else "successful"
                lessons[description][key] += 1
        elif kind in {"page_load_ms", "lesson_load_ms"}:
            try:
                value = int(json.loads(description)["ms"])
                (page_loads if kind == "page_load_ms" else lesson_loads).append(value)
            except (ValueError, TypeError, KeyError, json.JSONDecodeError):
                pass
        elif kind == "curriculum_components":
            try:
                value = json.loads(description)
                components["available"] += int(value["available"])
                components["expected"] += int(value["expected"])
            except (ValueError, TypeError, KeyError, json.JSONDecodeError):
                pass
        elif kind in {"links_checked", "broken_core_links"}:
            try:
                counts[kind] += int(description)
            except (ValueError, TypeError):
                counts[kind] += 1
        else:
            counts[kind] += 1
    profiles = sorted({test.get("project", "unknown") for test in run.get("tests", []) if test.get("status") != "skipped"})
    return {
        "run_id": run.get("run_id"),
        "updated_at": run.get("updated_at"),
        "region": run.get("region", "unspecified"),
        "browser_profiles": profiles,
        "counts": dict(counts),
        "lessons": lessons,
        "page_load_ms": page_loads,
        "lesson_load_ms": lesson_loads,
        "curriculum_components": components,
    }


def percent(numerator: int, denominator: int) -> float:
    return round(numerator / denominator * 100, 1) if denominator else 0.0


def main() -> None:
    run = load(RAW_PATH, None)
    if not run:
        raise SystemExit(f"No Playwright metrics found at {RAW_PATH}")
    current = summarize_run(run)
    history = load(HISTORY_PATH, [])
    history = [item for item in history if item.get("run_id") != current["run_id"]]
    history.append(current)
    history.sort(key=lambda item: item.get("updated_at") or "")

    totals: defaultdict[str, int] = defaultdict(int)
    lesson_totals = {str(week): {"attempts": 0, "successful": 0} for week in range(1, 7)}
    all_page_loads: list[int] = []
    all_lesson_loads: list[int] = []
    regions: set[str] = set()
    profiles: set[str] = set()
    for item in history:
        for key, value in item.get("counts", {}).items():
            totals[key] += int(value)
        for week, values in item.get("lessons", {}).items():
            lesson_totals[week]["attempts"] += int(values.get("attempts", 0))
            lesson_totals[week]["successful"] += int(values.get("successful", 0))
        all_page_loads.extend(item.get("page_load_ms", []))
        all_lesson_loads.extend(item.get("lesson_load_ms", []))
        profiles.update(item.get("browser_profiles", []))
        region = item.get("region")
        if region and region not in {"unspecified", "local"}:
            regions.add(region)

    latest_counts = current.get("counts", {})
    latest_components = current.get("curriculum_components", {})
    metrics = {
        "schema_version": 1,
        "updated_at": current.get("updated_at") or datetime.now(timezone.utc).isoformat(),
        "journeys": {
            "total_runs": totals["journey_attempt"],
            "successful_runs": totals["journey_success"],
            "success_rate": percent(totals["journey_success"], totals["journey_attempt"]),
        },
        "curriculum": {
            "lesson_flows_validated": sum(v["successful"] for v in lesson_totals.values()),
            "activity_flows_validated": totals["activity_validated"],
            "assessment_flows_validated": totals["assessment_validated"],
            "portfolio_flows_validated": totals["portfolio_validated"],
            "certificate_flows_validated": totals["certificate_validated"],
            "core_components_available_percent": percent(latest_components.get("available", 0), latest_components.get("expected", 0)),
        },
        "coverage": {
            "geographic_regions": len(regions),
            "region_names": sorted(regions),
            "browser_profiles": len(profiles),
            "browser_profile_names": sorted(profiles),
            "viewport_profiles": len(profiles),
        },
        "reliability": {
            "certificate_success_rate": percent(totals["certificate_validated"], totals["certificate_attempt"]),
            "broken_core_links": int(latest_counts.get("broken_core_links", 0)),
            "learning_links_healthy_percent": percent(
                int(latest_counts.get("links_checked", 0)) - int(latest_counts.get("broken_core_links", 0)),
                int(latest_counts.get("links_checked", 0)),
            ),
            "lessons": {
                f"week_{week}": {
                    "attempts": values["attempts"],
                    "successful": values["successful"],
                    "success_rate": percent(values["successful"], values["attempts"]),
                }
                for week, values in lesson_totals.items()
            },
        },
        "performance": {
            "median_lesson_load_seconds": round(statistics.median(all_lesson_loads) / 1000, 2) if all_lesson_loads else 0,
            "pages_under_3_seconds_percent": percent(sum(ms < 3000 for ms in all_page_loads), len(all_page_loads)),
            "page_samples": len(all_page_loads),
        },
        "accessibility": {"pages_scanned": 0, "critical_violations": 0, "status": "not_configured"},
    }
    HISTORY_PATH.write_text(json.dumps(history, indent=2) + "\n", encoding="utf-8")
    METRICS_PATH.write_text(json.dumps(metrics, indent=2) + "\n", encoding="utf-8")
    print(f"Aggregated {len(history)} QA run(s) into {METRICS_PATH}")


if __name__ == "__main__":
    main()
