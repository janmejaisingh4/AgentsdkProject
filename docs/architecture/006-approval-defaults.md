# ADR 006: Approval-safe defaults

## Context
Risky model-proposed actions must not execute merely because no UI is configured.
## Decision
High-risk tools require approval and the default handler rejects. Modified arguments are revalidated.
## Alternatives considered
Automatic approval was rejected as unsafe; throwing at configuration time prevents useful dry flows.
## Consequences
Applications must deliberately wire approval.
