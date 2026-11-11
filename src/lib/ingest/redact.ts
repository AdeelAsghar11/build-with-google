import type { Identity } from "../contracts";

export interface RosterEntry {
  rollNo?: string;
  name: string;
  email?: string;
}

export interface RedactionResult {
  redactedText: string;
  redactedCount: number;
}

/**
 * Redacts student PII (names, roll numbers, emails, phone numbers) before text is sent to any model.
 * Replaces occurrences with [STUDENT].
 */
export function redactPII(text: string, roster: RosterEntry[] = []): RedactionResult {
  let result = text;
  let redactedCount = 0;

  // 1. Redact Emails
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
  result = result.replace(emailRegex, () => {
    redactedCount++;
    return "[STUDENT]";
  });

  // 2. Redact Roll Numbers: e.g. FA23-BCS-001, 23-CS-1234, BCS19001
  const rollRegex = /\b(?:[A-Z]{2}\d{2}-[A-Z]{2,4}-\d{2,4}|\b\d{2}-[A-Z]{2,4}-\d{2,4}\b|[A-Z]{3}\d{5,6})\b/gi;
  result = result.replace(rollRegex, () => {
    redactedCount++;
    return "[STUDENT]";
  });

  // 3. Redact Phone Numbers
  const phoneRegex = /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
  result = result.replace(phoneRegex, () => {
    redactedCount++;
    return "[STUDENT]";
  });

  // 4. Redact Roster Names and Tokens (length >= 3)
  for (const student of roster) {
    if (student.name && student.name.trim().length >= 3) {
      const escapedName = student.name.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const nameRegex = new RegExp(`\\b${escapedName}\\b`, "gi");
      result = result.replace(nameRegex, () => {
        redactedCount++;
        return "[STUDENT]";
      });

      // Also redact individual tokens of the name if >= 3 chars (e.g. "Fatima", "Noor")
      const tokens = student.name.trim().split(/\s+/).filter((t) => t.length >= 3);
      for (const token of tokens) {
        const escapedToken = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const tokenRegex = new RegExp(`\\b${escapedToken}\\b`, "gi");
        result = result.replace(tokenRegex, () => {
          redactedCount++;
          return "[STUDENT]";
        });
      }
    }

    if (student.rollNo && student.rollNo.trim()) {
      const escapedRoll = student.rollNo.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const rRegex = new RegExp(`\\b${escapedRoll}\\b`, "gi");
      result = result.replace(rRegex, () => {
        redactedCount++;
        return "[STUDENT]";
      });
    }
  }

  // Clean up any metadata label artifacts like "Name: [STUDENT]"
  result = result.replace(/(?:Student Name|Name|Roll Number|Roll No|Email):\s*\[STUDENT\]/gi, "");

  return {
    redactedText: result.trim(),
    redactedCount,
  };
}

/**
 * Deterministically generates shuffled pseudonyms (S-01 .. S-NN) so scripts are never alphabetical.
 */
export function generatePseudonyms(count: number, seed: number = 42): string[] {
  const list = Array.from({ length: count }, (_, i) => `S-${(i + 1).toString().padStart(2, "0")}`);

  // Seeded pseudo-random shuffle (LCG algorithm)
  let s = seed;
  const nextRandom = () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };

  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(nextRandom() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }

  return list;
}

export function matchStudentIdentity(
  rawText: string,
  fileName: string,
  submissionId: string,
  roster: RosterEntry[]
): Identity | null {
  for (const entry of roster) {
    if (entry.rollNo && (rawText.includes(entry.rollNo) || fileName.includes(entry.rollNo))) {
      return { submissionId, name: entry.name, rollNo: entry.rollNo };
    }
    if (entry.name && (rawText.includes(entry.name) || fileName.includes(entry.name))) {
      return { submissionId, name: entry.name, rollNo: entry.rollNo };
    }
  }
  return null;
}
