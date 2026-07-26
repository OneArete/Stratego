# ADR-022 — Close the Belief System Learning Loop (Phase 2)

**Status:** Accepted  
**Version:** 0.56.0  
**Date:** 2026-07-26

## Context

The product mandate shifted from interface polish to substance: Strategos must actually get better at recommending practices to a specific person over time, not just present a well-designed static recommender. An audit of the codebase found the scaffolding for this already built and unusually disciplined — Outcome Ledger, Belief System, Human Model and Advisor Memory all collect, structure and (where relevant) require explicit person confirmation of evidence — but three of the four (Outcome Ledger, Belief System, Human Model) were frozen at literal zero automatic influence by their own governance documents. `BELIEF_SYSTEM_GOVERNANCE.md` stated the principle directly: "The system first earns the right to describe a pattern. It does not yet earn the right to act on it." `OUTCOME_LEDGER_GOVERNANCE.md` anticipated this moment explicitly: "A later release may propose reviewed learning. It must preserve the original ledger entry and create a separate, auditable learning object."

Advisor Memory (`advisor-memory.js`) was the exception — it already adjusted advisor scoring weights from reflection outcomes, silently, with no disclosure to the person. That silent mechanism was left untouched in this release; closing it is a separate, smaller piece of follow-up work (noted below).

This release closes the loop for the Belief System specifically, because it is the substrate best suited to a safe first step: beliefs require three directional outcomes to even become a candidate, require explicit person confirmation before existing beyond `proposed` status, and are scoped to a single, narrow claim ("this Practice helped me") rather than a broad personality or health inference.

## Decision

A confirmed belief (`status === 'confirmed'`, `type === 'practice-helpfulness'`) may now shift its Practice's ranking score by up to ±12% (`CONFIRMED_BELIEF_MAX_ADJUSTMENT = 0.12` in `belief-system.js`), scaled by how far the belief's help rate sits from neutral (50%) and by the belief's own confidence. A belief the person has not confirmed — `proposed`, `rejected`, or `retired` — has zero influence, unconditionally.

### Where the adjustment happens

`applyConfirmedBeliefAdjustments(totals, beliefs)` in `belief-system.js` takes the Agora's per-practice score totals and a belief list, and returns adjusted totals plus a disclosure array of what was applied and why. `conveneAgora()` in `agora.js` calls this after advisor scoring and longitudinal adjustments, and before eligibility filtering (blocking). This ordering is the safety guarantee: eligibility is decided entirely by `assessPracticeEligibility()`, which never sees or is influenced by belief adjustments. A confirmed belief can move a practice up or down the ranking among eligible candidates; it cannot make a blocked practice eligible, and it cannot outweigh a safety-relevant advisor objection (those move totals in increments an order of magnitude larger — see the worked example in `belief-adjustment.test.js`, where significant soreness still blocks Strength regardless of a maximum-confidence confirmed belief in Strength's favour).

### Disclosure, not silence

This is the part treated as non-negotiable, given `EXPERIENCE_CONSTITUTION.md` principle 2 ("Strategos never pretends to know") and principle 12 ("trust takes years to build and one false claim to damage"). Every judgement whose ranking was touched by a confirmed belief carries `agora.beliefAdjustments`. Three surfaces show it:

1. The judgement's own "How this judgement was formed" disclosure gains a new section, "Learned from you", listing each practice adjusted, the percentage, and the belief statement behind it — only rendered when the array is non-empty.
2. Journey's deliberation archive gains "Learned adjustment at judgement" for any past judgement whose record carries a non-empty `beliefAdjustments` array, preserving the audit trail even if the belief is later reopened or rejected.
3. Understanding's Belief System section copy was rewritten from a blanket, now-inaccurate "Automatic Human Model, judgement and Practice-selection influence: 0" to a precise statement of the actual boundary: Human Model influence remains 0; a confirmed belief may adjust its Practice's ranking by up to ±12%, visible in that judgement's record; a proposed or rejected belief has no influence.

### `belief-system.js` object fields corrected

`buildBeliefProposals()` previously hardcoded `automaticJudgementInfluence: 0` and `automaticPracticeSelectionInfluence: 0` on every belief object regardless of status — which would have become a false claim on any confirmed belief the moment this release shipped. Both fields are now computed from `status`: 0 for `proposed`/`rejected`/`retired`, `CONFIRMED_BELIEF_MAX_ADJUSTMENT` for `confirmed`. `automaticHumanModelInfluence` remains hardcoded at 0 — this release does not touch the Human Model.

### Governance document updated in place

`docs/BELIEF_SYSTEM_GOVERNANCE.md` was rewritten to document Phase 2: the influence boundary, the adjustment formula, the disclosure guarantees, and reversibility (reopening or rejecting a confirmed belief returns its influence to zero for all future deliberations; past judgements keep their preserved record). `OUTCOME_LEDGER_GOVERNANCE.md` and `HUMAN_MODEL_GOVERNANCE.md` were left untouched — both remain accurate, since neither substrate's influence changed.

## Testing

`tests/belief-adjustment.test.js` (new, 10 tests) covers: a proposed belief has zero influence; a confirmed belief nudges its practice up or down within bound; a neutral (50%) help rate produces no adjustment; the adjustment scales with confidence and never exceeds the bound; a belief for a practice absent from the current candidate set is ignored; a confirmed belief cannot override a safety block; `conveneAgora` surfaces applied adjustments for disclosure; and two opposing maximum-confidence beliefs can flip a ranking when their combined swing exceeds the margin between the top two candidates (a positive-control test proving the mechanism actually functions, not just that it declines to break anything).

`tests/audit-stabilization.test.js` and `tests/belief-system-ui.test.js` were updated to match the new `conveneAgora()` call signature and the new, honest Understanding copy.

## Consequences

- Confirmed beliefs now measurably influence what Strategos recommends, for the first time in the product's history — bounded, disclosed, and reversible.
- The Outcome Ledger and Human Model remain exactly as conservative as before; only the Belief System, and only confirmed records within it, moved.
- Advisor Memory's existing silent influence on scoring (pre-dating this release) is now the only remaining undisclosed learning mechanism in the product. Recommended follow-up: extend the same disclosure pattern used here (a labelled section in the deliberation panel) to advisor-memory-driven adjustments, so no learning mechanism in Strategos remains invisible to the person it is learning about.
- 942 tests pass, 0 failures (930 prior + 10 new belief-adjustment tests + 2 pre-existing tests updated in place).
