# ADR-007 — Flow Above Features

**Status:** FROZEN  
**Release:** v0.43.0

## Decision
Today never exposes internal system states. It presents one human sentence and, while action remains, exactly one primary verb.

Official visible sequence:

1. Let’s understand today. → Start today’s check-in
2. I understand today. → See today’s recommendation
3. Recommendation available → Open today’s recommendation
4. Practice completed. → Reflect / Close today
5. Day completed. → no action

“Daily Story”, Agora readiness, persistence state and pipeline stages remain internal architecture. The Living Human Graph accompanies flow but never competes with it.

## Frozen constraints
- One visible primary action on Today.
- No technical state language on Today.
- No duplicate cards beneath the primary flow.
- The user must never need to infer the next step.
- A closed day has no CTA.
