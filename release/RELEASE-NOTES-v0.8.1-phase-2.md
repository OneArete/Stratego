# Strategos v0.8.1 — Stabilization Phase 2

## Practice Execution Integrity

This phase replaces interval-counted practice timing with timestamp-derived execution state.

### Included

- versioned execution-state contract;
- timestamp-based remaining-time calculation;
- pause duration integrity;
- persisted phase index and phase timing;
- interrupted-practice recovery after reload;
- explicit Resume, End and Discard choices;
- explicit judgement lifecycle transition to `in-practice`, `completed`, `abandoned` and `reviewed`;
- recorded abandonment outcomes;
- correct Wake Lock release on closure;
- accessible labels for execution icon controls;
- behavioural tests for timing, pause, phase transition and abandonment.

### Tests

```text
13 tests
13 passed
0 failed
```

### Not Included Yet

- state export/import;
- reset backup;
- visible persistence-error interface;
- service worker and offline shell;
- full accessibility pass;
- Arete Chime audio asset.

The sonic-logo infrastructure remains reserved. No generic temporary opening sound was introduced.
