import "server-only";
import { runGuard } from "./guard";
import { gradeCriterion } from "./grade";
import { resolveConsensus } from "./consensus";
import { score } from "./score";
import { determineRoute } from "./route";
import { appendAudit } from "../audit";
import { getAssessment, getCourse, getSubmission, saveSubmission } from "../db/repo";
import type {
  Submission,
  CriterionResult,
} from "../contracts";

export interface GradeSubmissionOptions {
  assessmentId: string;
  submissionId: string;
  force?: boolean;
}

/**
 * Orchestrates full grading workflow for one student submission:
 * 1. Validates approved rubric
 * 2. Runs Guard screener & quarantines flagged spans
 * 3. Runs Grader A & B in parallel per criterion
 * 4. Resolves consensus & invokes Arbiter if split
 * 5. Deterministically calculates marks via pure score()
 * 6. Determines review routing reasons
 * 7. Writes append-only audit log
 */
export async function gradeSubmission(
  options: GradeSubmissionOptions
): Promise<Submission> {
  const { assessmentId, submissionId, force } = options;

  const assessment = await getAssessment(assessmentId);
  if (!assessment) {
    throw new Error(`Assessment ${assessmentId} not found`);
  }

  if (!assessment.rubric || assessment.rubric.status !== "approved") {
    throw new Error("Grading is blocked: Rubric must be compiled and approved by teacher first (Invariant #2).");
  }

  const course = await getCourse(assessment.courseId);
  if (!course) {
    throw new Error(`Course ${assessment.courseId} not found`);
  }

  const submission = await getSubmission(submissionId);
  if (!submission) {
    throw new Error(`Submission ${submissionId} not found`);
  }

  // Idempotency check unless force=true
  if (!force && submission.status !== "queued" && submission.status !== "error" && submission.status !== "processing") {
    return submission;
  }

  // Step 1: Run Guard agent
  const guardResult = await runGuard(
    assessment.question,
    submission.textOriginal,
    submission.flags?.heuristicHits || []
  );

  const updatedFlags = {
    ...submission.flags,
    guard: guardResult.guard,
    quarantined: guardResult.quarantined,
  };

  const textForGrading = guardResult.textForGrading;

  // Step 2: Grade each criterion
  const rawResults: CriterionResult[] = [];
  for (const criterion of assessment.rubric.criteria) {
    const { voteA, voteB } = await gradeCriterion({
      criterion,
      topics: course.topics,
      question: assessment.question,
      referenceAnswer: assessment.referenceAnswer || "",
      submissionText: textForGrading,
      quarantinedSpans: guardResult.quarantined,
    });

    const consensus = await resolveConsensus({
      criterion,
      voteA,
      voteB,
      topics: course.topics,
      question: assessment.question,
      referenceAnswer: assessment.referenceAnswer || "",
      submissionText: textForGrading,
      quarantinedSpans: guardResult.quarantined,
    });

    rawResults.push(consensus);
  }

  // Step 3: Pure deterministic scoring
  const scored = score(
    rawResults,
    assessment.rubric.criteria,
    assessment.strictness,
    assessment.calibration?.offsets
  );

  // Step 4: Route determination
  const routing = determineRoute({
    flags: updatedFlags,
    criterionResults: scored.results,
  });

  const updatedSubmission: Submission = {
    ...submission,
    textForGrading,
    flags: updatedFlags,
    results: scored.results,
    totals: scored.totals,
    status: routing.status,
    reviewReasons: routing.reasons,
    updatedAt: new Date().toISOString(),
  };

  // Step 5: Persist submission
  await saveSubmission(updatedSubmission);

  // Step 6: Append audit log
  await appendAudit({
    actor: "system",
    action: "submission.graded",
    submissionId: submission.id,
    detail: `Submission ${submission.pseudonym} graded. Total AI marks: ${scored.totals.ai}/${assessment.totalMarks} (${scored.totals.grade}), status: ${routing.status}.`,
  });

  return updatedSubmission;
}
