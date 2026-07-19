# Strategos v0.8.1 — Stabilization Phase 3

## Data Ownership and Recovery

- Added portable JSON state export with format, schema, product version, timestamp and integrity checksum.
- Added validated state import with a person-readable preview and explicit confirmation.
- Added an automatic local backup before import.
- Added a protected two-step reset that retains a local recovery backup.
- Added visible persistence and import/export status in Settings.
- Added recovery from an unreadable primary state when a valid local backup exists.
- Added behavioural tests for export/import round-trip, tampering, unrelated JSON, preview and filename.

## Boundary

- State remains local to the browser.
- No cloud account, sync, external AI API or multi-person data sharing was introduced.
- No temporary Arete Chime audio was added.
