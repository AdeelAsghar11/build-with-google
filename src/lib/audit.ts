import "server-only";
import { type AuditEntry, AuditEntrySchema } from "./contracts";
import { appendAuditLog } from "./db/repo";

export type { AuditEntry };

/**
 * Append an entry to the append-only audit log.
 */
export async function appendAudit(entry: AuditEntry): Promise<void> {
  const validated = AuditEntrySchema.parse(entry);
  await appendAuditLog(validated);
}
