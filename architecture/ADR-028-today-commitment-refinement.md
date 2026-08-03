# ADR-028 — Today Commitment Refinement

**Status:** Accepted  
**Release:** Strategos v0.65.0

## Context

After a person accepted the Current Judgement, the interface continued to show decision controls, advisor material and secondary questions. The decision had already been made, but the experience continued to behave as if deliberation were still open. A prior regression also demonstrated that safety acknowledgement could replace the path into Practice rather than support it.

## Decision

The accepted state is a distinct experience state named **commitment**.

Once the person accepts or chooses the alternative Practice:

1. decision controls disappear;
2. Today shows the commitment, Practice identity, duration and the minimum relevant safety boundary;
3. exactly one primary action remains: `BEGIN PRACTICE`;
4. when acknowledgement is required, the same action becomes `I UNDERSTAND — BEGIN PRACTICE` and performs both operations atomically;
5. reflection, friction planning and outcome questions remain unavailable until their legitimate states.

## Consequences

- Acceptance no longer opens another decision.
- The interface becomes a projection of the already-formed Current Judgement.
- Safety remains explicit without creating a dead end.
- The transition from commitment to Practice is testable as one continuous human path.
- Reassessment remains available as a subordinate agency-preserving action, not a competing CTA.

## Frozen invariant

**One decision. One commitment. One experience.**
