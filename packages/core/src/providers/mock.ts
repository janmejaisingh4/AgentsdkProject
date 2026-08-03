import type {
  ModelProvider,
  ModelRequest,
  ModelResponse,
  ModelStreamEvent,
  ProviderContext,
} from "../types/index.js";
export type MockResponder =
  | ModelResponse
  | ((
      request: ModelRequest,
      context: ProviderContext,
      call: number,
    ) => ModelResponse | Promise<ModelResponse>);
export class MockProvider implements ModelProvider {
  readonly name = "mock";
  private call = 0;
  constructor(private readonly responses: MockResponder[] | MockResponder) {}
  async generate(
    request: ModelRequest,
    context: ProviderContext,
  ): Promise<ModelResponse> {
    if (context.signal.aborted) throw context.signal.reason;
    const list = Array.isArray(this.responses)
      ? this.responses
      : [this.responses];
    const responder = list[Math.min(this.call, list.length - 1)];
    if (!responder) throw new Error("MockProvider has no response configured");
    const call = this.call++;
    return typeof responder === "function"
      ? responder(request, context, call)
      : structuredClone(responder);
  }
  async *stream(
    request: ModelRequest,
    context: ProviderContext,
  ): AsyncIterable<ModelStreamEvent> {
    const response = await this.generate(request, context);
    for (const token of response.text.match(/\S+\s*/g) ?? []) {
      if (context.signal.aborted) throw context.signal.reason;
      yield { type: "text_delta", delta: token };
    }
    yield { type: "response", response };
  }
}
