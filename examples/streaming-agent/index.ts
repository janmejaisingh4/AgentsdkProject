import { Agent, MockProvider, Runner } from "@vasuagent/core";

const agent = new Agent({
  name: "streaming",
  instructions: "Stream.",
  model: {
    provider: new MockProvider({ text: "A deterministic streamed response." }),
    model: "mock",
  },
});
for await (const event of new Runner().stream(agent, { input: "Stream" }))
  console.log(event.sequence, event.type, event.payload);
