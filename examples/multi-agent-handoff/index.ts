import { Agent, defineHandoff, MockProvider, Runner } from "@vasuagent/core";
import { z } from "zod";

const billing = new Agent({
  name: "billing",
  instructions: "Resolve billing issues.",
  model: {
    provider: new MockProvider({ text: "Your invoice has been explained." }),
    model: "mock",
  },
});
const technical = new Agent({
  name: "technical",
  instructions: "Resolve technical issues.",
  model: {
    provider: new MockProvider({ text: "The service is healthy." }),
    model: "mock",
  },
});
const inputSchema = z.object({ reason: z.string(), summary: z.string() });
const triage = new Agent({
  name: "triage",
  instructions: "Route requests.",
  model: {
    provider: new MockProvider({
      text: "Transferring.",
      handoff: {
        target: "billing",
        input: { reason: "invoice", summary: "Customer needs invoice help" },
      },
    }),
    model: "mock",
  },
  handoffs: [
    defineHandoff({
      target: billing,
      description: "Billing questions",
      inputSchema,
    }),
    defineHandoff({
      target: technical,
      description: "Technical questions",
      inputSchema,
    }),
  ],
});
console.log(await new Runner().run(triage, { input: "Explain my invoice" }));
