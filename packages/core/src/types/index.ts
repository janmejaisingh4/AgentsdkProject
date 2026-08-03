import type { ZodType } from "zod";

export type Message =
  | { role: "system" | "user"; content: string }
  | { role: "assistant"; content: string; toolCalls?: ToolCall[] }
  | { role: "tool"; content: string; toolCallId: string; name: string };

export interface ToolCall {
  id: string;
  name: string;
  arguments: unknown;
}
export interface ModelToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}
export interface Usage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}
export interface ModelRequest {
  model: string;
  messages: Message[];
  tools: ModelToolDefinition[];
  outputSchema?: Record<string, unknown>;
}
export interface ProviderContext {
  runId: string;
  signal: AbortSignal;
}
export interface ModelResponse {
  text: string;
  toolCalls?: ToolCall[];
  handoff?: { target: string; input: unknown };
  usage?: Partial<Usage>;
  finishReason?: "stop" | "tool_calls" | "length" | "content_filter" | "error";
}
export type ModelStreamEvent =
  | { type: "text_delta"; delta: string }
  | { type: "response"; response: ModelResponse };
export interface ModelProvider {
  readonly name: string;
  generate(
    request: ModelRequest,
    context: ProviderContext,
  ): Promise<ModelResponse>;
  stream?(
    request: ModelRequest,
    context: ProviderContext,
  ): AsyncIterable<ModelStreamEvent>;
}
export interface ModelConfig {
  provider: ModelProvider;
  model: string;
  timeoutMs?: number;
  retries?: number;
}
export interface RuntimeLimits {
  maxTurns: number;
  maxToolCalls: number;
  maxHandoffs: number;
  maxRunTimeMs: number;
  repeatedActionLimit: number;
}
export interface RetryPolicy {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  jitter: boolean;
}
export type RunStatus =
  | "initialized"
  | "validating_input"
  | "calling_model"
  | "awaiting_approval"
  | "executing_tools"
  | "handing_off"
  | "validating_output"
  | "completed"
  | "failed"
  | "cancelled";
export interface ToolExecutionContext {
  runId: string;
  sessionId?: string;
  activeAgent: string;
  signal: AbortSignal;
  sessionMetadata: Readonly<Record<string, unknown>>;
  userContext?: unknown;
  trace(name: string, data?: Record<string, unknown>): void;
}
export interface GuardrailContext {
  runId: string;
  sessionId?: string;
  stage: string;
  signal: AbortSignal;
}
export type GuardrailResult<T> =
  | { action: "allow"; value: T }
  | { action: "transform"; value: T; explanation: string }
  | { action: "reject" | "require_approval"; explanation: string };
export interface Guardrail<T> {
  name: string;
  execute(value: T, context: GuardrailContext): Promise<GuardrailResult<T>>;
}
export interface HandoffDefinition {
  target: AgentLike;
  description: string;
  inputSchema: ZodType;
  mode: "transfer";
}
export interface AgentLike {
  id: string;
  name: string;
  description?: string | undefined;
  instructions: string;
  model: ModelConfig;
  tools: readonly ToolLike[];
  handoffs: readonly HandoffDefinition[];
  inputGuardrails: readonly Guardrail<string>[];
  outputGuardrails: readonly Guardrail<unknown>[];
  outputSchema?: ZodType | undefined;
  limits: RuntimeLimits;
  outputRepairAttempts: number;
}
export interface ToolLike {
  name: string;
  description: string;
  inputSchema: ZodType;
  outputSchema?: ZodType | undefined;
  timeoutMs: number;
  retries: number;
  idempotent: boolean;
  riskLevel: "low" | "medium" | "high";
  requiresApproval: boolean;
  parallelSafe: boolean;
  execute(input: never, context: ToolExecutionContext): Promise<unknown>;
  guardrails: readonly Guardrail<unknown>[];
}
