# Strategos v0.9.0 — Phase 3: Judgement Stability and Re-evaluation

Status: Development phase  
Baseline: `v0.9.0 Phase 2 — Accountable Learning`

## Purpose

This phase gives every material Current Judgement an explicit validity lifecycle and prevents small signal fluctuations from producing unnecessary judgement churn.

## Implemented

- 24-hour baseline validity window;
- context fingerprint attached to each judgement;
- explicit review triggers;
- automatic review requirement after material context change;
- expiry after validity window;
- supersession records;
- correction-driven re-evaluation;
- learning-rejection-driven re-evaluation;
- stability guard for minor context fluctuations;
- closed validity state after reflection or abandonment;
- schema v7 migration.

## Stability rule

When the preferred practice changes but:

- context similarity remains at least 82%;
- there is no material change;
- confidence advantage is no more than seven points;

Strategos retains the previous Current Judgement and explains why.

A material safety, priority or capacity change permits immediate re-synthesis.

## Verification

```text
44 tests
44 passed
0 failed
```
