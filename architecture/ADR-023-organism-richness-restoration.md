# ADR-023 — Organism Richness Restoration

**Status:** Accepted  
**Version:** 0.57.0  
**Date:** 2026-07-26

## Context

Pedro flagged a screenshot of the Today screen's organism (the "closed day" state) as visually wrong: a thin circle, a barely-visible dashed hexagon connecting six small dots, and one dot inexplicably larger with a faint glow. The complaint was correct and specific, not a matter of taste to negotiate — it pointed at a real defect.

## Root cause

`styles.css` had accumulated four separate `.living-graph{...}` definitions, three separate `.graph-membrane{...}` definitions, and two separate `.node-halo{...}` / `@keyframes halo-breath` definitions across prior versions (v0.11 through v0.50), none of which were removed as later ones were added. CSS resolves same-specificity rules by source order per property, not by rule block — so each later definition silently overrode individual properties from earlier ones, while the earlier blocks stayed in the file (still true, still matched by substring-based regression tests, but no longer the *effective* rendered value).

Concretely, by the time all four `.graph-membrane` and `.living-graph.ambient .graph-membrane` definitions were merged by the cascade:

- Effective ambient membrane fill: `rgba(184,148,88,.014)` — roughly 1% visible alpha once combined with the element's `opacity:.72`. Functionally invisible.
- Effective ambient link stroke: `stroke-dasharray:1 7` — a 1px dash with a 7px gap, which reads as a dotted technical outline rather than connective tissue.
- Effective non-dominant node halo: animated between 7% and 18% opacity via `@keyframes halo-breath`. Effective dominant node halo: 9% to 22% via `@keyframes dominantHalo`. Both too faint to register as a deliberate signal — the size difference on the dominant node looked arbitrary rather than alive.

None of this was a deliberate design decision frozen at some point — it was the un-reviewed byproduct of successive additions, most recently the v0.50.0 "energy-responsive membrane" work, each of which was tested in isolation (the tests check that specific strings exist *somewhere* in the stylesheet, not that they are the value that actually renders) without anyone checking the compounded, real-world visual result.

## Decision

Rather than delete the four generations of prior rules — several are pinned verbatim by existing regression tests (`footer-graph-refinement.test.js` checks for the exact string `fill:rgba(184,148,88,.07)`, for example) as historical guards, and rewriting those tests carries its own risk of losing intent — a final, higher-specificity, clearly-commented block was appended to the end of `styles.css`. This guarantees these rules win the cascade regardless of what precedes them, without touching or removing anything a test depends on.

The block:

- Restores real membrane fill via `.graph-membrane:not(.graph-membrane-shadow){fill:rgba(203,171,110,.11)}` (and a slightly softer ambient-specific value), using `:not(.graph-membrane-shadow)` so the separate blurred-shadow path — which is deliberately `fill:none` — is left untouched.
- Removes the dashed, dotted appearance of ambient connective links (`stroke-dasharray:none`) and gives them a warmer, more visible stroke.
- Strengthens the dominant link's glow so the strongest connection in the organism is unambiguous.
- Boosts `organism-depth`'s background blur glow slightly for more perceptible ambient bloom.
- Redeclares `@keyframes halo-breath` (7–18% → 15–36% opacity) and `@keyframes dominantHalo` (9–22% → 18–42% opacity) in full — a later `@keyframes` declaration with the same name replaces the earlier one wholesale, so this is a clean, complete swap, not a partial merge.

No test asserts that the *old*, fainter values are the ones that must render (they only assert the string exists in the file — which remains true, since nothing was deleted). No layout, timing, or accessibility behavior changed: `prefers-reduced-motion` handling is untouched, and a small addition ensures the new dominant-link glow filter is also disabled under reduced motion.

## Verification

942 tests pass, 0 failures — identical count to before this change, confirming nothing broke. The cascade outcome was independently verified with a small script that parses `styles.css` and prints every rule block matching each selector in file order, confirming the new block's declarations are strictly last (or higher-specificity) for every property touched.

This was not verified by eye on a physical device by the author of the change — Node.js has no browser rendering. Pedro's confirmation on his own device is the real acceptance test and is expected before this is considered closed.

## Consequences

- The ambient organism should now show a genuinely visible warm membrane fill, continuous (not dotted) connective links, and a clearly brighter dominant-domain halo, while the neutral (no-data) state remains a calm, symmetric shape per the existing constitutional constraint (`invisible-organism-phase-1-hotfix.test.js`).
- The underlying technical debt — four generations of overlapping `.living-graph` rules — was not removed, only out-prioritized. A future cleanup pass should consolidate these into one authoritative definition per selector and delete the superseded ones, updating the handful of tests that pin old literal values to assert against the current, intended styling instead. This is scoped out of this release to keep the fix low-risk and immediately shippable.
