# ADR-006 — Outcome Ledger and Development Dynamics

## Status
Accepted for v0.26 Phase 1 implementation. Broader scientific propositions remain revisable until explicitly frozen.

## Context
Strategos already records choices, execution and reflection, but these records are distributed across subsystems. Adaptive learning requires one trustworthy ledger linking a person-reported result to the exact context in which a judgement was made.

## Decision
Introduce `outcomeLedger` as a first-class state collection. Every completed reflection creates one ledger entry containing:

- judgement, execution and reflection identifiers;
- person-reported direction: Helped, Helped partly, Did not help or Unknown;
- optional person-authored note;
- immutable copies of available Human Model, explanation, Practice, context and choice snapshots;
- zero automatic influence on the Human Model or future judgements.

Duplicate records are prevented by outcome or structured-reflection identity. The ledger is visible in Journey and Understanding.

## Why this precedes prediction
Prediction, personal evidence and model revision cannot be trustworthy without stable outcomes. Therefore no Prediction Engine or automated belief revision is introduced in this phase.

## Consequences

Positive:
- establishes a durable substrate for longitudinal learning;
- preserves epistemic separation between outcome and causal explanation;
- allows later learning to be audited against frozen context.

Costs:
- duplicated snapshot data increases local storage use;
- legacy outcomes are not silently reconstructed;
- aggregation remains descriptive until a later review layer exists.

## Non-decisions
This ADR does not approve autonomous Human Model updates, character scoring, hidden-variable inference or counterfactual claims.
