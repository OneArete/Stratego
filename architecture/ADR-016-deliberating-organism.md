# ADR-016 — Deliberating Organism: Energy-Responsive Membrane and Agora Visual Mode

**Status:** Accepted  
**Version:** 0.50.0  
**Date:** 2026-07-24

## Context

Two visual gaps existed in the organism before this ADR:

**1. The membrane shape was purely decorative.** The bezier membrane animates between 5 phases, but the path coordinates were computed solely from the dominant node's position and a sinusoidal wave. A person with Recovery at 0.9 and Agency at 0.1 saw exactly the same membrane shape as a person with uniform energy. The membrane carried no information.

**2. The thinking/deliberation screen used the same visual as Today.** `renderLivingGraph(graph, {ambient:true})` was called identically in both contexts. There was no visual signal that the organism was actively processing rather than at rest. The Agora — which is the deepest and most computationally intensive part of Strategos — had no dedicated presence.

## Decisions

### Energy-Responsive Membrane

`displacedNodes()` now incorporates each node's energy relative to the group average:

```
energyPush = (node.energy − avgEnergy) × 3.2
outward    = max(−2, 0.9 + dominantInfluence × 4.8 + energyPush + wave)
```

High-energy domains push the membrane outward. Dormant domains allow it to contract. The organism shape becomes a genuine energy contour:

- All signals dormant (check-in start) → symmetric, contracted shape
- One signal answered → membrane protrudes toward that domain
- Full context → membrane reflects the full energy distribution
- Today organism → membrane shows the person's accumulated human pattern

The change is always active. This makes the organism meaningful in every context it appears.

### Deliberating Mode

`renderLivingGraph` now accepts `{ deliberating: true }`. When set:

- **Membrane animation: 10s** (vs 18s normal). The organism breathes faster — active processing, not rest.
- **Membrane phases: [0, 1.1, 2.25, 3.4, 4.6]** (vs [0, .65, 1.35, 2.1, 2.85] normal). Wider oscillation — the organism moves more emphatically.
- **Filament drift: 7s** (vs 14s normal). The connections between domains pulse faster.
- **Node labels hidden.** During deliberation, the organism speaks without words. The dimensions communicate through their energy and shape, not their names.
- **Convergence ring.** A SMIL-animated circle contracts from the outer field (r=197px) to the center (r=24px) over 2.15s — synchronized with the Agora deliberation timeout of 2350ms. This communicates "the space of possibilities is collapsing to one direction." The ring disappears as it arrives, leaving only the organism and the emerging recommendation.

The `thinking()` function now calls `renderLivingGraph(graph, {ambient:true, deliberating:true})`.

## Consequences

- The membrane is now semantically meaningful — its shape is readable as an energy distribution.
- The deliberation screen has a distinct visual identity. Seeing vs. deciding is now visually distinguishable.
- `living-graph-motion.test.js` and `living-graph-wave-repair.test.js` updated to reflect dynamic duration and phase constants.
- The convergence ring is CSS-styled via `.convergence-ring` and animated entirely via SMIL — no JavaScript DOM updates during deliberation.
- `prefers-reduced-motion` existing rules already suppress SMIL animations (`display:none` on `animate` elements) — convergence ring respects this constraint without additional code.
