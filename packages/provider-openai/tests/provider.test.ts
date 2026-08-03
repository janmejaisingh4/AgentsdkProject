import { ConfigurationError } from "@vasuagent/core";
import { describe, expect, it } from "vitest";
import { OpenAIProvider } from "../src/index.js";

describe("OpenAIProvider", () => {
  it("fails clearly without a key", async () => {
    const provider = new OpenAIProvider({ apiKey: "" });
    await expect(
      provider.generate(
        { model: "x", messages: [], tools: [] },
        { runId: "r", signal: new AbortController().signal },
      ),
    ).rejects.toBeInstanceOf(ConfigurationError);
  });
  it("normalizes text and usage", async () => {
    const provider = new OpenAIProvider({
      apiKey: "test",
      fetch: async () =>
        new Response(
          JSON.stringify({
            choices: [{ message: { content: "hello" }, finish_reason: "stop" }],
            usage: { prompt_tokens: 2, completion_tokens: 1, total_tokens: 3 },
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
    });
    const result = await provider.generate(
      { model: "x", messages: [{ role: "user", content: "hi" }], tools: [] },
      { runId: "r", signal: new AbortController().signal },
    );
    expect(result.text).toBe("hello");
    expect(result.usage?.totalTokens).toBe(3);
  });
});
