# ADR-019 — Judgement Screen Redesign and Onboarding Elevation

**Status:** Accepted  
**Version:** 0.53.0  
**Date:** 2026-07-25

## Context

Following the v0.52.0 stability work, an honest assessment of App Store readiness identified two critical product problems:

**Judgement screen density.** The screen shown when a user opens their daily recommendation was presenting all architecture simultaneously: `EXPECTED HUMAN RETURN +1.47`, safety envelopes with status icons, human model boundary labels, calibration drift notices, multiple `<details>` disclosure panels, delta scores, and forecast summaries. A new user encountering this screen would see internal engineering scaffolding, not a product. The judgement — the one sentence that should matter — was buried.

**Onboarding copy.** The three onboarding steps described what the product is in product-documentation language: "Not a tracker. Not a coach. Strategos examines your state each day, deliberates across six dimensions, and offers its best current judgement." This is accurate but inert. Onboarding should create anticipation for the question Strategos is about to ask, not explain its taxonomy.

## Decisions

### Judgement screen: hero-first architecture

The judgement sentence (`d.judgement`) is now rendered as a large `<h1>` at the top of the screen — the first thing the user sees and reads. Everything else is secondary.

The practice is presented as a card (`practice-card`) with its name, intention, duration as a pill badge, and up to two advisor voices (decisive factors). The runner-up is shown compactly beneath if present.

Choice buttons are linearised: Accept (primary, full-width), Choose alternative (secondary, conditional), then a minor-row with Defer and Decline as low-emphasis options. This hierarchy communicates that accepting is the expected path without blocking the others.

All internal architecture — advisors, confidence, human model evidence, explain record, change conditions, safety envelope, excluded practices — is collapsed into a single `<details class="deliberation-detail">` element labelled "How this judgement was formed." It is closed by default. A user who wants to understand the deliberation can open it. A user who wants to accept and begin does not need to see it at all.

The footer adds two low-emphasis text buttons: "Hear this" (speech) and "Reassess today" (returns to Today for a fresh signal pass). A link within the deliberation panel — "See the full reasoning in Understanding" — routes to the Understanding tab for users who want the full audit trail.

### Onboarding: evocative copy

Step 1 ("ONE QUESTION") opens with the question Strategos exists to answer: "What does your body actually need today?" — not what was planned, not what worked last week, but what the specific state right now calls for. This frames Strategos as an epistemic instrument, not a scheduler.

Step 2 ("SIX DIMENSIONS") introduces the organism with the line "A living model that learns from experience." The middle dot separator in the domain list uses a Unicode literal (`·`, U+00B7) rather than a browser-rendered entity to avoid encoding inconsistencies. The body copy clarifies that nothing is inferred from silence — a key trust principle stated early.

Step 3 ("READY") keeps only the name input: "Strategos will ask only what it needs — when it needs it." This replaces "Additional context can be added from Settings," which directed the user away from the primary flow immediately after onboarding.

All three steps use the "STRATEGOS" header (previously steps 2 and 3 used different headers). Consistent header across onboarding removes the impression that the user is moving through different modes of an app rather than a single coherent entry sequence.

### CSS additions

A dedicated `v0.53.0` block adds all new layout primitives: `.judgement-screen`, `.judgement-hero`, `.judgement-sentence` (clamped font-size, tight letter-spacing), `.practice-card` (surface + border-radius), `.practice-duration` (pill badge), `.choice-accept` (full-width primary button), `.choice-minor-row` (flex row), `.deliberation-detail` (collapsible border container with animated disclosure chevron), and `.judgement-footer-actions` (low-emphasis ghost buttons). No existing selectors were modified.

### Test maintenance

`progressive-profile-ui.test.js` assertions for `ONE PRINCIPLE` and `Understand first` were updated to match the new onboarding step 1 copy (`ONE QUESTION`, `What does your body actually need today`). The behavioural assertions — name input, organism rendering, absence of profile fields inside onboarding — were unchanged.

## Consequences

- A new user opening the app sees: organism → one sentence → one action. The judgement screen shows: hero sentence → practice card → choice. Architecture is available but requires intent to access.
- Onboarding leads with the question the product answers rather than a description of how it works.
- 930 tests pass, 0 failures.
- The deliberation panel contains all strings required by the existing test suite (canonical eligibility assessment, safety envelope, explain record, human model evidence boundary, guide section links) in their correct positions within the collapsed disclosure.
