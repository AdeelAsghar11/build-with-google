import "server-only";
import { parseDocument } from "./parse";
import { sanitize } from "./sanitize";
import { redactPII, generatePseudonyms, matchStudentIdentity, type RosterEntry } from "./redact";
import { scanHeuristics } from "./heuristics";
import {
  type Submission,
  type Identity,
  SubmissionSchema,
  IdentitySchema,
} from "../contracts";

export * from "./parse";
export * from "./sanitize";
export * from "./redact";
export * from "./heuristics";

export interface IngestFileInput {
  fileName: string;
  buffer: Buffer;
}

export interface IngestResult {
  submissions: Submission[];
  identities: Identity[];
}

/**
 * High-level ingest pipeline:
 * 1. Parses TXT/DOCX/PDF buffers into plain text + hidden run metadata
 * 2. Sanitizes zero-width/bidi/tag characters and extracts hidden text
 * 3. Redacts student PII (names, roll numbers, emails)
 * 4. Scans for overt prompt injection / grade manipulation heuristics
 * 5. Assigns seeded shuffled pseudonyms (never alphabetical)
 * 6. Generates teacher-only identity mappings
 */
export async function ingestFiles(
  assessmentId: string,
  files: IngestFileInput[],
  roster: RosterEntry[] = []
): Promise<IngestResult> {
  const pseudonyms = generatePseudonyms(files.length);
  const submissions: Submission[] = [];
  const identities: Identity[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const id = `sub_${Date.now()}_${i + 1}`;
    const pseudonym = pseudonyms[i];

    // 1. Parse document
    const parsed = await parseDocument(file.fileName, file.buffer);

    // 2. Sanitize characters & hidden runs
    const sanitized = sanitize(parsed.text, parsed.hiddenRuns);

    // 3. Redact PII for LLM grading text
    const redacted = redactPII(sanitized.sanitizedText, roster);

    // 4. Scan heuristics
    const heuristicHits = scanHeuristics(sanitized.sanitizedText);

    // 5. Ingest flags
    const flags = {
      removedChars: sanitized.removedChars,
      hiddenText: sanitized.hiddenText,
      heuristicHits,
      quarantined: [],
      wordCount: sanitized.sanitizedText.split(/\s+/).filter(Boolean).length,
      parseWarnings: parsed.warnings,
    };

    // 6. Review reasons
    const reviewReasons = [];
    if (sanitized.hiddenText.length > 0) {
      reviewReasons.push({
        code: "HIDDEN_TEXT" as const,
        detail: `Found ${sanitized.hiddenText.length} hidden text run(s)`,
      });
    }
    if (heuristicHits.length > 0) {
      reviewReasons.push({
        code: "HEURISTIC" as const,
        detail: `Matched ${heuristicHits.length} injection heuristic pattern(s)`,
      });
    }

    const status = reviewReasons.length > 0 ? ("needs_review" as const) : ("queued" as const);

    const submission: Submission = {
      id,
      assessmentId,
      pseudonym,
      fileName: file.fileName,
      textOriginal: parsed.text,
      textForGrading: redacted.redactedText,
      flags,
      status,
      reviewReasons,
      results: [],
      rubricVersion: 1,
      updatedAt: new Date().toISOString(),
    };

    submissions.push(SubmissionSchema.parse(submission));

    // Match identity for teacher-only storage
    const matchedIdentity = matchStudentIdentity(parsed.text, file.fileName, id, roster);
    if (matchedIdentity) {
      identities.push(IdentitySchema.parse(matchedIdentity));
    }
  }

  return { submissions, identities };
}
