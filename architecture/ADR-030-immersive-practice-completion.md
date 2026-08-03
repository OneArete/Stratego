# ADR-030 — Immersive Practice Completion

**Status:** Accepted  
**Release:** Strategos v0.67.0

## Decision

Practice is rendered as a focused execution state rather than a normal application page. Navigation remains absent, one cue dominates, progress is quiet, secondary technique is disclosed only on demand, and completion pauses before Reflection.

Completion no longer routes immediately into questions. The person first receives a silent completion moment and explicitly continues when ready.

## Preserved invariants

- Safety can interrupt at any time.
- The person retains pause, phase navigation and exit control.
- Voice, sound, haptics and Wake Lock remain optional.
- No automatic adaptation or progression authority is added.
- Reflection and learning remain separate from execution.
