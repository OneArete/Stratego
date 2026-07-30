# ADR-024 — Disclose Advisor Memory's Influence

**Status:** Accepted  
**Version:** 0.58.0  
**Date:** 2026-07-26

## Context

ADR-022 (closing the Belief System learning loop) flagged a follow-up: "Advisor Memory's existing silent influence on scoring... is now the only remaining undisclosed learning mechanism in the product." This release closes that gap.

Investigation of `advisor-memory.js` found the mechanism more capable than expected, and the gap narrower than "silent" implied — but real. Understanding already has an "Accountable Learning" section (`learning-review`) listing each advisor's learned observations with Confirm / Reject / Reopen controls, wired to `updateLearningStatus()`. The person can see and act on these. What was missing was any statement of what a learning's current, un-reviewed state already does.

`effectiveMemoryWeight()` applies non-zero influence for `candidate` status (45% of the learned weight, via the `CANDIDATE_INFLUENCE` constant) and full influence for `confirmed` status — both automatically, both before or entirely without any person action. Only `rejected` and `expired` reduce influence to zero. A person reading "Confirm this learning" next to a candidate item could reasonably infer that confirming is what makes it start to matter. That inference would be false, and nothing on screen corrected it.

This is a different governance shape from the Belief System (Phase 1: zero influence until explicit confirmation) and the Human Model (zero influence in the current phase, full stop). Advisor Memory was never designed to that stricter standard — it has operated on the "candidate learnings get reduced-but-nonzero weight automatically" model since it was built, and no governance document existed for it (every other learning substrate has one).

## Decision

Two additions, no behavioral change:

### 1. Understanding discloses the true influence boundary

The "Accountable Learning" section now opens with a direct statement, using the actual `CANDIDATE_INFLUENCE` constant rather than a hardcoded percentage (`up to ${Math.round(CANDIDATE_INFLUENCE*100)}%`, so the copy cannot silently drift out of sync with the code that decides real influence): a candidate learning already carries reduced weight on Practice scoring before review; confirming raises it to full weight; rejecting removes it entirely.

### 2. The judgement panel discloses per-judgement impact

`applyAdvisorMemory()` already attached an `applied` array to each advisor's opinion — `{practice, delta, observations, status}` for every practice where memory produced a measurable adjustment (`|delta| >= 0.01`). This data existed and was computed on every judgement; it was simply never rendered anywhere. A new "Learned from experience" section in the judgement's "How this judgement was formed" panel filters this to the winning practice and lists each contributing advisor, the adjustment, how many reflected experiences produced it, and whether it is still a candidate (reduced weight) or confirmed (full weight) — directly parallel to the existing "Learned from you" section for confirmed beliefs (ADR-022), so the two disclosed learning mechanisms read consistently.

### Governance document created

`docs/ADVISOR_MEMORY_GOVERNANCE.md` did not exist before this release — the only learning substrate without one. It now documents the lifecycle (candidate → confirmed/rejected/expired), the influence boundary as it has actually always worked, the bound (±0.28 per practice per advisor, 90-day half-life decay), and flags as a recommended follow-up (not resolved here) that Advisor Memory's automatic-confirmation-from-repeated-evidence model differs from the Belief System's always-explicit-confirmation model — a product decision about whether to unify them, not an engineering one.

## Testing

`tests/advisor-memory-disclosure.test.js` (new, 7 tests): confirms a candidate weight is measurably non-zero and smaller than a confirmed one (documents the actual behaviour being disclosed, as a positive control, not just "nothing broke"); confirms rejected has zero influence; confirms the Understanding disclosure text is present and derived from the real constant, not a hardcoded string that could drift; confirms `conveneAgora` surfaces the applied adjustment for the winning practice; confirms the judgement panel renders "Learned from experience" with the expected copy; and guards against a future regression that would reintroduce a false "influence: 0" claim near the Accountable Learning section (the mistake already made and fixed once, in the Belief System, per ADR-022 — this test exists so it cannot recur here unnoticed).

## Consequences

- Every learning mechanism in Strategos that currently affects a recommendation is now disclosed somewhere the person can see it: Belief System in "Learned from you" (ADR-022), Advisor Memory in "Learned from experience" (this release). The Human Model and raw Outcome Ledger remain at zero influence and require no disclosure of effect, since they have none.
- No scoring behavior changed. This release is disclosure-only.
- 949 tests pass, 0 failures (942 prior + 7 new).
