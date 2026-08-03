import { CancellationError, RunTimeoutError } from "../errors/index.js";
export const sleep = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(signal.reason ?? new CancellationError("Operation cancelled"));
      },
      { once: true },
    );
  });
export function composeSignals(
  ...signals: (AbortSignal | undefined)[]
): AbortSignal {
  const controller = new AbortController();
  for (const signal of signals) {
    if (!signal) continue;
    if (signal.aborted) controller.abort(signal.reason);
    else
      signal.addEventListener("abort", () => controller.abort(signal.reason), {
        once: true,
      });
  }
  return controller.signal;
}
export async function withTimeout<T>(
  operation: (signal: AbortSignal) => Promise<T>,
  timeoutMs: number,
  parent?: AbortSignal,
  message = "Operation timed out",
): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(new RunTimeoutError(message)),
    timeoutMs,
  );
  const signal = composeSignals(parent, controller.signal);
  try {
    if (signal.aborted) throw signal.reason;
    return await operation(signal);
  } finally {
    clearTimeout(timer);
  }
}
export async function withRetry<T>(
  operation: (attempt: number) => Promise<T>,
  retries: number,
  canRetry: (error: unknown) => boolean,
  signal?: AbortSignal,
): Promise<T> {
  let last: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await operation(attempt);
    } catch (error) {
      last = error;
      if (attempt === retries || !canRetry(error)) throw error;
      await sleep(Math.min(1000, 50 * 2 ** attempt), signal);
    }
  }
  throw last;
}
