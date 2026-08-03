# ADR 002: Provider abstraction

## Context
Provider message and tool formats differ.
## Decision
Normalize requests, messages, responses, stream events, usage, errors, and cancellation in core; translate only in adapter packages.
## Alternatives considered
A provider-specific core was simpler initially but creates lock-in.
## Consequences
Adapters have translation work; the runtime remains portable.
