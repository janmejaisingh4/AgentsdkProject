import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { redact } from "../errors/index.js";
import type { Usage } from "../types/index.js";
export interface TraceSpan {
  id: string;
  parentId?: string;
  name: string;
  startTime: string;
  endTime?: string;
  status: "running" | "completed" | "failed";
  attributes: Record<string, unknown>;
}
export interface RunTrace {
  runId: string;
  sessionId?: string;
  rootAgent: string;
  finalAgent: string;
  startTime: string;
  endTime: string;
  durationMs: number;
  status: string;
  spans: TraceSpan[];
  usage: Usage;
  error?: unknown;
  outputSummary?: string;
}
export interface TraceExporter {
  export(trace: RunTrace): Promise<void> | void;
}
export class InMemoryTraceExporter implements TraceExporter {
  readonly traces: RunTrace[] = [];
  export(trace: RunTrace) {
    this.traces.push(structuredClone(trace));
  }
}
export class ConsoleTraceExporter implements TraceExporter {
  export(trace: RunTrace) {
    console.log(formatTrace(trace));
  }
}
export class JsonFileTraceExporter implements TraceExporter {
  constructor(private readonly path: string) {}
  async export(trace: RunTrace) {
    await mkdir(dirname(this.path), { recursive: true });
    await writeFile(this.path, JSON.stringify(redact(trace), null, 2), "utf8");
  }
}
export function formatTrace(trace: RunTrace) {
  const lines = [
    `Run ${trace.rootAgent} [${trace.status}] ${(trace.durationMs / 1000).toFixed(1)}s`,
  ];
  trace.spans.forEach((span, index) => {
    lines.push(
      `${index === trace.spans.length - 1 ? "└─" : "├─"} ${span.name} [${span.status}]`,
    );
  });
  return lines.join("\n");
}
