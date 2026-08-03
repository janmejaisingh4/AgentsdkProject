# ADR 007: Events and tracing

## Context
Interfaces need live state while operators need post-run evidence.
## Decision
Emit one ordered discriminated event stream and build dependency-free span-like traces with pluggable exporters and payload capture off by default.
## Alternatives considered
Mandatory OpenTelemetry adds weight; logs alone lack lifecycle structure.
## Consequences
Core stays small; an OpenTelemetry bridge can remain optional.
