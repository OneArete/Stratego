# Strategos v0.9.0 — Evidence, Learning and Judgement Integrity

Release status: Official baseline  
Previous official baseline: `v0.8.1 — Stabilization and State Integrity`

## Release Purpose

v0.9.0 makes Strategos more accountable over time.

It strengthens three linked systems:

```text
Evidence
↓
Learning
↓
Current Judgement
```

The release prevents repeated inputs from masquerading as independent evidence, prevents a single reflection from becoming permanent truth, and prevents minor signal changes from creating unstable decisions.

## Evidence Integrity

- explicit evidence families;
- evidence-diversity assessment;
- narrow, mixed and diverse evidence states;
- preserved contradictions;
- confidence reduction when evidence is narrow or materially conflicting;
- strongest caution preserved in the Agora record.

## Accountable Advisor Memory

- structured memory records;
- positive, neutral and negative outcome counts;
- context-specific learning;
- Candidate, Confirmed, Rejected and Expired states;
- repeated-evidence confirmation;
- person confirmation and correction;
- reduced candidate influence;
- no influence from rejected or expired learning;
- 90-day recency decay baseline.

## Judgement Stability

- explicit Current Judgement validity;
- 24-hour baseline validity window;
- material-context comparison;
- review-required state;
- expiry;
- supersession;
- closure after reflection or abandonment;
- correction-driven re-evaluation;
- stability guard against small-input judgement churn.

## Longitudinal Integrity

- duplicate judgement cleanup;
- duplicate history cleanup;
- canonical judgement-to-history links;
- repair of inconsistent reviewed states;
- stale Current Judgement cleanup;
- canonical Delta recalculation;
- monthly Council snapshots;
- Journey records reconciled against history;
- reconciliation after load and import.

## Monthly Council

The former preview is now a bounded monthly snapshot.

It reports:

- reflected practices in the current month;
- confirmed and candidate learning;
- Advisor voices;
- strongest and weakest coverage.

It remains a reflective council, not a diagnostic or clinical report.

## State Schema

```text
Schema version: 8
Product version: 0.9.0
```

Migrations are included from the v0.8.0, v0.8.1 and v0.9.0 development schemas.

## Verification

```text
52 tests
52 passed
0 failed
```

The package also passes JavaScript syntax validation for the application, core modules, data modules, components and service worker.

## Explicitly Not Included

- external AI model integration;
- cloud account;
- cross-device sync;
- Family, Enterprise or Clinical modes;
- diagnosis or treatment;
- new Core Advisors;
- unrestricted professional-record storage;
- provisional Arete Chime audio.

## Arete Chime

The frozen sonic direction remains unchanged.

It should evoke disciplined human elevation and a subtle memory of Sparta and Ancient Greece through restraint, bronze-like resonance and clarity—not aggression or spectacle.

## Release Decision

`Strategos v0.9.0 — Evidence, Learning and Judgement Integrity` is the official product baseline for the next development cycle.
