# Belief System Governance — v0.56.0 Phase 2

A Strategos belief is an explicit, reviewable proposition supported by repeated person-reported outcomes. It is not a diagnosis, personality label, causal claim or hidden inference.

## Admission

A candidate requires at least three directional outcomes for the same Practice. Unknown outcomes are excluded. The evidence statement, number of observations, contradictions, provenance and confidence remain visible.

## Human authority

Candidates begin as `proposed`. Only the person may confirm or reject them. A previous decision may be reopened. No belief changes silently, and no belief influences anything before the person confirms it.

## Influence boundary — Phase 2

Phase 1 (v0.28.0–v0.55.0) held all automatic influence at zero while the system earned the right to describe a pattern. Phase 2 grants a bounded, disclosed right to act on a belief the person has explicitly confirmed:

- Human Model: 0 (unchanged — beliefs never write to the Human Model)
- Judgement: 0 while `status` is `proposed`, `rejected` or `retired`
- Practice selection: 0 while `status` is `proposed`, `rejected` or `retired`; up to ±`CONFIRMED_BELIEF_MAX_ADJUSTMENT` (0.12, i.e. ±12% of a practice's deliberation score) once `status` is `confirmed`
- Safety: 0, always, unconditionally

The adjustment is implemented in `applyConfirmedBeliefAdjustments()` (`src/core/belief-system.js`) and applied inside `conveneAgora()` (`src/core/agora.js`) after advisor scoring and longitudinal adjustments, and before eligibility filtering. This ordering is deliberate: eligibility (blocking) is decided entirely by `assessPracticeEligibility()` and is never touched by belief adjustments — a confirmed belief can shift which eligible practice wins, but can never make a blocked practice eligible.

## Adjustment mechanics

For each confirmed `practice-helpfulness` belief whose subject practice appears in the current candidate set:

```text
centered = helpRate - 0.5                 // -0.5 .. +0.5
magnitude = min(|centered| * 2, 1) * 0.12 * confidence
adjustment = magnitude, signed by centered
```

A belief with `helpRate` at 50% (no directional signal) produces no adjustment. A belief at 100% or 0% helpRate, at full confidence, produces the maximum ±0.12. This is a nudge among close candidates, not an override: advisor scores that express safety-relevant opposition (e.g. Body advisor scoring `-1.5` under significant soreness) move in increments an order of magnitude larger and cannot be reversed by any combination of confirmed beliefs.

## Disclosure

Every judgement whose ranking was adjusted by a confirmed belief carries `agora.beliefAdjustments` — an array of `{practiceId, practiceName, adjustment, statement, helpRate, confidence}`. This is:

- shown to the person in that judgement's "How this judgement was formed" panel, under "Learned from you";
- preserved on the judgement record and shown again in Journey as "Learned adjustment at judgement", so the adjustment that shaped a past recommendation remains auditable after the fact;
- never silent. If no confirmed belief applied, the array is empty and no panel is shown.

## Reversibility

Reopening or rejecting a confirmed belief (`reviewBelief(beliefs, id, {action:'reopen'|'reject'})`) immediately returns its influence to zero for all future deliberations. Past judgements retain their preserved `beliefAdjustments` record regardless of later review — the audit trail is not rewritten.

## What remains unchanged

The Outcome Ledger and Human Model remain at Phase 1 governance (zero automatic influence — see `OUTCOME_LEDGER_GOVERNANCE.md` and `HUMAN_MODEL_GOVERNANCE.md`). Only the Belief System, and only its `confirmed` records, and only Practice selection (never safety, never the Human Model), have moved to Phase 2.
