import { Agent, MockProvider, Runner } from "@vasuagent/core";

const agent = new Agent({
  name: "assistant",
  instructions: "Be concise.",
  model: {
    provider: new MockProvider({ text: "Hello from VasuAgent." }),
    model: "mock",
  },
});
console.log(await new Runner().run(agent, { input: "Hello" }));
