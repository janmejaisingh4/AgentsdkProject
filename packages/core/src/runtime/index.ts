import { randomUUID } from "node:crypto";
import { zodToJsonSchema } from "zod-to-json-schema";
import type { Agent, AgentOutput } from "../agent/index.js";
import {
  type ApprovalHandler,
  AutoRejectApprovalHandler,
} from "../approvals/index.js";
import {
  type AgentError,
  ApprovalRejectedError,
  CancellationError,
  GuardrailError,
  HandoffError,
  HandoffLoopError,
  normalizeError,
  RunLimitError,
  RunTimeoutError,
  StructuredOutputError,
  ToolNotFoundError,
} from "../errors/index.js";
import {
  ContextManager,
  InMemorySessionStore,
  type SessionStore,
} from "../memory/index.js";
import { EventQueue, type RunEvent } from "../streaming/index.js";
import type { RunTrace, TraceExporter, TraceSpan } from "../tracing/index.js";
import type {
  AgentLike,
  Guardrail,
  Message,
  ModelResponse,
  ToolCall,
  Usage,
} from "../types/index.js";
import { withTimeout } from "../utilities/index.js";

export type RunResult<T = string> =
  | {
      status: "completed";
      runId: string;
      output: T;
      finalAgent: string;
      sessionId?: string;
      usage: Usage;
      trace: RunTrace;
    }
  | {
      status: "failed" | "cancelled" | "limit_exceeded";
      runId: string;
      error: AgentError;
      partialOutput?: string;
      sessionId?: string;
      usage: Usage;
      trace: RunTrace;
    };
export interface RunInput {
  input: string;
  sessionId?: string;
  signal?: AbortSignal;
  userContext?: unknown;
}
export interface RunnerOptions {
  sessionStore?: SessionStore;
  approvalHandler?: ApprovalHandler;
  traceExporters?: TraceExporter[];
  contextManager?: ContextManager;
  capturePayloads?: boolean;
}
type Emit = (type: RunEvent["type"], payload?: Record<string, unknown>) => void;

export class Runner {
  private readonly sessionStore;
  private readonly approvalHandler;
  private readonly exporters;
  private readonly contextManager;
  private readonly capturePayloads;
  constructor(options: RunnerOptions = {}) {
    this.sessionStore = options.sessionStore ?? new InMemorySessionStore();
    this.approvalHandler =
      options.approvalHandler ?? new AutoRejectApprovalHandler();
    this.exporters = options.traceExporters ?? [];
    this.contextManager = options.contextManager ?? new ContextManager();
    this.capturePayloads = options.capturePayloads ?? false;
  }
  async run<A extends Agent<import("zod").ZodType | undefined>>(
    agent: A,
    input: RunInput,
  ): Promise<RunResult<AgentOutput<A>>> {
    return this.execute(agent, input, () => undefined) as Promise<
      RunResult<AgentOutput<A>>
    >;
  }
  stream<A extends Agent<import("zod").ZodType | undefined>>(
    agent: A,
    input: RunInput,
  ): AsyncIterable<RunEvent> {
    const queue = new EventQueue<RunEvent>();
    void this.execute(agent, input, (event) => queue.push(event)).finally(() =>
      queue.end(),
    );
    return queue;
  }
  private async execute(
    rootAgent: AgentLike,
    input: RunInput,
    receive: (event: RunEvent) => void,
  ): Promise<RunResult<unknown>> {
    const runId = randomUUID();
    const started = Date.now();
    const usage: Usage = { inputTokens: 0, outputTokens: 0, totalTokens: 0 };
    const spans: TraceSpan[] = [];
    let sequence = 0;
    let activeAgent = rootAgent;
    let partialOutput = "";
    let finalStatus: "completed" | "failed" | "cancelled" | "limit_exceeded" =
      "failed";
    let finalError: AgentError | undefined;
    const emit: Emit = (type, payload = {}) =>
      receive({
        type,
        eventId: randomUUID(),
        runId,
        timestamp: new Date().toISOString(),
        sequence: ++sequence,
        payload,
      } as RunEvent);
    emit("run_started", { agent: rootAgent.name, sessionId: input.sessionId });
    const deadline = started + rootAgent.limits.maxRunTimeMs;
    const deadlineController = new AbortController();
    const deadlineTimer = setTimeout(
      () =>
        deadlineController.abort(
          new RunTimeoutError("Run deadline exceeded", undefined, runId),
        ),
      rootAgent.limits.maxRunTimeMs,
    );
    const signal = AbortSignal.any([
      deadlineController.signal,
      ...(input.signal ? [input.signal] : []),
    ]);
    let session = input.sessionId
      ? await this.sessionStore.get(input.sessionId)
      : undefined;
    if (input.sessionId && !session)
      session = await this.sessionStore.create(input.sessionId);
    if (session)
      emit("session_loaded", {
        sessionId: session.id,
        messageCount: session.messages.length,
      });
    const prior = session ? this.contextManager.select(session) : [];
    const messages: Message[] = [...prior];
    let userInput = input.input;
    let turns = 0;
    let toolCalls = 0;
    let handoffs = 0;
    let repairs = 0;
    const visitedAgents = [rootAgent.name];
    const actionCounts = new Map<string, number>();
    try {
      for (const guardrail of activeAgent.inputGuardrails) {
        emit("input_guardrail_started", { guardrail: guardrail.name });
        const result = await guardrail.execute(userInput, {
          runId,
          ...(input.sessionId ? { sessionId: input.sessionId } : {}),
          stage: "input",
          signal,
        });
        if (
          result.action === "reject" ||
          result.action === "require_approval"
        ) {
          emit("guardrail_triggered", {
            guardrail: guardrail.name,
            action: result.action,
          });
          throw new GuardrailError(
            result.explanation,
            { guardrail: guardrail.name },
            runId,
          );
        }
        if ("value" in result) userInput = result.value;
        emit(
          result.action === "transform"
            ? "guardrail_triggered"
            : "guardrail_passed",
          { guardrail: guardrail.name, action: result.action },
        );
      }
      messages.push({ role: "user", content: userInput });
      while (true) {
        if (signal.aborted)
          throw (
            signal.reason ??
            new CancellationError("Run cancelled", undefined, runId)
          );
        if (Date.now() >= deadline)
          throw new RunTimeoutError("Run deadline exceeded", undefined, runId);
        if (turns >= activeAgent.limits.maxTurns) {
          emit("limit_reached", {
            limit: "maxTurns",
            value: activeAgent.limits.maxTurns,
          });
          throw new RunLimitError(
            "Maximum turns reached",
            { limit: "maxTurns" },
            runId,
          );
        }
        turns++;
        emit("model_call_started", {
          agent: activeAgent.name,
          provider: activeAgent.model.provider.name,
          model: activeAgent.model.model,
          turn: turns,
        });
        const span: TraceSpan = {
          id: randomUUID(),
          name: `Model call: ${activeAgent.model.provider.name}/${activeAgent.model.model}`,
          startTime: new Date().toISOString(),
          status: "running",
          attributes: {
            provider: activeAgent.model.provider.name,
            model: activeAgent.model.model,
            turn: turns,
          },
        };
        spans.push(span);
        const request = {
          model: activeAgent.model.model,
          messages: [
            { role: "system" as const, content: activeAgent.instructions },
            ...messages,
          ],
          tools: activeAgent.tools.map((tool) => ({
            name: tool.name,
            description: tool.description,
            inputSchema: zodToJsonSchema(tool.inputSchema) as Record<
              string,
              unknown
            >,
          })),
          ...(activeAgent.outputSchema
            ? {
                outputSchema: zodToJsonSchema(
                  activeAgent.outputSchema,
                ) as Record<string, unknown>,
              }
            : {}),
        };
        let response: ModelResponse;
        try {
          response = await withTimeout(
            (modelSignal) =>
              activeAgent.model.provider.generate(request, {
                runId,
                signal: modelSignal,
              }),
            activeAgent.model.timeoutMs ?? 30_000,
            signal,
            "Model call timed out",
          );
          span.status = "completed";
        } catch (error) {
          span.status = "failed";
          throw error;
        } finally {
          span.endTime = new Date().toISOString();
        }
        addUsage(usage, response.usage);
        partialOutput += response.text;
        emit("model_call_completed", {
          finishReason: response.finishReason,
          toolCalls: response.toolCalls?.length ?? 0,
        });
        if (response.handoff) {
          const declared = activeAgent.handoffs.find(
            (h) => h.target.name === response.handoff?.target,
          );
          if (!declared)
            throw new HandoffError(
              `Undeclared handoff target: ${response.handoff.target}`,
              undefined,
              runId,
            );
          if (handoffs >= activeAgent.limits.maxHandoffs)
            throw new RunLimitError(
              "Maximum handoffs reached",
              { limit: "maxHandoffs" },
              runId,
            );
          if (visitedAgents.includes(declared.target.name))
            throw new HandoffLoopError(
              `Handoff cycle detected: ${[...visitedAgents, declared.target.name].join(" → ")}`,
              undefined,
              runId,
            );
          const parsed = declared.inputSchema.safeParse(response.handoff.input);
          if (!parsed.success)
            throw new HandoffError(
              "Invalid handoff input",
              { issues: parsed.error.issues },
              runId,
            );
          emit("handoff_started", {
            source: activeAgent.name,
            target: declared.target.name,
          });
          messages.push(
            { role: "assistant", content: response.text },
            {
              role: "user",
              content: `Transfer context: ${JSON.stringify(parsed.data)}`,
            },
          );
          handoffs++;
          activeAgent = declared.target;
          visitedAgents.push(activeAgent.name);
          emit("handoff_completed", { target: activeAgent.name });
          continue;
        }
        const calls = response.toolCalls ?? [];
        if (calls.length > 0) {
          messages.push({
            role: "assistant",
            content: response.text,
            toolCalls: calls,
          });
          for (const call of calls) {
            if (toolCalls >= activeAgent.limits.maxToolCalls) {
              emit("limit_reached", {
                limit: "maxToolCalls",
                value: activeAgent.limits.maxToolCalls,
              });
              throw new RunLimitError(
                "Maximum tool calls reached",
                { limit: "maxToolCalls" },
                runId,
              );
            }
            toolCalls++;
            await this.executeTool(activeAgent, call, {
              runId,
              input,
              ...(session ? { session } : {}),
              signal,
              emit,
              spans,
              messages,
              actionCounts,
            });
          }
          continue;
        }
        let output: unknown = response.text;
        if (activeAgent.outputSchema) {
          emit("structured_output_repairing", { attempt: repairs });
          const extracted = extractJson(response.text);
          const parsed = activeAgent.outputSchema.safeParse(extracted);
          if (!parsed.success) {
            emit("structured_output_validation_failed", {
              issues: parsed.error.issues,
              attempt: repairs,
            });
            if (repairs++ < activeAgent.outputRepairAttempts) {
              messages.push(
                { role: "assistant", content: response.text },
                {
                  role: "user",
                  content: `Your output did not match the required schema. Correct it. Validation errors: ${parsed.error.issues.map((x) => `${x.path.join(".")}: ${x.message}`).join("; ")}`,
                },
              );
              continue;
            }
            throw new StructuredOutputError(
              "Structured output validation failed",
              { issues: parsed.error.issues },
              runId,
            );
          }
          output = parsed.data;
        }
        for (const guardrail of activeAgent.outputGuardrails)
          output = await runOutputGuardrail(
            guardrail,
            output,
            runId,
            input.sessionId,
            signal,
            emit,
          );
        messages.push({ role: "assistant", content: response.text });
        if (session) {
          await this.sessionStore.appendMessages(
            session.id,
            messages.slice(prior.length),
          );
          emit("session_saved", { sessionId: session.id });
        }
        finalStatus = "completed";
        const trace = buildTrace(
          runId,
          input.sessionId,
          rootAgent.name,
          activeAgent.name,
          started,
          finalStatus,
          spans,
          usage,
          undefined,
          this.capturePayloads ? response.text : summarize(response.text),
        );
        const result: RunResult<unknown> = {
          status: "completed",
          runId,
          output,
          finalAgent: activeAgent.name,
          ...(input.sessionId ? { sessionId: input.sessionId } : {}),
          usage,
          trace,
        };
        emit("run_completed", { result });
        await this.export(trace);
        return result;
      }
    } catch (error) {
      finalError = normalizeError(error, runId);
      const cancelled =
        signal.aborted && !(finalError instanceof RunTimeoutError);
      const limited =
        finalError instanceof RunLimitError ||
        finalError instanceof RunTimeoutError;
      finalStatus = cancelled
        ? "cancelled"
        : limited
          ? "limit_exceeded"
          : "failed";
      const trace = buildTrace(
        runId,
        input.sessionId,
        rootAgent.name,
        activeAgent.name,
        started,
        finalStatus,
        spans,
        usage,
        finalError,
      );
      const result: RunResult<unknown> = {
        status: finalStatus,
        runId,
        error: finalError,
        ...(partialOutput ? { partialOutput } : {}),
        ...(input.sessionId ? { sessionId: input.sessionId } : {}),
        usage,
        trace,
      };
      emit(cancelled ? "run_cancelled" : "run_failed", {
        error: finalError.toJSON(),
      });
      await this.export(trace);
      return result;
    } finally {
      clearTimeout(deadlineTimer);
    }
  }
  private async executeTool(
    agent: AgentLike,
    call: ToolCall,
    context: {
      runId: string;
      input: RunInput;
      session?: { metadata: Record<string, unknown>; id: string };
      signal: AbortSignal;
      emit: Emit;
      spans: TraceSpan[];
      messages: Message[];
      actionCounts: Map<string, number>;
    },
  ) {
    const tool = agent.tools.find((x) => x.name === call.name);
    if (!tool)
      throw new ToolNotFoundError(
        `Unknown tool: ${call.name}`,
        undefined,
        context.runId,
      );
    context.emit("tool_call_detected", {
      toolName: call.name,
      callId: call.id,
    });
    const fingerprint = `${call.name}:${JSON.stringify(call.arguments)}`;
    const repeats = (context.actionCounts.get(fingerprint) ?? 0) + 1;
    context.actionCounts.set(fingerprint, repeats);
    if (repeats > agent.limits.repeatedActionLimit)
      throw new RunLimitError(
        `Repeated action loop detected for ${call.name}`,
        { limit: "repeatedActionLimit" },
        context.runId,
      );
    let args = call.arguments;
    const parsed = tool.inputSchema.safeParse(args);
    if (!parsed.success) {
      context.messages.push({
        role: "tool",
        name: call.name,
        toolCallId: call.id,
        content: JSON.stringify({
          error: "validation_failed",
          issues: parsed.error.issues,
        }),
      });
      return;
    }
    args = parsed.data;
    for (const guardrail of tool.guardrails) {
      const result = await guardrail.execute(args, {
        runId: context.runId,
        ...(context.input.sessionId
          ? { sessionId: context.input.sessionId }
          : {}),
        stage: "tool_input",
        signal: context.signal,
      });
      if (result.action === "reject")
        throw new GuardrailError(
          result.explanation,
          { guardrail: guardrail.name },
          context.runId,
        );
      if ("value" in result) args = result.value;
    }
    if (tool.requiresApproval || tool.riskLevel === "high") {
      const request = {
        id: randomUUID(),
        runId: context.runId,
        ...(context.input.sessionId
          ? { sessionId: context.input.sessionId }
          : {}),
        toolName: tool.name,
        riskLevel: tool.riskLevel,
        arguments: args,
        reason: `${tool.riskLevel}-risk tool requires approval`,
        expiresAt: new Date(Date.now() + 60_000).toISOString(),
      };
      context.emit("tool_approval_requested", { ...request });
      const decision = await this.approvalHandler.request(request);
      context.emit("tool_approval_resolved", {
        toolName: tool.name,
        decision: decision.status,
      });
      if (decision.status === "modified") {
        const modified = tool.inputSchema.safeParse(decision.arguments);
        if (!modified.success)
          throw new ApprovalRejectedError(
            "Modified arguments are invalid",
            { issues: modified.error.issues },
            context.runId,
          );
        args = modified.data;
      } else if (decision.status !== "approved")
        throw new ApprovalRejectedError(
          decision.status === "rejected"
            ? (decision.reason ?? "Approval rejected")
            : "Approval timed out",
          undefined,
          context.runId,
        );
    }
    context.emit("tool_started", { toolName: tool.name, callId: call.id });
    const span: TraceSpan = {
      id: randomUUID(),
      name: `Tool: ${tool.name}`,
      startTime: new Date().toISOString(),
      status: "running",
      attributes: { tool: tool.name, riskLevel: tool.riskLevel },
    };
    context.spans.push(span);
    try {
      const result = await tool.execute(args as never, {
        runId: context.runId,
        ...(context.input.sessionId
          ? { sessionId: context.input.sessionId }
          : {}),
        activeAgent: agent.name,
        signal: context.signal,
        sessionMetadata: context.session?.metadata ?? {},
        ...(context.input.userContext !== undefined
          ? { userContext: context.input.userContext }
          : {}),
        trace: (name, data) => {
          span.attributes[name] = data ?? {};
        },
      });
      span.status = "completed";
      context.messages.push({
        role: "tool",
        name: tool.name,
        toolCallId: call.id,
        content: JSON.stringify(result),
      });
      context.emit("tool_completed", { toolName: tool.name, callId: call.id });
    } catch (error) {
      span.status = "failed";
      context.messages.push({
        role: "tool",
        name: tool.name,
        toolCallId: call.id,
        content: JSON.stringify({
          error: normalizeError(error, context.runId).toJSON(),
        }),
      });
      context.emit("tool_failed", { toolName: tool.name, callId: call.id });
    } finally {
      span.endTime = new Date().toISOString();
    }
  }
  private async export(trace: RunTrace) {
    await Promise.all(this.exporters.map((x) => x.export(trace)));
  }
}
async function runOutputGuardrail(
  guardrail: Guardrail<unknown>,
  value: unknown,
  runId: string,
  sessionId: string | undefined,
  signal: AbortSignal,
  emit: Emit,
) {
  const result = await guardrail.execute(value, {
    runId,
    ...(sessionId ? { sessionId } : {}),
    stage: "output",
    signal,
  });
  if (result.action === "reject" || result.action === "require_approval") {
    emit("guardrail_triggered", { guardrail: guardrail.name });
    throw new GuardrailError(
      result.explanation,
      { guardrail: guardrail.name },
      runId,
    );
  }
  emit(
    result.action === "transform" ? "guardrail_triggered" : "guardrail_passed",
    { guardrail: guardrail.name },
  );
  return "value" in result ? result.value : value;
}
function extractJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    const match =
      text.match(/```(?:json)?\s*([\s\S]*?)```/i) ??
      text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (!match?.[1]) return text;
    try {
      return JSON.parse(match[1]);
    } catch {
      return text;
    }
  }
}
function addUsage(total: Usage, part?: Partial<Usage>) {
  total.inputTokens += part?.inputTokens ?? 0;
  total.outputTokens += part?.outputTokens ?? 0;
  total.totalTokens = total.inputTokens + total.outputTokens;
}
function summarize(value: string) {
  return value.length <= 160 ? value : `${value.slice(0, 157)}...`;
}
function buildTrace(
  runId: string,
  sessionId: string | undefined,
  rootAgent: string,
  finalAgent: string,
  started: number,
  status: string,
  spans: TraceSpan[],
  usage: Usage,
  error?: AgentError,
  outputSummary?: string,
): RunTrace {
  const end = Date.now();
  return {
    runId,
    ...(sessionId ? { sessionId } : {}),
    rootAgent,
    finalAgent,
    startTime: new Date(started).toISOString(),
    endTime: new Date(end).toISOString(),
    durationMs: end - started,
    status,
    spans,
    usage: { ...usage },
    ...(error ? { error: error.toJSON() } : {}),
    ...(outputSummary ? { outputSummary } : {}),
  };
}
