import type { ZodType, z } from "zod";
import {
  ToolExecutionError,
  ToolTimeoutError,
  ToolValidationError,
} from "../errors/index.js";
import type {
  Guardrail,
  ToolExecutionContext,
  ToolLike,
} from "../types/index.js";
import { withRetry, withTimeout } from "../utilities/index.js";

export interface ToolDefinition<
  I extends ZodType,
  O extends ZodType | undefined = undefined,
> {
  name: string;
  description: string;
  inputSchema: I;
  outputSchema?: O;
  timeoutMs?: number;
  retries?: number;
  idempotent?: boolean;
  riskLevel?: "low" | "medium" | "high";
  requiresApproval?: boolean;
  parallelSafe?: boolean;
  guardrails?: Guardrail<unknown>[];
  execute(
    input: z.infer<I>,
    context: ToolExecutionContext,
  ):
    | Promise<O extends ZodType ? z.infer<O> : unknown>
    | (O extends ZodType ? z.infer<O> : unknown);
}
export class Tool<I extends ZodType, O extends ZodType | undefined = undefined>
  implements ToolLike
{
  readonly name: string;
  readonly description: string;
  readonly inputSchema: I;
  readonly outputSchema: O | undefined;
  readonly timeoutMs: number;
  readonly retries: number;
  readonly idempotent: boolean;
  readonly riskLevel: "low" | "medium" | "high";
  readonly requiresApproval: boolean;
  readonly parallelSafe: boolean;
  readonly guardrails: readonly Guardrail<unknown>[];
  private readonly executor: ToolDefinition<I, O>["execute"];
  constructor(definition: ToolDefinition<I, O>) {
    this.name = definition.name;
    this.description = definition.description;
    this.inputSchema = definition.inputSchema;
    this.outputSchema = definition.outputSchema;
    this.timeoutMs = definition.timeoutMs ?? 10_000;
    this.retries = definition.retries ?? 0;
    this.idempotent = definition.idempotent ?? false;
    this.riskLevel = definition.riskLevel ?? "low";
    this.requiresApproval =
      definition.requiresApproval ?? this.riskLevel === "high";
    this.parallelSafe = definition.parallelSafe ?? false;
    this.guardrails = Object.freeze(definition.guardrails ?? []);
    this.executor = definition.execute;
    Object.freeze(this);
  }
  async execute(input: never, context: ToolExecutionContext): Promise<unknown> {
    const parsed = this.inputSchema.safeParse(input);
    if (!parsed.success)
      throw new ToolValidationError(
        `Invalid input for tool ${this.name}`,
        { issues: parsed.error.issues },
        context.runId,
      );
    const retries = this.idempotent ? this.retries : 0;
    try {
      const result = await withRetry(
        (attempt) => {
          context.trace("tool_attempt", { tool: this.name, attempt });
          return withTimeout(
            (signal) => this.executor(parsed.data, { ...context, signal }),
            this.timeoutMs,
            context.signal,
            `Tool ${this.name} timed out`,
          );
        },
        retries,
        () => true,
        context.signal,
      );
      if (this.outputSchema) {
        const output = this.outputSchema.safeParse(result);
        if (!output.success)
          throw new ToolValidationError(
            `Invalid output from tool ${this.name}`,
            { issues: output.error.issues },
            context.runId,
          );
        return output.data;
      }
      return result;
    } catch (error) {
      if (error instanceof ToolValidationError) throw error;
      if (
        context.signal.aborted ||
        (error instanceof Error && error.name === "AbortError")
      )
        throw new ToolTimeoutError(
          `Tool ${this.name} timed out`,
          undefined,
          context.runId,
        );
      throw new ToolExecutionError(
        `Tool ${this.name} failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        undefined,
        context.runId,
        { cause: error },
      );
    }
  }
}
export function defineTool<
  I extends ZodType,
  O extends ZodType | undefined = undefined,
>(definition: ToolDefinition<I, O>): Tool<I, O> {
  return new Tool(definition);
}
