# ADR-027 — Strategos Kernel

## Status
Accepted and frozen in v0.64.0.

## Decision
The canonical decision cycle is coordinated by `src/core/strategos-kernel.js`.

The Kernel owns three boundaries:

1. resolving the current experiential state from evidence, continuity and judgement;
2. authorising or blocking deliberation;
3. converting a deliberative candidate into an explicit Current Judgement entity.

UI components may render the Kernel projection and dispatch the single permitted action. They must not infer evidence sufficiency, manufacture a recommendation, or independently construct a Current Judgement.

## Current Judgement contract
Every new judgement must include:

- one orientation;
- one selected Practice;
- one dominant reason;
- structured confidence;
- explicit unknowns and alternatives;
- risk and reversibility;
- scope and validity;
- the real explanation and deliberation records.

Compatibility fields remain during migration, but the canonical contract is the Kernel entity.

## Consequence
This is an architectural migration, not a visual redesign. Existing behaviour is preserved while decision authority moves out of the interface.
