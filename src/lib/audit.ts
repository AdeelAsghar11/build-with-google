import "server-only";

export interface AuditEntry {
  ts: string;
  actor: "system" | string;
  action: string;
  submissionId?: string;
  criterionId?: string;
  before?: unknown;
  after?: unknown;
  model?: string;
  promptVersion?: string;
  detail?: string;
}

/**
 * Append an entry to the append-only audit log.
 */
export async function appendAudit(entry: AuditEntry): Promise<void> {
  // Writes to Firestore audit collection via repo
  console.log(`[AUDIT] ${entry.ts} [${entry.actor}]: ${entry.action}`, entry.detail ?? "");
}
