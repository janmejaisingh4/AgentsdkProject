import { Agent, FileSessionStore, MockProvider, Runner } from "@vasuagent/core";

const store = new FileSessionStore(".vasuagent-sessions");
const provider = new MockProvider((request) => ({
  text: `Context messages: ${request.messages.length}`,
}));
const agent = new Agent({
  name: "memory",
  instructions: "Remember preferences.",
  model: { provider, model: "mock" },
});
const runner = new Runner({ sessionStore: store });
console.log(
  await runner.run(agent, {
    input: "I prefer concise answers",
    sessionId: "alice",
  }),
);
console.log(
  await runner.run(agent, {
    input: "What is my preference?",
    sessionId: "alice",
  }),
);
console.log(
  await runner.run(agent, { input: "Do you know me?", sessionId: "bob" }),
);
