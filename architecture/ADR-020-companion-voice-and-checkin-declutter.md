# ADR-020 — Companion Voice Elevation and Check-in Declutter

**Status:** Accepted  
**Version:** 0.54.0  
**Date:** 2026-07-26

## Context

With the judgement screen and onboarding elevated in v0.53.0, the next weakest copy surfaces were the Living Companion states on Today (`buildLivingCompanion` in `living-companion.js`) and the check-in flow (`checkin()` in `app.js`). Both showed language written for internal debugging rather than for a person: "Let's understand today.", "I understand today.", "Day completed.", "You decided not to practice today." — descriptive, passive, and low on resonance for the single sentence that fills the Today screen's `<h1>`.

A planned addition — a dot-based progress indicator for check-in, to replace the numeric "X / 6" counter — was reconsidered after reading ADR-011 (Invisible Organism, Phase 1). ADR-011 explicitly states the Living Graph organism replaced seed dots as the sole progress signal ("seed dots removed — Living Graph replaces them," tested in `invisible-organism-phase-1.test.js`) and establishes the constitutional principle "visual presence precedes explanatory text." Adding new dot UI would have reintroduced exactly what that decision removed. The correct fix was to delete the redundant numeric counter, not replace it with a different counter.

A planned addition of a call-to-action button to the check-in "complete" branch was also reconsidered. Tracing `commitCheckinChoice()` showed that once the sixth signal is answered, the app already calls `route('today', {history:'replace'})` after a 40ms timeout — the check-in "complete" markup is a transitional state, not a screen a person meaningfully lands on. The actual landing point is Today's `ready` mode, which already carries the action "See today's recommendation" → `consult`. Adding a second CTA to a screen visible for under 50ms would have been redundant, not helpful.

## Decisions

### Living Companion copy elevated

All `judgement` field values returned by `buildLivingCompanion` were rewritten for resonance, preserving every `mode`, `action`, and `actionLabel` value (no behavioral change):

- `listen` (fresh): "Let's understand today." → "What is today asking of you?"
- `listen` (partial): "Let's finish understanding today." → "Almost there."
- `ready`: "I understand today." → "Strategos has what it needs."
- `declined`: "You decided not to practice today." → "Rest is a decision."
- `complete`: "Day completed." → "Today is closed."

`judgement` and `deferred` modes already used real recommendation text (`judgement.judgement`) as of v0.52.0 and were left unchanged. `reasons` and `confidence` fields are computed but not rendered on Today (`livingCompanionToday()` only reads `mode`, `judgement`, `action`, `actionLabel`) — they were left as-is since they carry no visible product surface today, only serving as an internal record.

The check-in complete branch (`checkin()`, unreachable in normal flow but present for back-navigation edge cases) received the matching "Strategos has what it needs." heading for consistency.

### Check-in counter removed, not replaced

The `<p>${completed+1} / 6</p>` counter above each check-in question was deleted outright. The now-unused `completed` variable in `checkin()` was removed with it. The organism (`buildCheckinGraph(context)`) already fills in visually as signals are answered — this is the intended, and only, progress signal per ADR-011. The corresponding dead CSS rule (`.seed-question>p:first-child`) was left in place; it now matches no element and is inert.

### Regression test updated, guard preserved

`tests/checkin-route-root-cause.test.js` pinned its assertion to the literal first line of `checkin()`, which included the now-removed `completed` variable. The test's actual purpose — guarding against a historical bug where `checkin()` called an undefined helper (`dailyContextCompletedCount()`) — was preserved. The pinned-line assertion was updated to match the current first line (`const checkinGraph=buildCheckinGraph(context)`), keeping the meaningful regression guard (`dailyContextCompletedCount()` must never appear in `app.js`) intact.

## Consequences

- Today's single sentence now reads as something a person would say to themselves, not a system status log.
- Check-in has one fewer clinical UI element; the organism carries the entire progress signal, consistent with the product's established visual-first philosophy.
- No new screens, no new architecture — this is a pure copy and declutter pass.
- 930 tests pass, 0 failures.
