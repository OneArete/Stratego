# Advisor Memory Governance — v0.58.0

Advisor Memory is the only learning substrate in Strategos that has always had a live, automatic effect on Practice scoring — since before this document existed. This gap (every other substrate — Outcome Ledger, Belief System, Human Model — has a governance document; Advisor Memory did not) is corrected here, alongside disclosing the existing behaviour to the person for the first time.

## What it is

Each of the six Advisors (Body, Recovery, Mind, Agency, Purpose, Relationships) maintains a per-practice, per-context memory of how their support for that practice has played out in reflected outcomes. A reflection ("better" / "right" / "worse") after a completed Practice updates the relevant Advisor's memory weight for that practice (`learnFromReflection()` in `advisor-memory.js`).

## Learning status lifecycle

A learned weight begins as `candidate`. It becomes:

- `confirmed` — automatically, once at least 3 reflections exist for the same practice and context, at least 2 agree in direction, consistency is at least two-thirds, and contradiction is limited (`evaluateLearningStatus()`); or explicitly, when the person confirms it in Understanding's "Accountable Learning" section.
- `rejected` — only by explicit person action, with an optional correction note. Immediately reduces influence to zero.
- `expired` — automatically, if a candidate is not reconfirmed by new evidence within 120 days of its last observation.

## Influence boundary — the behaviour being disclosed in v0.58.0

Unlike the Belief System (Phase 1: zero influence until confirmed) or the Human Model (zero influence, ever, in the current phase), Advisor Memory has never withheld influence pending person review:

- `candidate`: `CANDIDATE_INFLUENCE` = 45% of the learned weight already applies to Practice scoring, before the person has seen or reviewed it.
- `confirmed`: 100% of the learned weight applies.
- `rejected` / `expired`: 0% — no influence.

The learned weight itself is bounded to ±0.28 per practice per advisor (`effectiveMemoryWeight()`), further decayed by a 90-day half-life since the last observation, and scaled down when fewer than 3 observations exist. This bound is smaller in scope than a safety-relevant advisor objection (which can reach magnitudes an order of magnitude larger — see `ADR-022`) and cannot, by itself, override a blocked practice.

Prior to v0.58.0, this behaviour was real but never disclosed: Understanding's "Accountable Learning" section showed confirm/reject controls with no statement of what a candidate's un-reviewed status was already doing. A person reasonably reading "Confirm this learning" / "This is not right" could conclude nothing happens until they act. That was not true, and the omission is corrected in this release.

## Disclosure

- Understanding's "Accountable Learning" section now states the influence boundary directly: a candidate already carries reduced weight, confirming raises it to full weight, rejecting removes it.
- Every judgement whose winning practice was measurably shaped by advisor memory (`|delta| >= 0.01`, per `applyAdvisorMemory()`) shows a "Learned from experience" section in that judgement's deliberation panel, naming the advisor, the adjustment, the number of reflected experiences behind it, and whether it is still a candidate or has been confirmed.

## What remains unchanged

The bound (±0.28), the decay (90-day half-life), the confirmation thresholds, and the person's ability to confirm, reject or reopen a learning are unchanged by this release. Only the disclosure changed — the mechanism was already active.

## Recommended follow-up

Advisor Memory's automatic confirmation path (three consistent reflections promote a candidate to confirmed without the person ever clicking "confirm") is a meaningfully different governance model from the Belief System's, which requires explicit person action at every step. Whether these two learning substrates should converge on a single confirmation model is a product decision, not an engineering one, and is left open for a future review.
