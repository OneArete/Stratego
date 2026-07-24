# ADR-013 — Full Signal-to-Domain Mapping for Human Graph

**Status:** Accepted  
**Version:** 0.49.0  
**Date:** 2026-07-24

## Context

The Human Graph has six domains (Body, Mind, Relationships, Purpose, Recovery, Agency). The daily check-in captures six signals (sleep, energy, time, challenge, soreness, emotionalLoad). Before this ADR, only `sleep` and `energy` were mapped to the graph — `Body` and `Mind` received partial context updates, while `Recovery`, `Agency`, `Purpose`, and `Relationships` received no daily signal at all.

This meant the organism did not reflect the full person. A person reporting heavy emotional load, 5 minutes of available time, or significant soreness saw no change in those dimensions. The organism was lying by omission.

## Decision

All six check-in signals are now mapped to their canonical domains via `applyContextSignals()` in `human-graph.js`:

| Signal | Primary domain | Secondary effect |
|---|---|---|
| `sleep` (0–4) | Recovery | Body stirs (rest enables physical capacity) |
| `energy` (1–3) | Body | Mind stirs (vitality supports cognition) |
| `soreness` (none/mild/significant) | Body modifier | Reduces body energy when significant |
| `time` (5/15/30/60 min) | Agency | None |
| `challenge` | Purpose | Secondary domain mirrors challenge type (body→Body, family→Relationships, etc.) |
| `emotionalLoad` (light/usual/heavy) | Mind | Relationships stirs (emotional load spills into relational space) |

The mapping is canonical — it is the same mapping used in both `buildHumanGraph` (full graph from history + context) and `buildCheckinGraph` (progressive awakening during check-in). One logic, two uses.

## Consequences

- The organism now reflects the full person from the first day, not just two dimensions.
- Soreness reducing body energy is a direct behavioural truth: physical constraint is visible in the organism before any deliberation occurs.
- The challenge signal activating Purpose is consistent with the principle "truth before intelligence" — what claims the person's attention is a fact, not an inference.
- `buildHumanGraph` existing tests updated to verify the new mappings.
