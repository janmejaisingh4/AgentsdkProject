const SENSITIVE =
  /api[-_]?key|authorization|bearer\s+[\w.-]+|password|secret|cookie|token/gi;
export function redact(value: unknown): unknown {
  if (typeof value === "string") return value.replace(SENSITIVE, "[REDACTED]");
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [
        SENSITIVE.test(k) ? "[REDACTED]" : k,
        redact(v),
      ]),
    );
  return value;
}
export class AgentError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly retryable = false,
    public readonly details?: Record<string, unknown>,
    public readonly runId?: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = new.target.name;
  }
  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: redact(this.message),
      retryable: this.retryable,
      details: redact(this.details),
      runId: this.runId,
    };
  }
}
function errorType(name: string, code: string, retryable = false) {
  return class extends AgentError {
    constructor(
      message: string,
      details?: Record<string, unknown>,
      runId?: string,
      options?: ErrorOptions,
    ) {
      super(code, message, retryable, details, runId, options);
      this.name = name;
    }
  };
}
export const ConfigurationError = errorType(
  "ConfigurationError",
  "CONFIGURATION_ERROR",
);
export const ProviderError = errorType("ProviderError", "PROVIDER_ERROR", true);
export const ProviderRateLimitError = errorType(
  "ProviderRateLimitError",
  "PROVIDER_RATE_LIMIT",
  true,
);
export const ProviderAuthenticationError = errorType(
  "ProviderAuthenticationError",
  "PROVIDER_AUTHENTICATION",
);
export const ToolNotFoundError = errorType(
  "ToolNotFoundError",
  "TOOL_NOT_FOUND",
);
export const ToolValidationError = errorType(
  "ToolValidationError",
  "TOOL_VALIDATION",
);
export const ToolExecutionError = errorType(
  "ToolExecutionError",
  "TOOL_EXECUTION",
);
export const ToolTimeoutError = errorType(
  "ToolTimeoutError",
  "TOOL_TIMEOUT",
  true,
);
export const GuardrailError = errorType("GuardrailError", "GUARDRAIL_REJECTED");
export const ApprovalRejectedError = errorType(
  "ApprovalRejectedError",
  "APPROVAL_REJECTED",
);
export const HandoffError = errorType("HandoffError", "HANDOFF_ERROR");
export const HandoffLoopError = errorType("HandoffLoopError", "HANDOFF_LOOP");
export const SessionError = errorType("SessionError", "SESSION_ERROR");
export const StructuredOutputError = errorType(
  "StructuredOutputError",
  "STRUCTURED_OUTPUT",
);
export const RunTimeoutError = errorType("RunTimeoutError", "RUN_TIMEOUT");
export const RunLimitError = errorType("RunLimitError", "RUN_LIMIT");
export const CancellationError = errorType("CancellationError", "CANCELLED");
export function normalizeError(error: unknown, runId?: string): AgentError {
  if (error instanceof AgentError) return error;
  return new AgentError(
    "UNKNOWN",
    error instanceof Error ? String(redact(error.message)) : "Unknown error",
    false,
    undefined,
    runId,
  );
}
