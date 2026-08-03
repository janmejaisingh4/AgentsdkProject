import { randomUUID } from "node:crypto";
import type { ZodType, z } from "zod";
import { ConfigurationError } from "../errors/index.js";
import type {
  AgentLike,
  Guardrail,
  HandoffDefinition,
  ModelConfig,
  RuntimeLimits,
  ToolLike,
} from "../types/index.js";

const DEFAULT_LIMITS: RuntimeLimits = {
  maxTurns: 10,
  maxToolCalls: 8,
  maxHandoffs: 2,
  maxRunTimeMs: 30_000,
  repeatedActionLimit: 3,
};
export interface AgentOptions<O extends ZodType | undefined = undefined> {
  id?: string;
  name: string;
  description?: string;
  instructions: string;
  model: ModelConfig;
  tools?: ToolLike[];
  handoffs?: HandoffDefinition[];
  inputGuardrails?: Guardrail<string>[];
  outputGuardrails?: Guardrail<unknown>[];
  outputSchema?: O;
  outputRepairAttempts?: number;
  limits?: Partial<RuntimeLimits>;
}
export class Agent<O extends ZodType | undefined = undefined>
  implements AgentLike
{
  readonly id: string;
  readonly name: string;
  readonly description: string | undefined;
  readonly instructions: string;
  readonly model: ModelConfig;
  readonly tools: readonly ToolLike[];
  readonly handoffs: readonly HandoffDefinition[];
  readonly inputGuardrails: readonly Guardrail<string>[];
  readonly outputGuardrails: readonly Guardrail<unknown>[];
  readonly outputSchema: O | undefined;
  readonly outputRepairAttempts: number;
  readonly limits: RuntimeLimits;
  constructor(options: AgentOptions<O>) {
    if (!/^[a-zA-Z0-9_-]+$/.test(options.name))
      throw new ConfigurationError(
        "Agent name may only contain letters, numbers, underscores, and hyphens",
      );
    this.id = options.id ?? randomUUID();
    this.name = options.name;
    this.description = options.description;
    this.instructions = options.instructions;
    this.model = Object.freeze({ ...options.model });
    this.tools = Object.freeze([...(options.tools ?? [])]);
    this.handoffs = Object.freeze([...(options.handoffs ?? [])]);
    this.inputGuardrails = Object.freeze([...(options.inputGuardrails ?? [])]);
    this.outputGuardrails = Object.freeze([
      ...(options.outputGuardrails ?? []),
    ]);
    this.outputSchema = options.outputSchema;
    this.outputRepairAttempts = options.outputRepairAttempts ?? 1;
    this.limits = Object.freeze({ ...DEFAULT_LIMITS, ...options.limits });
    Object.freeze(this);
  }
}
export type AgentOutput<A extends Agent<ZodType | undefined>> =
  A extends Agent<infer O> ? (O extends ZodType ? z.infer<O> : string) : string;
