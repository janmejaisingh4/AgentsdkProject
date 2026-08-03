# ADR 004: Session storage

## Context
Conversation history outlives a run but must not mutate agent definitions.
## Decision
Use an async store contract with isolated records, timestamps, versions, optional TTL, and a separate context selector. Ship memory and atomic JSON-file stores first.
## Alternatives considered
SQLite was deferred because native driver installation is environment-sensitive.
## Consequences
The first persistent store favors portability over query performance.
