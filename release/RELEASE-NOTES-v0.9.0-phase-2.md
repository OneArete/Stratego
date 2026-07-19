# Strategos v0.9.0 — Phase 2: Accountable Learning

Status: Development phase  
Baseline: `v0.9.0 Phase 1 — Evidence Diversity and Memory Integrity`

## Purpose

This phase prevents a single reflection from becoming durable truth.

It adds a governed learning lifecycle:

```text
Candidate
Confirmed
Rejected
Expired
```

## Implemented

- repeated-evidence confirmation;
- separation of similar and different contexts;
- person confirmation;
- person correction and rejection;
- automatic expiry of stale candidate learning;
- no influence from rejected or expired learning;
- reduced influence from candidate learning;
- full influence only after confirmation;
- schema v6 migration;
- person-facing learning review in Understanding Me.

## Confirmation baseline

Automatic confirmation currently requires:

- at least three observations;
- at least two consistent outcomes;
- at least two observations in the same context;
- no more than one contradictory outcome;
- consistency of at least 67%.

The person may confirm a candidate earlier or reject a learning at any time.

## Product boundary

A confirmed learning remains bounded to its domain, practice and observed context.

It is not a diagnosis, identity claim or universal rule.

## Verification

Run:

```bash
npm test
```

Expected result:

```text
35 tests
35 passed
0 failed
```
