# ADR 003: Zod schemas

## Context
Model arguments and structured output are untrusted at runtime.
## Decision
Use Zod as the source for TypeScript inference, validation, field errors, and JSON Schema conversion.
## Alternatives considered
JSON Schema alone loses first-class inference; handwritten validation is error-prone.
## Consequences
Core carries Zod; developers get one schema definition.
