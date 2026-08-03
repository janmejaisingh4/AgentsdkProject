import { Agent, defineTool, MockProvider, Runner } from "@vasuagent/core";
import { z } from "zod";

const weather = defineTool({
  name: "weather",
  description: "Get weather",
  inputSchema: z.object({ city: z.string().min(1) }),
  outputSchema: z.object({ city: z.string(), temperatureC: z.number() }),
  execute: async ({ city }) => ({ city, temperatureC: 28 }),
});
const calculator = defineTool({
  name: "calculate",
  description: "Add numbers",
  inputSchema: z.object({ a: z.number(), b: z.number() }),
  execute: async ({ a, b }) => ({ result: a + b }),
});
const provider = new MockProvider([
  {
    text: "",
    toolCalls: [
      { id: "weather-1", name: "weather", arguments: { city: "Kanpur" } },
      { id: "math-1", name: "calculate", arguments: { a: 20, b: 8 } },
    ],
  },
  { text: "Kanpur is 28°C; 20 + 8 = 28." },
]);
console.log(
  await new Runner().run(
    new Agent({
      name: "tool-demo",
      instructions: "Use tools.",
      model: { provider, model: "mock" },
      tools: [weather, calculator],
    }),
    { input: "Weather and arithmetic" },
  ),
);
