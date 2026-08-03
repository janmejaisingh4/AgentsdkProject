import type { Guardrail } from "../types/index.js";
export function maxInputLength(max: number): Guardrail<string> {
  return {
    name: "maximum_input_length",
    async execute(value) {
      return value.length <= max
        ? { action: "allow", value }
        : { action: "reject", explanation: `Input exceeds ${max} characters` };
    },
  };
}
export function promptInjectionWarning(): Guardrail<string> {
  const pattern = /ignore (all|previous)|system prompt|developer message/i;
  return {
    name: "prompt_injection_warning",
    async execute(value) {
      return pattern.test(value)
        ? {
            action: "transform",
            value,
            explanation:
              "Input contains a possible prompt-injection pattern; this heuristic is not a security boundary.",
          }
        : { action: "allow", value };
    },
  };
}
export function secretRedaction(): Guardrail<string> {
  const pattern =
    /(sk-[a-zA-Z0-9_-]{12,}|(?:api[_-]?key|password|secret)\s*[:=]\s*\S+)/gi;
  return {
    name: "secret_redaction",
    async execute(value) {
      const clean = value.replace(pattern, "[REDACTED]");
      return clean === value
        ? { action: "allow", value }
        : {
            action: "transform",
            value: clean,
            explanation: "Potential secrets were redacted",
          };
    },
  };
}
export function basicPiiRedaction(): Guardrail<string> {
  return {
    name: "basic_pii_redaction",
    async execute(value) {
      const clean = value
        .replace(/\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b/g, "[EMAIL_REDACTED]")
        .replace(/\b(?:\+?\d[\s.-]?){10,15}\b/g, "[PHONE_REDACTED]");
      return clean === value
        ? { action: "allow", value }
        : {
            action: "transform",
            value: clean,
            explanation: "Basic PII patterns were redacted",
          };
    },
  };
}
export function blockedCommandPatterns(
  patterns = [/\brm\s+-rf\b/i, /\bformat\s+[a-z]:/i],
): Guardrail<unknown> {
  return {
    name: "blocked_command_patterns",
    async execute(value) {
      const text = JSON.stringify(value);
      return patterns.some((p) => p.test(text))
        ? {
            action: "reject",
            explanation: "Arguments contain a blocked command pattern",
          }
        : { action: "allow", value };
    },
  };
}
export function maximumMonetaryAmount(
  max: number,
  field = "amount",
): Guardrail<unknown> {
  return {
    name: "maximum_monetary_amount",
    async execute(value) {
      const amount =
        value && typeof value === "object"
          ? Reflect.get(value, field)
          : undefined;
      return typeof amount === "number" && amount > max
        ? {
            action: "reject",
            explanation: `${field} exceeds the configured maximum`,
          }
        : { action: "allow", value };
    },
  };
}
