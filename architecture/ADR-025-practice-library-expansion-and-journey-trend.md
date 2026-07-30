# ADR-025 — Practice Library Expansion and Journey Trend Chart

**Status:** Accepted
**Version:** 0.59.0
**Date:** 2026-07-30

## Context

Pedro asked a direct question, not a feature request: does Strategos have genuine product potential, and — adopting the mindset of a real daily user rather than continuing engineering work in isolation — what is actually missing. Two gaps stood out on inspection of the shipped product, not from a wishlist.

First, the Practice Library (`src/data/codex.js`) covered five practices across four of the six declared domains (body ×2, recovery, mind, relationships) but had none for purpose or agency, despite both domains having dedicated Advisors (`purposeAdvisor`, `agencyAdvisor` in `agora.js`) that have been scoring practices since the Agora was built. A real user whose stated challenge is "work" or who is avoiding a decision has never been offered a practice actually designed for that — Agora would score the five existing practices with purpose/agency-flavoured reasoning, but the practice itself was always body, recovery, mind, or relationships. This is a content gap wearing the appearance of a reasoning gap.

Second, Journey — the screen whose entire purpose is showing the person their own history — is 100% text and lists (daily story timeline, weekly review, deliberation archive, personal evidence, outcome ledger, emotional journal, recent daily rhythm). None of it answers "am I actually getting better?" at a glance, which is the single most common thing a person opens a self-tracking tool to check. This is the kind of gap a user notices in the first week and an engineer, working feature-by-feature, does not.

## Decision

### 1. Two new Practices, each with a real Advisor voice

Added `direction` (domain: purpose, virtue: Integrity — name what today's effort is for, examine whether it matches, declare one sentence) and `decisive-action` (domain: agency, virtue: Courage — choose the smallest avoided action, do it, notice what changed) to `src/data/codex.js`. Both pass `validatePracticeLibrary()` with no missing fields, duplicate ids, invalid durations, or invalid phases (7/7 valid).

Adding a practice to the library without wiring it into scoring produces dead content — present, valid, but mathematically incapable of ever being recommended. To avoid that, all six advisor functions in `agora.js` (`bodyAdvisor`, `recoveryAdvisor`, `mindAdvisor`, `agencyAdvisor`, `purposeAdvisor`, `relationshipsAdvisor`) were given `direction` and `decisive-action` scores consistent with their existing reasoning (e.g. `recoveryAdvisor` favours `direction` more as recovery need drops; `agencyAdvisor` favours `decisive-action` most strongly when time is realistic and emotional load is not heavy). `judgementText()` and `intention()` were extended with copy for both new ids so a win never renders `undefined`.

First-pass calibration was empirically probed against realistic contexts and found safe (0 regressions) but too conservative: an exhaustive grid search (4 sleep × 4 energy × 3 time × 6 challenge × 3 soreness × 3 emotional-load values = 2,592 contexts) showed `decisive-action` never won a single one; `direction` won 34. A practice that cannot win anywhere is functionally still dead content even though it scores non-zero. `agencyAdvisor`'s `decisive-action` weight was raised from `1.05` to `1.3` (heavy-emotional-load branch unchanged at `.32`, preserving the existing judgement that a heavy day should not add an agency-demanding practice). Re-running the same grid confirmed `decisive-action` now wins in 10 of 2,592 contexts and `direction` in 28, without changing any other practice's eligibility or safety-blocking behaviour.

### 2. Positive-control reachability tests

`tests/practice-library-reachability.test.js` (new, 4 tests) asserts — using two concrete, exhaustively-verified contexts — that `direction` and `decisive-action` each actually win Agora's ranking outright, not merely score above zero. This is a different and stronger claim than shape validation: it is a regression guard against a new practice becoming dead content again silently in some future scoring tune.

### 3. Belief-adjustment test decoupled from live CODEX ranking

The practice library expansion shrank the margin between the `base` fixture's top two practices (`strength` and the new `direction`) to below `CONFIRMED_BELIEF_MAX_ADJUSTMENT`, breaking a precondition assertion in `tests/belief-adjustment.test.js`'s "opposing beliefs" test. Rather than hand-picking a new fixed pair, the test now searches all practices for one whose margin against the winner sits strictly between one belief's max swing and two beliefs' combined max swing — the only range where its claim ("a single belief cannot flip this, two opposing ones can") is actually true. This makes the test robust to future CODEX or advisor-scoring changes instead of fragile to them.

### 4. Journey trend chart

New module `src/core/trend-chart.js`: `buildTrendSeries(checkIns, limit)` extracts sleep/energy per recorded day in chronological order; `renderTrendSparkline(series)` renders both as an inline SVG (two polylines plus dots, no external chart library, consistent with the project's zero-dependency constraint); `trendSummary(series)` and `trendDirection(series, key)` produce a plain-language statement ("sleep is improving, energy is holding steady") by comparing the first half of the window's average against the second half's, with a small threshold (0.25) to avoid reporting noise as a trend. A new "TREND" section renders this at the top of Journey's descriptive-data area, before "Recent Daily Rhythm."

This is presentation only. `trend-chart.js` has no import of `agora.js`, `belief-system.js`, or `advisor-memory.js`, and cannot affect a judgement — the same "descriptive, zero automatic influence" guarantee already stated for Personal Evidence and the Outcome Ledger elsewhere in Journey, and is labelled identically ("Descriptive only. No automatic judgement influence.").

## Testing

963 tests pass, 0 failures (949 prior + 4 reachability + 10 trend-chart, with 1 existing test rewritten rather than added). The reachability claim (both new practices can actually win) and the trend chart's rendering were each verified two ways: unit tests against the pure functions, and an exhaustive/scripted probe run outside the test suite to confirm the underlying claim before writing the test that pins it.

## Consequences

- Every domain the Agora has an Advisor for now has at least one Practice that Advisor can actually recommend into. The remaining content-thinness (one practice per domain except body's two) is a real limitation and a natural next expansion, not addressed here.
- `decisive-action` remains reachable in a narrow slice of contexts (10 of 2,592 probed) rather than a broad one. This is an intentional, conservative first step — it proves the domain has a voice without aggressively displacing well-established practices like `strength` or `recovery` in contexts they already serve well. Whether it should be widened further is a product judgement, not an engineering one, and is left open.
- The trend chart uses only sleep and energy because those are the two signals recorded on every check-in. It does not yet plot practice-completion rate, confidence trend across judgements, or streaks — reasonable next candidates once this pattern is validated with Pedro on-device.
