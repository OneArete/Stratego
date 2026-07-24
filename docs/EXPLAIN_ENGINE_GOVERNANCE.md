# Strategos — Explain Engine Governance

Status: v0.24 Phase 1

## Purpose

The Explain Engine preserves a canonical record of how each judgement is represented to the person.

## Epistemic classes

```text
observed
inferred
decisive factor
unknown
alternative
change condition
```

## Canonical record

Every explanation record preserves:

```text
judgement identity
recommendation
confidence statement
observations and their source
inferences and their source
decisive Advisors
explicit unknowns
nearest alternative
conditions that could change the judgement
Human Model and Safety provenance timestamps
```

## Phase 1 boundary

The Explain Engine describes a judgement after it has been formed.

```text
behaviour influence: 0
ranking influence: 0
confidence influence: 0
safety influence: 0
```

It must never present an inference as a direct observation.

## Phase 2 — Person review and contestability

The person may confirm, reject as misleading or incomplete, or reopen a canonical explanation. An optional correction may be preserved.

Review changes the explanation record only.

```text
judgement influence: 0
ranking influence: 0
confidence influence: 0
safety influence: 0
```
