# Strategos v0.8.1 — Stabilization and State Integrity

Release status: Official baseline  
Release type: Stabilization  
Previous baseline: `v0.8.0 — Adaptive Strategos`

## Purpose

v0.8.1 converts the v0.8.0 functional prototype into a more reliable development baseline.

The release focuses on state integrity, safer deliberation, execution resilience, person ownership of data, PWA reliability, accessibility and behavioural testing.

No new product mode or external AI dependency was introduced.

## Safety and Deliberation

- Significant soreness blocks Strength recommendations.
- Mild soreness reduces physical-load support.
- Emotional load materially influences deliberation.
- Advisor positions are preserved in an explicit Agora record.
- The strongest caution remains visible.
- Critical concerns can prevent unsafe synthesis.
- Confidence is presented qualitatively.

## Domain Alignment

The Living Human Graph now uses:

```text
Body
Recovery
Mind
Agency
Purpose
Relationships
```

Historic `legacy` deltas are migrated to `recovery`.

## Practice Execution

- Timer truth is timestamp-based.
- Background throttling no longer determines elapsed time.
- Pause duration is excluded correctly.
- Active execution state is persisted.
- Interrupted practices can be resumed, ended and recorded, or discarded.
- Completion and abandonment close the lifecycle explicitly.
- Wake Lock is released during closure paths.

## State Ownership and Recovery

- Export complete Strategos state.
- Validate imports before replacement.
- Preview imported state.
- Verify checksum.
- Create automatic pre-import backup.
- Use protected reset.
- Surface persistence failures.
- Recover a valid local backup when possible.
- Run deterministic schema migration.

## PWA and Accessibility

- Versioned service worker.
- Offline application shell after first successful load.
- Automatic obsolete-cache cleanup.
- Stable manifest identity and scope.
- Reduced-motion support.
- Accessible names for icon controls.
- Semantic switch state.
- Route focus management.
- Polite and bounded practice announcements.

## Test Baseline

The release contains 23 behavioural tests covering schema, migrations, domain alignment, safety, deliberation, execution, state transfer, PWA and accessibility.

Expected result:

```text
23 tests
23 passed
0 failed
```

## Explicitly Not Included

- external AI API;
- cloud account;
- multi-device sync;
- Family mode;
- Enterprise mode;
- Clinical mode;
- new Core Advisors;
- notification system;
- full Monthly Council implementation;
- provisional sonic-logo audio.

## Arete Chime

The future OneArete sonic identity remains intentionally unimplemented until an original composition is created.

```text
Name: Arete Chime
Duration target: approximately 2.5 seconds
Structure: Presence → Ascent → Resolution
Character: human, precise, calm and luminous
Cultural reference: subtle Sparta and Ancient Greece
Prohibited character: militaristic, tourist-like, bombastic or generic cinematic
```

## Release Decision

v0.8.1 is the official Strategos baseline for the next development cycle.

Future releases must evolve from this package and preserve v0.8.0 and v0.8.1 as recoverable release points.
