# ADR-004 — Advisor-Local Memory

**Status:** Accepted and frozen  

Each Advisor owns a separate, persistent memory. Reflection may update only the memory of Advisors that participated in the judgement. Strategos may synthesize these memories but may not collapse them into a single undifferentiated profile.

## Consequences
- Specialists accumulate person-specific experience.
- Advisor implementations can be replaced independently.
- Conflicting domain perspectives remain available to the Agora.
- Memory-driven influence must remain bounded and explainable.
