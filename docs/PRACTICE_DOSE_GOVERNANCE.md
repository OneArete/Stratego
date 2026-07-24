# Strategos — Practice Dose Governance

Status: closure candidate with v0.20.1

## Governing principle

Strategos may observe the relationship between planned dose, actual dose and outcome. It may propose a more realistic duration. The person decides whether that duration may be used. The system remains accountable to what happens afterwards.

## Full lifecycle

```text
planned duration
→ actual completion ratio
→ dose band
→ reflected outcome
→ repeated same-band evidence
→ person review
→ duration proposal
→ explicit person acceptance
→ future same-Practice duration only
→ real use
→ reflected fit
→ health assessment
→ automatic pause after repeated worse outcomes
```

## Dose bands

```text
short dose      < 50%
partial dose    50%–89%
full dose       ≥ 90%
```

## Evidence threshold

A candidate requires the same Practice, the same dose band, three distinct resolved outcomes and a 180-day window. Evidence alone changes nothing.

## Person review

```text
confirm
reject
reopen
```

Review changes accountability status only.

## Duration proposal

A confirmed pattern may generate a duration proposal. The proposal is inert until accepted.

An accepted duration applies only to future judgements of the same Practice, preserves the base duration and changes duration only. It never changes Practice selection, contract wording, safety boundaries, adaptation level or judgement confidence.

## Outcome accountability

Every use is recorded at Practice start and resolved after reflection.

```text
right
mixed
worse
unknown
```

Two recent worse outcomes pause automatic use and restore the base duration.

## Precedence

```text
current safety
→ explicit person choice
→ healthy accepted duration for the same Practice
→ base duration
```

## Audit

The system preserves base duration, proposed duration, person decision, accepted-duration use, completion ratio, contract outcome, fit, health status and pause reason.

## Runtime integrity

Practice Dose Governance remains inside the existing Practice session runtime module. No separate runtime module is introduced.
