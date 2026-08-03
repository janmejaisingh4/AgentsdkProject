import {
  ConfigurationError,
  type Message,
  type ModelProvider,
  type ModelRequest,
  type ModelResponse,
  type ModelStreamEvent,
  ProviderAuthenticationError,
  type ProviderContext,
  ProviderError,
  ProviderRateLimitError,
} from "@vasuagent/core";
export interface OpenAIProviderOptions {
  apiKey?: string;
  baseUrl?: string;
  organization?: string;
  project?: string;
  fetch?: typeof globalThis.fetch;
}
export class OpenAIProvider implements ModelProvider {
  readonly name = "openai";
  private readonly apiKey;
  private readonly baseUrl;
  private readonly organization;
  private readonly project;
  private readonly fetcher;
  constructor(options: OpenAIProviderOptions = {}) {
    this.apiKey = options.apiKey ?? process.env.OPENAI_API_KEY;
    this.baseUrl = options.baseUrl ?? "https://api.openai.com/v1";
    this.organization = options.organization;
    this.project = options.project;
    this.fetcher = options.fetch ?? globalThis.fetch;
  }
  async generate(
    request: ModelRequest,
    context: ProviderContext,
  ): Promise<ModelResponse> {
    if (!this.apiKey)
      throw new ConfigurationError(
        "OpenAI API key is missing. Pass apiKey or set OPENAI_API_KEY.",
      );
    const response = await this.fetcher(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      signal: context.signal,
      headers: this.headers(),
      body: JSON.stringify(this.body(request, false)),
    });
    if (!response.ok) throw await this.error(response);
    return this.normalize((await response.json()) as OpenAIResponse);
  }
  async *stream(
    request: ModelRequest,
    context: ProviderContext,
  ): AsyncIterable<ModelStreamEvent> {
    if (!this.apiKey)
      throw new ConfigurationError(
        "OpenAI API key is missing. Pass apiKey or set OPENAI_API_KEY.",
      );
    const response = await this.fetcher(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      signal: context.signal,
      headers: this.headers(),
      body: JSON.stringify(this.body(request, true)),
    });
    if (!response.ok) throw await this.error(response);
    if (!response.body)
      throw new ProviderError("OpenAI returned no response body");
    const reader = response.body
      .pipeThrough(new TextDecoderStream())
      .getReader();
    let buffer = "";
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += value;
      const records = buffer.split("\n\n");
      buffer = records.pop() ?? "";
      for (const record of records)
        for (const line of record.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") return;
          const chunk = JSON.parse(data) as OpenAIChunk;
          const delta = chunk.choices[0]?.delta.content;
          if (delta) yield { type: "text_delta", delta };
        }
    }
  }
  private headers() {
    return {
      "content-type": "application/json",
      authorization: `Bearer ${this.apiKey}`,
      ...(this.organization
        ? { "openai-organization": this.organization }
        : {}),
      ...(this.project ? { "openai-project": this.project } : {}),
    };
  }
  private body(request: ModelRequest, stream: boolean) {
    return {
      model: request.model,
      messages: request.messages.map(toOpenAIMessage),
      tools: request.tools.length
        ? request.tools.map((tool) => ({
            type: "function",
            function: {
              name: tool.name,
              description: tool.description,
              parameters: tool.inputSchema,
              strict: true,
            },
          }))
        : undefined,
      ...(request.outputSchema
        ? {
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "agent_output",
                strict: true,
                schema: request.outputSchema,
              },
            },
          }
        : {}),
      stream,
    };
  }
  private normalize(value: OpenAIResponse): ModelResponse {
    const choice = value.choices[0];
    if (!choice) throw new ProviderError("OpenAI returned no choices");
    return {
      text: choice.message.content ?? "",
      ...(choice.message.tool_calls?.length
        ? {
            toolCalls: choice.message.tool_calls.map((call) => ({
              id: call.id,
              name: call.function.name,
              arguments: parseArguments(call.function.arguments),
            })),
          }
        : {}),
      finishReason:
        choice.finish_reason === "tool_calls"
          ? "tool_calls"
          : choice.finish_reason === "length"
            ? "length"
            : "stop",
      ...(value.usage
        ? {
            usage: {
              inputTokens: value.usage.prompt_tokens,
              outputTokens: value.usage.completion_tokens,
              totalTokens: value.usage.total_tokens,
            },
          }
        : {}),
    };
  }
  private async error(response: Response) {
    await response.text();
    const details = {
      status: response.status,
      requestId: response.headers.get("x-request-id") ?? undefined,
    };
    if (response.status === 401 || response.status === 403)
      return new ProviderAuthenticationError(
        "OpenAI authentication failed",
        details,
      );
    if (response.status === 429)
      return new ProviderRateLimitError("OpenAI rate limit exceeded", details);
    return new ProviderError(
      `OpenAI request failed with status ${response.status}`,
      details,
    );
  }
}
function toOpenAIMessage(message: Message): Record<string, unknown> {
  if (message.role === "tool")
    return {
      role: "tool",
      content: message.content,
      tool_call_id: message.toolCallId,
    };
  if (message.role === "assistant")
    return {
      role: "assistant",
      content: message.content,
      ...(message.toolCalls
        ? {
            tool_calls: message.toolCalls.map((call) => ({
              id: call.id,
              type: "function",
              function: {
                name: call.name,
                arguments: JSON.stringify(call.arguments),
              },
            })),
          }
        : {}),
    };
  return message;
}
function parseArguments(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}
interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string | null;
      tool_calls?: Array<{
        id: string;
        function: { name: string; arguments: string };
      }>;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
interface OpenAIChunk {
  choices: Array<{ delta: { content?: string } }>;
}
