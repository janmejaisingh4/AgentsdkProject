import type { RunResult } from "../runtime/index.js";
export type RunEvent =
  | EventOf<
      | "run_started"
      | "input_guardrail_started"
      | "guardrail_passed"
      | "guardrail_triggered"
      | "model_call_started"
      | "model_call_completed"
      | "model_retrying"
      | "tool_call_detected"
      | "tool_approval_requested"
      | "tool_approval_resolved"
      | "tool_started"
      | "tool_retrying"
      | "tool_completed"
      | "tool_failed"
      | "handoff_started"
      | "handoff_completed"
      | "structured_output_validation_failed"
      | "structured_output_repairing"
      | "session_loaded"
      | "session_saved"
      | "run_failed"
      | "run_cancelled"
      | "limit_reached",
      Record<string, unknown>
    >
  | EventOf<"model_text_delta", { delta: string }>
  | EventOf<"run_completed", { result: RunResult<unknown> }>;
export type EventOf<T extends string, P> = {
  type: T;
  eventId: string;
  runId: string;
  timestamp: string;
  sequence: number;
  payload: P;
};
export class EventQueue<T> implements AsyncIterable<T> {
  private values: T[] = [];
  private waiters: Array<(value: IteratorResult<T>) => void> = [];
  private ended = false;
  push(value: T) {
    const waiter = this.waiters.shift();
    if (waiter) waiter({ done: false, value });
    else this.values.push(value);
  }
  end() {
    this.ended = true;
    for (const waiter of this.waiters.splice(0))
      waiter({ done: true, value: undefined });
  }
  [Symbol.asyncIterator](): AsyncIterator<T> {
    return {
      next: () => {
        const value = this.values.shift();
        if (value !== undefined) return Promise.resolve({ done: false, value });
        if (this.ended)
          return Promise.resolve({ done: true, value: undefined });
        return new Promise((resolve) => this.waiters.push(resolve));
      },
    };
  }
}
