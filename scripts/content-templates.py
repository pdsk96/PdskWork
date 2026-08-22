#!/usr/bin/env python3
"""
Reusable narrative templates for blog post generation.

Each template returns a markdown string with placeholders filled in.
Templates are designed to produce personal, practitioner-style content
rather than generic tech-Wikipedia entries.
"""
from __future__ import annotations


def _esc(text: str) -> str:
    return (text or "").replace("{", "{{").replace("}", "}}")


def trenches(title: str, problem: str, failed: str, fix_minutes: str, debug_minutes: str, lesson: str) -> str:
    return f"""## From the Trenches

When we built **{_esc(title)}**, we learned this the hard way.

**The problem:** {_esc(problem)}

**What didn't work:** {_esc(failed)}

**The fix:** {_esc(fix_minutes)}

**The debugging:** {_esc(debug_minutes)}

**Lesson:** {_esc(lesson)}"""


def pdsk_note(text: str) -> str:
    return f"""> **PdskWork note:** {_esc(text)}"""


def metrics(context: str, before: str, after: str, measurement: str) -> str:
    return f"""## By the Numbers

In {_esc(context)}, we measured:

- **Before:** {_esc(before)}
- **After:** {_esc(after)}
- **Metric:** {_esc(measurement)}"""


def honest_limits(title: str, limits: list[str], mitigation: str) -> str:
    bullets = "\n".join(f"- {_esc(item)}" for item in limits)
    return f"""## Honest Limits of {_esc(title)}

This is not a silver bullet. What breaks or falls short:

{bullets}

**How we mitigate:** {_esc(mitigation)}"""


def tutorial_narrative(problem: str, failed_attempts: list[str], solution: str, verification: str) -> str:
    bullets = "\n".join(f"- {_esc(item)}" for item in failed_attempts)
    return f"""## The Problem

{_esc(problem)}

## What Didn't Work

{bullets}

## The Solution

{_esc(solution)}

## Verification

{_esc(verification)}"""


def comparison_table(items: list[tuple[str, str, str]]) -> str:
    rows = []
    rows.append("| Option | Strength | Weakness |")
    rows.append("| --- | --- | --- |")
    for name, strength, weakness in items:
        rows.append(f"| {_esc(name)} | {_esc(strength)} | {_esc(weakness)} |")
    return "\n".join(rows)


def war_story(project: str, situation: str, decision: str, outcome: str) -> str:
    return f"""## War Story: {_esc(project)}

**Situation:** {_esc(situation)}

**Decision:** {_esc(decision)}

**Outcome:** {_esc(outcome)}"""
