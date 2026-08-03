import { AgentError } from "../errors/index.js";
import type {
  ModelProvider,
  ModelRequest,
  ModelResponse,
  ProviderContext,
} from "../types/index.js";
export function withFallback(
  configs: { provider: ModelProvider; retries?: number }[],
): ModelProvider {
  return {
    name: configs.map((x) => x.provider.name).join("→"),
    async generate(
      request: ModelRequest,
      context: ProviderContext,
    ): Promise<ModelResponse> {
      let last: unknown;
      for (const config of configs) {
        for (let attempt = 0; attempt <= (config.retries ?? 0); attempt++) {
          try {
            return await config.provider.generate(request, context);
          } catch (error) {
            last = error;
            if (!(error instanceof AgentError) || !error.retryable) throw error;
          }
        }
      }
      throw last;
    },
  };
}
