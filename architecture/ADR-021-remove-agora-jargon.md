# ADR-021 — Remove Leftover "Agora" Jargon from User-Visible Text

**Status:** Accepted  
**Version:** 0.55.0  
**Date:** 2026-07-26

## Context

A full audit of `app.js` for internal-architecture language surfaced four remaining user-visible occurrences of "Agora" — the internal name for the council-of-advisors deliberation engine (`conveneAgora()` in `core/agora.js`). This term is never explained to the user anywhere in the product and contradicts a principle already established and tested in this codebase: ADR-011 and ADR-018 both treat internal architecture names as implementation detail, and existing tests (`experience-rewrite.test.js`, `judgement-focus.test.js`) already assert that terms like "THE AGORA" and "advisor-lights" must not appear on the deliberation ("Deliberating.") screen.

The four leftover surfaces were:

1. The in-app guide's flow diagram (`guide()`, section `today`): `Today → Agora → Judgement → Practice → Reflection`.
2. A section label inside Understanding's "Open full reasoning" disclosure: `<p class="eyebrow">AGORA</p>` above the list of advisor names, positions, and reasons.
3. An empty-state sentence in Understanding: "The next Agora judgement will preserve a canonical explanation record."
4. An empty-state sentence in Understanding: "A snapshot will be preserved when the next Agora deliberation begins."

None of these are pinned by any test, so the fix carried no risk to the existing suite.

## Decisions

### Guide flow diagram: "Agora" → "Deliberation"

The guide is the one screen explicitly designed to explain the product to a person without requiring them to understand the system behind it (its own heading: "Use Strategos without having to understand the system behind it"). Naming an unexplained internal component in that exact screen defeated its purpose. "Deliberation" matches the language already used on the `thinking()` screen ("Deliberating.") and requires no new vocabulary.

### Understanding section label: "AGORA" → "ADVISORS"

The section lists advisor names, their positions, and their reasons — "ADVISORS" describes the content directly rather than naming the engine that produced it.

### Empty-state sentences: "Agora" dropped

"The next Agora judgement..." and "...next Agora deliberation..." became "The next judgement..." and "...next deliberation..." — removing the internal name without losing any information the sentence conveyed.

### Minor cleanup: redundant ternary in `eveningReflection()`

`${selected?'Save and close the day':'Save and close the day'}` evaluated to the same string on both branches — dead conditional logic left over from an earlier version where the label likely differed by state. Simplified to the literal string. No behavioral change; not covered by any test.

## Consequences

- No user-visible surface in the shipped product names the internal deliberation engine. A person reading the guide, or opening "Open full reasoning" in Understanding, sees only language that is already explained elsewhere in the product (Advisors, Judgement, Deliberation).
- 930 tests pass, 0 failures.
- This was a pure terminology and dead-code cleanup pass — no new screens, no markup structure changes, no CSS changes.
