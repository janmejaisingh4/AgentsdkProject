import { Agent, MockProvider, Runner } from "@vasuagent/core";
import { z } from "zod";

const schema = z.object({
  summary: z.string(),
  keyPoints: z.array(z.string()),
  confidence: z.number().min(0).max(1),
});
const agent = new Agent({
  name: "researcher",
  instructions: "Return JSON.",
  model: {
    provider: new MockProvider([
      { text: "invalid" },
      {
        text: JSON.stringify({
          summary: "Typed result",
          keyPoints: ["Bounded repair"],
          confidence: 0.9,
        }),
      },
    ]),
    model: "mock",
  },
  outputSchema: schema,
});
console.log(
  await new Runner().run(agent, { input: "Research agent reliability" }),
);
