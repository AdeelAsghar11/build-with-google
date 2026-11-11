import "server-only";
import { detectCollusion } from "./collusion";
import { appendAudit } from "../audit";
import {
  getAssessment,
  getSubmissions,
  saveSubmission,
  saveCollusionPairs,
} from "../db/repo";
import type { CollusionPair, Submission } from "../contracts";

export interface FinalizeResult {
  assessmentId: string;
  submissionsCount: number;
  collusionPairs: CollusionPair[];
}

/**
 * Finalizes assessment batch:
 * 1. Executes within-class collusion detection (shingles + vector similarity)
 * 2. Tags high-similarity pairs with review reason and forces needs_review
 * 3. Persists collusion records
 * 4. Logs append-only audit entry
 */
export async function finalizeAssessment(assessmentId: string): Promise<FinalizeResult> {
  const assessment = await getAssessment(assessmentId);
  if (!assessment) {
    throw new Error(`Assessment ${assessmentId} not found`);
  }

  const submissions = await getSubmissions(assessmentId);

  // Run collusion detection across all cohort submissions
  const pairs = detectCollusion(submissions, {
    question: assessment.question,
    referenceAnswer: assessment.referenceAnswer || "",
  });

  // Save collusion pairs in repo
  await saveCollusionPairs(assessmentId, pairs);

  // If any pairs found, tag affected submissions with COLLUSION reason
  if (pairs.length > 0) {
    const flaggedPseudos = new Set(pairs.flatMap((p) => [p.a, p.b]));

    for (const sub of submissions) {
      if (flaggedPseudos.has(sub.pseudonym) || flaggedPseudos.has(sub.id)) {
        const pairInfo = pairs.find((p) => p.a === sub.pseudonym || p.b === sub.pseudonym);
        const other = pairInfo ? (pairInfo.a === sub.pseudonym ? pairInfo.b : pairInfo.a) : "peer";

        const existingReasons = sub.reviewReasons || [];
        if (!existingReasons.some((r) => r.code === "COLLUSION")) {
          const updated: Submission = {
            ...sub,
            status: "needs_review",
            reviewReasons: [
              ...existingReasons,
              {
                code: "COLLUSION",
                detail: `High lexical similarity (${Math.round((pairInfo?.containment ?? 0.4) * 100)}%) with ${other}. Needs teacher judgement.`,
              },
            ],
            updatedAt: new Date().toISOString(),
          };
          await saveSubmission(updated);
        }
      }
    }
  }

  // Record audit log
  await appendAudit({
    actor: "system",
    action: "assessment.finalized",
    submissionId: undefined,
    detail: `Finalized batch of ${submissions.length} submissions. Flagged ${pairs.length} collusion pair(s).`,
  });

  return {
    assessmentId,
    submissionsCount: submissions.length,
    collusionPairs: pairs,
  };
}
