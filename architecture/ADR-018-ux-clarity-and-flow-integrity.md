# ADR-018 — UX Clarity and Flow Integrity

**Status:** Accepted  
**Version:** 0.52.0  
**Date:** 2026-07-25

## Context

Three bugs were reported by the product lead after build 0490:

1. **Broken "Open today's recommendation" button.** The button appeared on the Today screen but pressing it did nothing.
2. **Decline does nothing.** After declining a judgement, the app re-rendered the same judgement screen with no path forward.
3. **Version references in Understanding.** Labels like `v1`, `v2`, version badges on section headings, and "influence: 0" developer annotations were visible throughout Understanding and Journey — the product lead described the tab as "super complex" and explicitly asked for these references to be removed.

Additionally, the app was not centering on wider screens, and the test suite had one pre-existing failure caused by a UTC/local date mismatch in the startup-continuity test fixture.

## Decisions

### Broken button — `action:'judgement'` → `action:'currentJudgement'`

`buildLivingCompanion()` in `living-companion.js` was returning `action:'judgement'` when a pending judgement existed. The global click handler in `app.js` has a case for `currentJudgement` (`if(a==='currentJudgement')return route('judgement')`) but no case for the bare string `'judgement'`. The fix: rename the returned action to `'currentJudgement'`, which is already handled.

### Decline flow — route to Today, not back to Judgement

`completePersonChoice()` was calling `return route('judgement')` for both decline and defer outcomes — re-rendering the same screen the person just left, with no visible change. Changed to `return route('today')` so the person returns to the organism and sees a contextual state (declined or deferred).

### Post-decline and post-defer states in `buildLivingCompanion`

Added two new mode branches in `buildLivingCompanion` before the main `judgement` return:

- **`declined`** — `personChoice.action === 'decline'`. Shows "You decided not to practice today." with a "Get a new recommendation" CTA (routes to `consult`, which triggers a fresh deliberation).
- **`deferred`** — `personChoice.action === 'defer'`. Shows the original judgement text with a "Return to recommendation" CTA (routes to `currentJudgement`).

This ensures the Today screen is never a dead end.

### Version badges removed from visible UI

Removed `<span>v${...}</span>` from five section headings:
- Human Model (Overview tab)
- Explain Engine (Audit tab)
- Human Model Audit (Audit tab)
- Practice Library (Evidence tab) — `content v${item.contentVersion}`
- Practice Library Audit (Audit tab)

These badges communicated internal versioning state to users who have no way to act on it. Audit sections retain their technical detail (counts, statements, timestamps) without the version number in the heading.

### Developer influence labels removed

Removed all `<small>... influence: 0 ...</small>` labels from:
- Human Model (Overview): "Judgement influence: 0 · Practice selection influence: 0 · Safety influence: 0"
- Explain Engine (Audit): "Explanation influence: 0 · The record is descriptive and audit-only in Phase 1."
- Explain Review (Audit): "Judgement influence: 0 · Ranking influence: 0 · Confidence influence: 0 · Safety influence: 0"
- Emotional sections (Evidence): "Human Model influence: 0 · Judgement influence: 0" (×2)
- Journey outcome ledger: "Frozen context · learning awaits review"
- Journey weekly intention: "Person-selected · Human Model influence 0 · judgement influence 0"
- Journey explain record: "Explanation version X · behaviour influence 0"
- Settings voice block: "The natural voice calibration from v0.5 has been restored."

These labels were architecture-transparency annotations written for the developer. They are not meaningful to the user and added cognitive noise in sections that already carry clear human-readable statements about what the data does and does not influence.

### Explicit centering added to CSS

Added a `v0.52.0` block at the end of `styles.css`:
```css
#app{max-width:var(--content-max);margin-inline:auto;}
.screen{margin-left:auto;margin-right:auto;}
```
The `.screen` rule already had `margin:auto` from v0.1.0, but a v0.14.2 full-width tabbar override created ambiguity. The explicit reinforcement ensures content remains centered on wide viewports.

### Test fixture timezone fix

`tests/startup-continuity.test.js` was computing today's key with `new Date().toISOString().slice(0,10)`, which returns a UTC date. `localDayKey()` in `daily-signals.js` uses the local clock (`getFullYear`, `getMonth`, `getDate`). In Portugal (UTC+1 summer) these diverge at midnight UTC. Changed to use the same local computation as the module under test.

## Consequences

- The "Open today's recommendation" button works correctly in all states.
- Declining or deferring a judgement routes to Today, which renders a meaningful state specific to the choice made.
- Understanding and Journey no longer expose version numbers or zero-influence developer labels. The architecture remains documented in code and ADRs.
- 930 tests pass, 0 failures.
