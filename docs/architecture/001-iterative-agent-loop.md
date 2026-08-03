# ADR 001: Iterative agent loop

## Context
Agent work branches across model calls, tools, approval, repair, and handoffs. Uncontrolled recursion hides limits.
## Decision
Use one explicit iterative loop with phases and counters, a composed abort signal, and one terminal result.
## Alternatives considered
Recursive calls and a graph engine were rejected as harder to audit or prohibited framework behavior.
## Consequences
Limits are exact and the control flow is readable; new phases require deliberate runtime changes.
