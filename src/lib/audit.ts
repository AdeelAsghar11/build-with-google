import "server-only";
import { type AuditEntry, AuditEntrySchema } from "./contracts";
import { appendAuditLog } from "./db/repo";

export type { AuditEntry };

/**
 * Append an entry to the append-only audit log.
 */
export async function appendAudit(
  entry: Omit<AuditEntry, "ts"> & { ts?: string }
): Promise<void> {
  const fullEntry: AuditEntry = {
    ...entry,
    ts: entry.ts || new Date().toISOString(),
  };
  const validated = AuditEntrySchema.parse(fullEntry);
  await appendAuditLog(validated);
}
