# Strategos — Practice Contract Governance

Status: closure candidate with v0.19.1  
Scope: pre-action expectations, post-action resolution and person-authorised revision

## Governing principle

```text
Strategos may propose an expectation.
The person remains free to act, stop, reflect, confirm, reject and revise.
The system preserves the expectation that existed before action.
```

## Full lifecycle

```text
judgement
→ Practice contract proposed
→ person decides whether to begin
→ contract snapshotted at start
→ Practice occurs
→ reflection resolves the contract
→ repeated outcomes form a calibration candidate
→ person confirms or rejects the calibration
→ confirmed calibration may generate a wording proposal
→ person accepts or declines the revision
→ accepted wording applies only to future contracts of the same Practice
```

## Contract content

Every Practice contract may state:

```text
intention
expected effect
planned duration
what counts as enough
reflection question
stop conditions
uncertainty
```

The contract is not an obligation and does not promise an outcome.

## Resolution states

```text
aligned
partially aligned
misaligned
uncertain
```

Resolution is a comparison between expectation and reflected outcome. It is not causal proof.

## Calibration thresholds

A calibration candidate requires:

```text
same Practice
3 distinct resolved contracts
within 180 days
```

Possible directions:

```text
mostly aligned
mixed
often misaligned
```

Calibration itself changes neither future contracts nor judgements.

## Person review

Calibration candidates require explicit person review:

```text
confirm
reject
reopen
```

Review changes accountability status only.

## Revision boundary

A confirmed calibration may generate a proposed wording revision.

The revision:

- is inert until explicit acceptance;
- applies only to the same Practice;
- changes only the expected-effect wording;
- never changes Practice selection;
- never changes judgement or confidence;
- never changes duration;
- never changes safety boundaries;
- never changes reflection logic;
- remains reversible.

## Precedence

```text
current safety
→ explicit person choice
→ accepted wording revision for the same Practice
→ base expected-effect wording
```

No lower layer may override a higher one.

## Audit and provenance

The system must preserve:

```text
base wording
accepted revision
contract shown before action
snapshot at Practice start
reflected outcome
resolution
calibration lineage
person review
revision decision
```

## Runtime integrity

The Practice Contract system remains inside the existing Practice session runtime module.

No separate review module is introduced.
