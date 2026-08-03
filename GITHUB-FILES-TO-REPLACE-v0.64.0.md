# GitHub files to replace — Strategos v0.64.0

Apply this release over the v0.63.1 repository. Do not delete or replace unrelated files.

## Replace existing files
- `CHANGELOG.md`
- `README.md`
- `VERSION`
- `index.html`
- `package.json`
- `service-worker.js`
- `src/app.js`
- `src/core/agora.js`
- `src/core/belief-system.js`
- `src/core/calibration-governance.js`
- `src/core/daily-orientation.js`
- `src/core/daily-story.js`
- `src/core/engine.js`
- `src/core/evening-experience.js`
- `src/core/evidence-gate.js`
- `src/core/living-companion.js`
- `src/core/longitudinal-integrity.js`
- `src/core/personal-evidence.js`
- `src/core/practice-exit.js`
- `src/core/startup-continuity.js`
- `src/core/state-transfer.js`
- `src/core/storage.js`
- `src/core/streak.js`
- `src/core/trend-chart.js`
- `src/core/understanding.js`
- `src/core/weekly-review.js`
- `src/core/whats-new.js`
- `tests/adaptation-governance-closure.test.js`
- `tests/audit-stabilization.test.js`
- `tests/current-moment.test.js`
- `tests/daily-orientation.test.js`
- `tests/daily-signals.test.js`
- `tests/emotional-journal-follow-up-ui.test.js`
- `tests/emotional-journal-follow-up.test.js`
- `tests/emotional-journal-foundation-ui.test.js`
- `tests/emotional-journal-foundation.test.js`
- `tests/emotional-journal-themes-ui.test.js`
- `tests/emotional-journal-themes.test.js`
- `tests/evening-experience.test.js`
- `tests/explain-engine-foundation-ui.test.js`
- `tests/explain-engine-foundation.test.js`
- `tests/explain-engine-review-ui.test.js`
- `tests/explain-engine-review.test.js`
- `tests/organism-symmetry-checkin-hardening.test.js`
- `tests/personal-evidence.test.js`
- `tests/practice-contract-governance-closure.test.js`
- `tests/practice-dose-governance-closure.test.js`
- `tests/proactive-insight.test.js`
- `tests/progressive-profile.test.js`
- `tests/pwa-accessibility.test.js`
- `tests/runtime-import-integrity.test.js`
- `tests/runtime-safety-interruption-ui.test.js`
- `tests/runtime-safety-interruption.test.js`
- `tests/safety-acknowledgement-gate-ui.test.js`
- `tests/safety-acknowledgement-gate.test.js`
- `tests/safety-architecture-foundation-ui.test.js`
- `tests/safety-architecture-foundation.test.js`
- `tests/safety-architecture-governance-closure.test.js`
- `tests/startup-module-cache-integrity-hotfix.test.js`
- `tests/startup-module-integrity.test.js`
- `tests/understanding-footer-repair.test.js`
- `tests/weekly-intention.test.js`

## Add new files
- `architecture/ADR-027-strategos-kernel.md`
- `release/RELEASE-NOTES-v0.64.0.md`
- `src/core/strategos-kernel.js`
- `tests/strategos-kernel.test.js`

## Remove obsolete files
- `GITHUB-FILES-TO-REPLACE-v0.63.1.md`

## Verification
- Run `npm test`.
- Expected result: 1027 tests passed, 0 failed.
- Confirm `VERSION`, `package.json`, runtime imports and Service Worker all identify v0.64.0 / `0640k1`.
