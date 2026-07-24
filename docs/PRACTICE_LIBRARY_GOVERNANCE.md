# Strategos — Practice Library Governance

Status: closure candidate with v0.21.1  
Scope: canonical Practice structure, contextual eligibility, governed exclusion and content provenance

## Governing principle

```text
Every Practice is a versioned, inspectable and auditable executable object.
Its declared conditions may constrain eligibility.
Its historical content remains preserved after execution.
```

## Canonical Practice contract

Every Practice must declare:

```text
identity
name
domain
goals
intensity
levels
equipment
contraindications
evidence status
content version
duration options
expected human return
executable phases
```

The Practice Library itself has a separate version.

## Contextual eligibility

Current signals may produce:

```text
eligible
caution
blocked
```

The assessment may use only declared Practice conditions and available context.

## Selection effect

```text
eligible → no ranking change
caution  → no ranking change
blocked  → excluded from the current Agora ranking
```

A blocked state requires a matched declared contraindication.

General caution does not alter ranking, confidence or duration.

## Governed exclusion

The Agora must preserve:

```text
eligibility trace
blocked Practices
matched contraindications
reason for exclusion
selection effect
```

Special-case blockers should be migrated into canonical Practice metadata whenever possible.

## Content provenance

When a Practice starts, the exact executable content is snapshotted.

The snapshot preserves:

```text
Practice identity
content version
library version
duration
goals
intensity
equipment
contraindications
evidence status
adjusted executable phases
timestamp
```

Historical states are:

```text
current
historical
retired
missing
```

## Precedence

```text
current safety
→ matched declared contraindication
→ Agora ranking
→ person choice
→ executable Practice snapshot
```

No lower layer may override a higher one.

## Audit guarantees

The system must preserve enough information to answer:

```text
Which Practice was available?
Why was another Practice excluded?
Which metadata governed that exclusion?
Which exact content version was executed?
How does that content compare with the current library?
```

## Runtime integrity

The Practice Library remains the canonical data source.

Eligibility logic is shared between transparency and Agora selection.

Practice content provenance is captured at Practice start.

No separate runtime governance module is introduced.
