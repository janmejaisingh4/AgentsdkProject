import {
  Agent,
  CallbackApprovalHandler,
  defineTool,
  MockProvider,
  Runner,
} from "@vasuagent/core";
import { z } from "zod";

const payment = defineTool({
  name: "simulate_payment",
  description: "Simulate payment; never moves money",
  inputSchema: z.object({ amount: z.number().positive() }),
  riskLevel: "high",
  execute: async ({ amount }) => ({ simulated: true, amount }),
});
const responses = () =>
  new MockProvider([
    {
      text: "",
      toolCalls: [
        { id: "1", name: "simulate_payment", arguments: { amount: 10 } },
      ],
    },
    { text: "Simulation complete." },
  ]);
const makeAgent = () =>
  new Agent({
    name: "approval",
    instructions: "Use the simulation.",
    model: { provider: responses(), model: "mock" },
    tools: [payment],
  });
console.log(
  "Rejected:",
  await new Runner().run(makeAgent(), { input: "simulate" }),
);
console.log(
  "Approved:",
  await new Runner({
    approvalHandler: new CallbackApprovalHandler(() => ({
      status: "approved",
    })),
  }).run(makeAgent(), { input: "simulate" }),
);
