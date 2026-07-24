# ADR-015 — Today Screen: Organism + One Sentence + One Action

**Status:** Accepted  
**Version:** 0.49.0  
**Date:** 2026-07-24

## Context

The Today screen previously rendered four distinct text elements:

1. `<p class="moment-greeting">` — a greeting ("Good morning, Pedro.")
2. `<h1>` — the judgement sentence ("Let's understand today.")
3. `<details class="moment-why">` — a collapsible "Why" panel with reasoning
4. `<p class="moment-continuity">` — a continuity notice when a practice was paused

Plus the action button.

This violated two product rules:

- **"Today contains ONLY: 1. Organism. 2. One sentence. 3. One action."**
- **"The organism communicates before text."**

The greeting duplicated or prefaced the judgement. The "Why" details, even collapsed, communicated that there was hidden reasoning — architecture made visible. The continuity text added a fourth element when a practice was in progress.

## Decision

Today now renders exactly:

```
organism (Living Graph, ambient)
<h1>{model.judgement}</h1>
<button class="moment-action">{model.actionLabel}</button>
```

Removed:
- `<p class="moment-greeting">` — the `h1` judgement IS the sentence
- `<details class="moment-why">` — reasoning is available inside the Judgement screen, not Today
- `<p class="moment-continuity">` — continuity is surfaced through the action, not through parallel text

The `buildLivingCompanion` model is unchanged — it still computes `greeting`, `reasons`, `continuity`. They are simply not rendered on Today. They remain available for future use in other contexts (e.g., the Judgement screen).

## Consequences

- Today is structurally clean: organism + sentence + action, nothing else.
- The organism communicates the state first; the sentence confirms it; the action follows.
- `moment-greeting`, `moment-why`, `moment-continuity` CSS classes remain in `styles.css` but are no longer generated on Today.
- Tests updated: `current-moment-ui.test.js` now asserts absence of greeting/why/continuity, not presence.
