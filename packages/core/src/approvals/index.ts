export type ApprovalDecision =
  | { status: "approved" }
  | { status: "rejected"; reason?: string }
  | { status: "modified"; arguments: unknown; reason?: string }
  | { status: "timed_out" };
export interface ApprovalRequest {
  id: string;
  runId: string;
  sessionId?: string;
  toolName: string;
  riskLevel: "low" | "medium" | "high";
  arguments: unknown;
  reason: string;
  expiresAt: string;
}
export interface ApprovalHandler {
  request(request: ApprovalRequest): Promise<ApprovalDecision>;
}
export class AutoRejectApprovalHandler implements ApprovalHandler {
  async request(): Promise<ApprovalDecision> {
    return { status: "rejected", reason: "No approval handler configured" };
  }
}
export class CallbackApprovalHandler implements ApprovalHandler {
  constructor(
    private readonly callback: (
      request: ApprovalRequest,
    ) => Promise<ApprovalDecision> | ApprovalDecision,
  ) {}
  request(request: ApprovalRequest) {
    return Promise.resolve(this.callback(request));
  }
}
export class ConsoleApprovalHandler implements ApprovalHandler {
  async request(request: ApprovalRequest): Promise<ApprovalDecision> {
    const { createInterface } = await import("node:readline/promises");
    const input = createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    try {
      const answer = await input.question(
        `Approve ${request.toolName} with ${JSON.stringify(request.arguments)}? [y/N] `,
      );
      return /^y(es)?$/i.test(answer.trim())
        ? { status: "approved" }
        : { status: "rejected", reason: "Rejected by user" };
    } finally {
      input.close();
    }
  }
}
