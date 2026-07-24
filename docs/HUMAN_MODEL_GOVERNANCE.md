# Strategos — Human Model Governance

Status: closure candidate with v0.22.1  
Scope: progressive Human Model, evidence review, deliberation snapshots and person-authorised fact promotion

## Governing principle

```text
Strategos must distinguish what is directly known,
what was reported,
what was inferred,
what was rejected,
and what remains unknown.
Stable facts require explicit human authority.
```

## Canonical dimensions

```text
identity
body
recovery
mind
agency
purpose
relationships
context
```

## Evidence classes

```text
confirmed fact
reported observation
confirmed observation
inference
rejected evidence
unknown
correction
```

A transient signal must never silently become a permanent personal fact.

## Progressive lifecycle

```text
onboarding identity
→ confirmed fact

Today signals
→ reported observations
→ person review
→ confirmed or rejected evidence
→ deliberation snapshot
→ repeated confirmed observations
→ stable-fact candidate
→ explicit person promotion or rejection
```

## Person review

Each visible evidence item may be:

```text
confirm
reject with correction
reopen
```

A correction preserves:

```text
evidence id
key
person note
timestamp
review source
```

Review changes evidence status only.

## Deliberation evidence boundary

At the start of each Agora deliberation, Strategos preserves:

```text
confirmed facts
confirmed observations
reported observations
rejected evidence
unknowns
```

Rejected evidence remains preserved for accountability but is excluded from the active evidence set.

The snapshot is attached to the judgement and cannot be rewritten by later Human Model changes.

## Stable-fact promotion

A candidate requires:

```text
same observation key
same value
3 confirmed observations
within 180 days
```

The person may:

```text
promote to stable fact
keep as observations
reopen
```

No repeated observation becomes a stable fact automatically.

A promoted fact preserves its supporting evidence ids and count.

## Precedence

```text
explicit person correction
→ rejected evidence excluded
→ current evidence boundary
→ stable fact only after explicit promotion
→ unknown remains unknown
```

No lower layer may override a higher one.

## Operational boundary

Throughout v0.22:

```text
judgement influence: 0
Practice selection influence: 0
safety influence: 0
rejected evidence influence: 0
```

The Human Model is inspectable, reviewable, versioned and auditable, but does not yet alter decisions.

## Audit guarantees

The system must be able to answer:

```text
What did Strategos know directly?
What was merely reported?
What did the person confirm or reject?
Which evidence boundary existed at decision time?
Which repeated observations supported a candidate?
Who authorised promotion to a stable fact?
What remains unknown?
```

## Runtime integrity

The Human Model remains in the dedicated existing core module:

```text
src/core/human-model.js
```

No additional governance runtime module is introduced.
