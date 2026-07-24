# ADR-008 — Truth Before Intelligence

**Status:** FROZEN  
**Release:** v0.43.0

## Decision

Strategos must never issue, expose or preserve a recommendation for the current day unless an explicit and complete current-day context exists.

The longitudinal Human Model may inform deliberation, but it can never substitute for today's evidence. Historical judgements are never treated as current-day judgements. Absence of evidence is represented neutrally and leads to one action only: begin or complete today's check-in.

## Evidence Gate

The Evidence Gate sits before the Agora and verifies:

1. a check-in exists for the current local day;
2. all required daily signals are explicit;
3. any visible judgement was created on that same local day;
4. explanation controls exist only when a real judgement exists.

When the gate is closed, deliberation is blocked in code and the Living Human Graph receives a neutral daily context.

## Constitutional rule

> The Strategos never infers today's reality from yesterday's evidence without first asking the person.
