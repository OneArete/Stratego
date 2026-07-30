# ADR-026 — User-Lens Retention Improvements

**Status:** Accepted
**Version:** 0.60.0
**Date:** 2026-07-30

## Context

Pedro asked a direct follow-up to the honest product assessment in ADR-025: adopting the mindset of a real daily user, what specifically would make someone want to keep using Strategos, and to implement it. Four concrete, ranked improvements came out of that reflection, in the order Pedro asked them to be built:

1. The organism as the emotional payoff of closing the day, not a data-entry confirmation.
2. A proactive insight — Strategos telling the person something specific it noticed, without them having to look for it.
3. Less friction in the daily check-in.
4. A visible signal of continuity (streak), since the trend chart added in ADR-025 is passive and requires visiting Journey.

A fifth item — proactive notifications — was flagged as a structural limitation rather than implemented; see Consequences.

## Decision

### 1. Organism as emotional hook (day-close reveal)

The "Today is closed." moment previously discarded almost everything it already knew: `buildLivingCompanion()` computed a `reasons` array for every mode, but the render in `livingCompanionToday()` only ever displayed `model.judgement` and the action button — the closed-day reasons were never shown. Investigation also found `renderLivingGraph()` computes a `dominant` node (the domain with the strongest current emphasis) but only names it in the `graph-note` caption, which is suppressed whenever `ambient:true` — exactly the mode used on Today. The result: the richest moment in the product (a full day's signals resolved into one organism) rendered as a silent, unlabeled shape.

New function `describeGraphHighlight(graph)` in `human-graph.js` picks the domain with the highest combined energy/momentum score and names its trend (growing / holding steady / easing) — the same computation already driving the SVG, turned into one sentence. `buildLivingCompanion()`'s `complete` branch now composes real closing content from two existing-but-previously-unused sources: the practice actually completed that day plus its reflection (`It went better than expected.` / `as expected.` / `did not go as hoped.`), and the graph highlight. `model.judgement` remains the unchanged `'Today is closed.'` (the pinned regression test for this exact string, action, and continuity value continues to pass), and no action button is added — the constitutional constraint from ADR-011 ("a closed day has no call to action") is untouched.

A new `.settling` CSS animation plays once when the day-close moment renders, easing the organism from a dimmer, smaller state into its existing resting opacity/scale (`.78` / `.96`, unchanged) rather than appearing already-settled. `prefers-reduced-motion` disables it.

### 2. Proactive insight surfacing

Both the Belief System (ADR-022) and Advisor Memory (ADR-024) already compute a specific, truthful statement about why a judgement shaped itself the way it did — `judgement.agora.beliefAdjustments` and `advisor.memory.applied` — but both were only ever rendered inside "How this judgement was formed," a collapsed panel on the judgement screen a person has to choose to open. New module `proactive-insight.js` (`describeProactiveInsight(judgement)`) picks the single most relevant existing statement for the winning practice — preferring a confirmed belief statement, falling back to a confirmed-or-candidate advisor memory adjustment — and surfaces it directly on Today, beneath the judgement headline, whenever one genuinely exists. This adds no new claim: it is a different rendering of data these two systems already produced. When neither exists yet (most judgements, especially early in the product's life), nothing is shown — no insight is invented to fill the space.

### 3. Check-in friction reduction

The daily check-in was already one-question-at-a-time (v0.44.0), which is low friction per question but still six required taps every day regardless of whether anything changed since the last recorded day. `mostRecentCompleteCheckIn()` (`daily-signals.js`) finds the most recent other day with a complete signal set. When check-in opens on its first question and such a day exists, a single visible button — "Same as yesterday" (or "Same as `<date>`" if there is a gap) — appears alongside the first question. Choosing it copies that day's actual answers into today's context in one tap and completes the check-in immediately via the same completion path as answering all six questions manually (`upsertDailyCheckIn`, daily story update, Human Model update). This is an explicit, visible, one-tap person choice, not silent inference — consistent with the "nothing is inferred from silence" constraint — and is recorded with its own `source:'repeated-previous'` so it remains distinguishable from an active check-in if ever audited.

### 4. Visible streak

New module `streak.js`: `computeCheckInStreak(checkIns, now)` counts the unbroken run of recorded check-in days ending at today (or yesterday, if today has not been checked in yet), and `describeStreak()` renders it as `"N-day streak"` — but only at 2 or more days. A 1-day streak is just today; showing it as a streak would manufacture momentum that is not actually there yet, which conflicts with this product's established pattern of not inventing urgency (the same principle behind the "Today is closed." test explicitly named "without inventing urgency"). The badge renders as a small absolutely-positioned overlay inside `.organism-field`, present across every Today mode, so continuity is visible without needing to visit Journey — deliberately placed as a child of `organism-field`, not a new direct child of `.current-moment`, since that grid has exactly two explicitly-templated rows and a third top-level child would have landed in an unstyled implicit row.

## Testing

995 tests pass, 0 failures (963 prior + 32 new across `human-graph.test.js`, `living-companion.test.js`, `proactive-insight.test.js` (new file), `daily-signals.test.js`, `checkin-repeat-previous.test.js` (new file), `streak.test.js` (new file), and `current-moment-ui.test.js`). Each new behavior was verified two ways where the underlying computation was non-obvious: a direct unit test of the pure function, and a probe script run against the actual scoring/graph functions to confirm example values before pinning them in an assertion (e.g. which domain a given context makes dominant, so the reachability test wasn't guessing).

## Consequences

- Today's "one sentence, one action" constitutional design (ADR-011) is preserved in structure — the reveal paragraph and streak badge are additive, honest content, not new actions, why-panels, or greetings, and the existing regression tests guarding those absences still pass unmodified.
- Proactive insight surfacing depends entirely on the Belief System and Advisor Memory actually having accumulated confirmed or candidate adjustments. For a new user with no history, nothing will show for a while — this is correct behavior (nothing false is shown), but means the improvement's visible benefit compounds only after real usage, not immediately.
- Notifications were deliberately not implemented this release. A PWA has materially limited push notification support on iOS Safari, and no proactive reminder was built without first confirming what's actually deliverable within that constraint — building an unreliable reminder would be worse than no reminder, since it teaches the person not to trust it. This remains the single largest structural gap standing between Strategos and habitual daily use, and resolving it requires a product decision (accept the PWA limitation, or move toward native packaging) rather than an engineering one made silently.
- The check-in repeat action and the streak both reward showing up, not depth of engagement (a repeated day contributes to the streak the same as a fully fresh one). This is an intentional trade-off in favor of lower friction; if it turns out to encourage checking in without genuinely reflecting on the day, that would be a reason to reconsider it, and is worth watching for once real usage exists.
