# ADR 008: Package architecture

## Context
Core should stay lightweight while adapters have separate release cycles.
## Decision
Use pnpm workspaces with `@vasuagent/core` and a separate OpenAI adapter. Defer Anthropic/Gemini packages until maintainable tests exist.
## Alternatives considered
Embedding adapters in core reduces folders but couples release and dependencies.
## Consequences
Imports are explicit and future providers can evolve independently.
