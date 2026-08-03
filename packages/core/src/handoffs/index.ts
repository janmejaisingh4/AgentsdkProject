import type { ZodType } from "zod";
import type { AgentLike, HandoffDefinition } from "../types/index.js";
export function defineHandoff(options: {
  target: AgentLike;
  description: string;
  inputSchema: ZodType;
  mode?: "transfer";
}): HandoffDefinition {
  return Object.freeze({
    target: options.target,
    description: options.description,
    inputSchema: options.inputSchema,
    mode: "transfer",
  });
}
