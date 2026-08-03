# ADR 005: Handoff model

## Context
Arbitrary agent transfers can leak instructions and create cycles.
## Decision
Implement declared, schema-validated transfer mode with relevant context, counters, trace events, and visited-agent cycle detection.
## Alternatives considered
Delegation/sub-agent returns were deferred until parent-child semantics are fully tested.
## Consequences
Transfers are predictable; richer orchestration requires a later ADR.
