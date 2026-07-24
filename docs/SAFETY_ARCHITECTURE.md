# Strategos — Safety Architecture Governance

Status: closure candidate with v0.23.1  
Scope: deliberation safety envelope, constrained-state acknowledgement and runtime safety interruption

## Governing principle

```text
Safety must remain visible before action,
interruptible during action,
and accountable afterwards.
The person retains authority to stop.
```

## Safety lifecycle

```text
existing safety signals
→ Safety Envelope
→ clear / caution / constrained
→ explicit acknowledgement when constrained
→ Practice execution
→ person-controlled safety interruption
→ explicit resume or safe termination
→ preserved audit trail
```

## Safety Envelope

The envelope consolidates only existing safety-relevant information:

```text
declared Practice contraindications
blocked Practice eligibility
Advisor risk flags
critical severity
difficult reversibility
Advisor caution positions
current context snapshot
```

Envelope states:

```text
clear
caution
constrained
```

## Pre-execution acknowledgement

```text
clear       → no acknowledgement required
caution     → no acknowledgement required
constrained → explicit acknowledgement required before Practice begins
```

The acknowledgement is bound to:

```text
judgement id
Safety Envelope timestamp
envelope version
person action
time of acknowledgement
```

A previous acknowledgement cannot be silently reused for a different judgement or envelope.

## Runtime safety interruption

During Practice, the person may raise a safety concern at any time.

```text
raise concern
→ immediate pause
→ active safety interruption
→ explicit reassessment
→ resume or end safely
```

A normal pause action cannot bypass an active safety interruption.

Each interruption preserves:

```text
judgement
Practice
phase index
reason
creation time
resolution
resolution time
person source
```

## Precedence

```text
active safety interruption
→ constrained-envelope acknowledgement
→ declared contraindication exclusion
→ Agora ranking
→ person choice
→ Practice execution
```

No lower layer may override a higher one.

## Operational boundaries

Safety Architecture may:

- expose existing safety information;
- require acknowledgement for constrained envelopes;
- pause execution immediately when the person raises a concern;
- require explicit reassessment before resuming;
- preserve the complete audit trail.

Safety Architecture does not:

- diagnose medical conditions;
- infer new contraindications from a single event;
- alter Practice ranking because of a caution state;
- alter confidence or duration through acknowledgement;
- resume a Practice automatically after a safety interruption.

## Startup integrity

Every local and transitive JavaScript import must use one release token.
The complete runtime named-import graph must be validated against real exports before packaging.
Mutable JavaScript, CSS and HTML remain network-first with `no-store`.
