# ADR-017 — Understanding Clarity: 3-Tab Nav and Council-First Layout

**Status:** Accepted  
**Version:** 0.51.0  
**Date:** 2026-07-24

## Context

The Understanding tab was described by the product lead as "muito extenso e confuso" (very extensive and confusing). An audit of the rendered HTML confirmed two structural problems:

**1. Five tabs created false distinctions.** Patterns / Outcomes / Agency are all forms of personal evidence. A user cannot reasonably know which tab to open for a given question. The distinction is architectural, not experiential.

**2. The Overview tab was cluttered.** Six sections appeared by default:
- Explain Engine — developer-level reasoning transparency
- Your Review (of explain record) — functional but not a first-look item
- Reflection Outcomes — an emotional journal follow-up count, empty for new users
- Reflective Continuity — emotional theme aggregation, empty for new users
- Human Model (good, stays)
- Advisor Coverage (good, stays)

Additionally, the Monthly Council — the warmest and most human-readable section — was buried after all Audit sections, below 30+ hidden sections. A user opening Understanding had to scroll to the bottom to reach the only section written in plain prose.

## Decisions

### 5 tabs → 3 tabs

`Patterns + Outcomes + Agency` consolidated into a single **Evidence** tab.

- All sections with `data-understanding-group="patterns"`, `"outcomes"`, or `"agency"` now carry `"evidence"`.
- The nav renders: `Overview | Evidence | Audit`.
- The switcher handler is unchanged — it shows/hides by matching `data-understanding-group` to the selected view.

This removes a taxonomy the user was never taught. All personal evidence is now in one place.

### Monthly Council moved to top of Overview

The council now appears immediately after the summary stats row (patterns / hypotheses / open questions), before the Human Model section.

**Before:** Overview showed Human Model → Latest Deliberation → Nav → Explain Engine → Emotional stats → Coverage → (scroll ~30 sections) → Monthly Council

**After:** Overview shows Council → Human Model → Latest Deliberation → Nav → Coverage → Fact Candidates → Learning → Discoveries → Unknowns

The council is the only section that speaks in the user's language about the month. It belongs at the top.

### Explain Engine and Review → Audit

`canonical-explain-record` and `explain-review` moved from `overview` to `audit`. These sections serve transparency and accountability purposes but are not what a user needs on a typical visit. They were developer-facing content in a user-facing position.

### Emotional sections → Evidence

`emotional-follow-up-understanding` and `emotional-evolution-understanding` moved from `overview` to `evidence`. For users with few reflections, these sections show only empty-state placeholders. Moving them to Evidence means they appear alongside the other longitudinal data (outcomes, patterns), where they contextually belong.

## Consequences

- Overview now contains: Council, Human Model, Latest Deliberation, Nav, Advisor Coverage, Fact Candidates, Learning Review, Discoveries, Unknowns.
- Evidence contains all longitudinal personal data (formerly Patterns + Outcomes + Agency + emotional sections).
- Audit contains all technical transparency and governance sections (including Explain Engine and Review, moved here from Overview).
- `navigation-progressive-disclosure.test.js` updated: the five-views test is now a three-views test with assertions that the old view names are gone.
- 930 tests pass, 0 failures.
