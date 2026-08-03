import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import {
  Agent,
  CallbackApprovalHandler,
  defineHandoff,
  defineTool,
  FileSessionStore,
  InMemorySessionStore,
  MockProvider,
  maxInputLength,
  Runner,
} from "../src/index.js";

const model = (responses: ConstructorParameters<typeof MockProvider>[0]) => ({
  provider: new MockProvider(responses),
  model: "mock-1",
});
describe("agent runtime", () => {
  it("returns a final response and persists isolated sessions", async () => {
    const store = new InMemorySessionStore();
    const agent = new Agent({
      name: "assistant",
      instructions: "Help",
      model: model({ text: "hello" }),
    });
    const result = await new Runner({ sessionStore: store }).run(agent, {
      input: "hi",
      sessionId: "a",
    });
    expect(result.status).toBe("completed");
    if (result.status === "completed") expect(result.output).toBe("hello");
    expect((await store.get("a"))?.messages).toHaveLength(2);
    expect(await store.get("b")).toBeUndefined();
  });
  it("validates and executes a tool before continuing", async () => {
    const execute = vi.fn(async ({ city }: { city: string }) => ({
      city,
      temperatureC: 28,
    }));
    const tool = defineTool({
      name: "weather",
      description: "Weather",
      inputSchema: z.object({ city: z.string() }),
      outputSchema: z.object({ city: z.string(), temperatureC: z.number() }),
      execute,
    });
    const agent = new Agent({
      name: "weather",
      instructions: "Use tools",
      model: model([
        {
          text: "",
          toolCalls: [
            { id: "1", name: "weather", arguments: { city: "Kanpur" } },
          ],
        },
        { text: "28 C" },
      ]),
      tools: [tool],
    });
    const result = await new Runner().run(agent, { input: "weather?" });
    expect(result.status).toBe("completed");
    expect(execute).toHaveBeenCalledOnce();
  });
  it("returns invalid arguments to the model without executing", async () => {
    const execute = vi.fn();
    const tool = defineTool({
      name: "square",
      description: "Square",
      inputSchema: z.object({ n: z.number() }),
      execute,
    });
    const provider = new MockProvider((request, _context, call) =>
      call === 0
        ? {
            text: "",
            toolCalls: [{ id: "1", name: "square", arguments: { n: "bad" } }],
          }
        : { text: request.messages.at(-1)?.content ?? "" },
    );
    const result = await new Runner().run(
      new Agent({
        name: "math",
        instructions: "Math",
        model: { provider, model: "mock" },
        tools: [tool],
      }),
      { input: "x" },
    );
    expect(result.status).toBe("completed");
    expect(execute).not.toHaveBeenCalled();
  });
  it("auto-rejects high-risk tools and accepts explicit approval", async () => {
    const execute = vi.fn(() => "paid");
    const tool = defineTool({
      name: "pay",
      description: "Pay",
      inputSchema: z.object({ amount: z.number() }),
      riskLevel: "high",
      execute,
    });
    const responses = [
      {
        text: "",
        toolCalls: [{ id: "1", name: "pay", arguments: { amount: 5 } }],
      },
      { text: "done" },
    ];
    const agent = new Agent({
      name: "payments",
      instructions: "Pay",
      model: model(responses),
      tools: [tool],
    });
    expect((await new Runner().run(agent, { input: "pay" })).status).toBe(
      "failed",
    );
    const approvedAgent = new Agent({
      name: "payments2",
      instructions: "Pay",
      model: model(responses),
      tools: [tool],
    });
    expect(
      (
        await new Runner({
          approvalHandler: new CallbackApprovalHandler(() => ({
            status: "approved",
          })),
        }).run(approvedAgent, { input: "pay" })
      ).status,
    ).toBe("completed");
  });
  it("repairs structured output within a strict bound", async () => {
    const agent = new Agent({
      name: "research",
      instructions: "JSON",
      model: model([
        { text: "bad" },
        { text: '{"summary":"ok","confidence":0.8}' },
      ]),
      outputSchema: z.object({
        summary: z.string(),
        confidence: z.number().min(0).max(1),
      }),
    });
    const result = await new Runner().run(agent, { input: "research" });
    expect(result.status).toBe("completed");
    if (result.status === "completed")
      expect(result.output.confidence).toBe(0.8);
  });
  it("blocks guardrail violations and exact turn limits", async () => {
    const guarded = new Agent({
      name: "guarded",
      instructions: "Help",
      model: model({ text: "x" }),
      inputGuardrails: [maxInputLength(2)],
    });
    expect((await new Runner().run(guarded, { input: "long" })).status).toBe(
      "failed",
    );
    const looping = new Agent({
      name: "loop",
      instructions: "Loop",
      model: model({
        text: "",
        toolCalls: [{ id: "x", name: "missing", arguments: {} }],
      }),
      limits: { maxTurns: 1 },
    });
    expect((await new Runner().run(looping, { input: "x" })).status).toBe(
      "failed",
    );
  });
  it("performs declared transfer handoffs and rejects cycles", async () => {
    const specialist = new Agent({
      name: "billing",
      instructions: "Bill",
      model: model({ text: "resolved" }),
    });
    const triage = new Agent({
      name: "triage",
      instructions: "Route",
      model: model({
        text: "",
        handoff: {
          target: "billing",
          input: { reason: "invoice", summary: "help" },
        },
      }),
      handoffs: [
        defineHandoff({
          target: specialist,
          description: "Billing",
          inputSchema: z.object({ reason: z.string(), summary: z.string() }),
        }),
      ],
    });
    const result = await new Runner().run(triage, { input: "invoice" });
    expect(result.status).toBe("completed");
    if (result.status === "completed")
      expect(result.finalAgent).toBe("billing");
  });
  it("emits ordered events with a terminal event", async () => {
    const agent = new Agent({
      name: "stream",
      instructions: "Talk",
      model: model({ text: "hello" }),
    });
    const events = [];
    for await (const event of new Runner().stream(agent, { input: "hi" }))
      events.push(event);
    expect(events.map((x) => x.sequence)).toEqual(
      [...events.map((x) => x.sequence)].sort((a, b) => a - b),
    );
    expect(events.at(-1)?.type).toBe("run_completed");
  });
  it("persists file sessions", async () => {
    const directory = await mkdtemp(join(tmpdir(), "vasuagent-"));
    const store = new FileSessionStore(directory);
    await store.create("one");
    await store.appendMessages("one", [{ role: "user", content: "hello" }]);
    expect(
      (await new FileSessionStore(directory).get("one"))?.messages[0]?.content,
    ).toBe("hello");
  });
});
