import "server-only";
import { z } from "zod";
import { callModel } from "../llm/client";
import { verifyQuote } from "./verifyEvidence";
import { appendAudit } from "../audit";
import { getAssessment, getCourse, getSubmission, saveSubmission } from "../db/repo";
import type {
  Feedback,
  Submission,
  Assessment,
  Course,
  Criterion,
  CriterionResult,
} from "../contracts";

const FeedbackRawResponseSchema = z.object({
  strengths: z.array(
    z.object({
      criterionId: z.string(),
      text: z.string(),
      quote: z.string().nullable().optional(),
    })
  ),
  improvements: z.array(
    z.object({
      criterionId: z.string(),
      text: z.string(),
      quote: z.string().nullable().optional(),
    })
  ),
  dimensionNotes: z
    .object({
      concept: z.string().optional(),
      application: z.string().optional(),
      explanation: z.string().optional(),
      presentation: z.string().optional(),
    })
    .optional(),
  nextSteps: z.array(z.string()),
});

type FeedbackRawResponse = z.infer<typeof FeedbackRawResponseSchema>;

/**
 * Computes dimension qualitative summary without outputting numbers.
 */
function computeDimensionSummary(criteria: Criterion[], results: CriterionResult[]) {
  const summary: Record<string, string> = {};
  for (const c of criteria) {
    const res = results.find((r) => r.criterionId === c.id);
    const band = res?.consensusBand || "PARTIAL";
    summary[c.dimension] = `Demonstrates ${band.toLowerCase()} attainment on ${c.title}.`;
  }
  return summary;
}

/**
 * Computes CLO attainment status without exposing numerical marks to the writer model.
 */
function computeCloStatus(course: Course, criteria: Criterion[], results: CriterionResult[]) {
  const cloMap: Record<string, { title: string; status: "attained" | "developing" }> = {};
  for (const clo of course.clos) {
    const linkedCriteria = criteria.filter((c) => c.cloId === clo.id);
    const hasMostlyOrFull = linkedCriteria.some((c) => {
      const res = results.find((r) => r.criterionId === c.id);
      return res?.consensusBand === "FULL" || res?.consensusBand === "MOSTLY";
    });
    cloMap[clo.id] = {
      title: clo.text,
      status: hasMostlyOrFull ? "attained" : "developing",
    };
  }
  return cloMap;
}

interface GenerateFeedbackParams {
  assessment: Assessment;
  course: Course;
  submission: Submission;
  language?: "en" | "ur";
}

/**
 * Generates verified qualitative feedback record for a student:
 * - Evidence quotes must be verbatim and non-quarantined
 * - No marks or scores in text (Invariant #1, Architecture §6.9)
 * - 3 actionable next steps
 */
export async function generateFeedback(params: GenerateFeedbackParams): Promise<Feedback> {
  const { assessment, course, submission, language = "en" } = params;
  const criteria = assessment.rubric?.criteria || [];
  const results = submission.results || [];

  const dimensionSummary = computeDimensionSummary(criteria, results);
  const cloStatus = computeCloStatus(course, criteria, results);

  // Filter only verified quotes for prompt input
  const resultsForPrompt = results.map((r) => {
    const crit = criteria.find((c) => c.id === r.criterionId);
    const verifiedQuotes = r.votes
      .flatMap((v) => v.evidence)
      .filter((e) => e.status === "verified" || e.status === "verified_fuzzy")
      .map((e) => e.quote);

    return {
      id: r.criterionId,
      title: crit?.title || r.criterionId,
      dimension: crit?.dimension || "concept",
      cloId: crit?.cloId || "CLO-1",
      finalBand: r.consensusBand || "PARTIAL",
      verifiedQuotes: Array.from(new Set(verifiedQuotes)),
      missing: r.votes.flatMap((v) => v.missing),
      rationale: r.votes.map((v) => v.rationale).join("; "),
    };
  });

  const variables: Record<string, string> = {
    LANGUAGE: language,
    QUESTION: assessment.question,
    RESULTS_JSON: JSON.stringify(resultsForPrompt),
    DIMENSION_SUMMARY_JSON: JSON.stringify(dimensionSummary),
    CLO_STATUS_JSON: JSON.stringify(cloStatus),
  };

  // Mock fallback for test/offline fixture mode
  const firstVerifiedQuote = resultsForPrompt[0]?.verifiedQuotes[0] || undefined;
  const mockFallback: FeedbackRawResponse = {
    strengths: [
      {
        criterionId: criteria[0]?.id || "C1",
        text: "You clearly articulated the core principles of the concept.",
        quote: firstVerifiedQuote,
      },
    ],
    improvements: [
      {
        criterionId: criteria[1]?.id || "C2",
        text: "Deepen the explanation with concrete examples and trade-offs.",
        quote: null,
      },
    ],
    dimensionNotes: {
      concept: "Strong theoretical understanding.",
      application: "Practice applying regularization loss terms to practical datasets.",
    },
    nextSteps: [
      "Review the mathematical formulation of loss curves and validation divergence.",
      "Contrast L1 sparsity penalties with L2 shrinkage norms.",
      "Experiment with patience hyperparameters in cross-validation.",
    ],
  };

  const res = await callModel<FeedbackRawResponse>({
    role: "feedback",
    promptId: "feedback",
    variables,
    schema: FeedbackRawResponseSchema,
    mockFallback,
  });

  const raw = res.data;

  // Re-verify all quotes in strengths and improvements against student text
  const cleanedStrengths = raw.strengths.map((s) => {
    let verifiedQuote: string | undefined = undefined;
    if (s.quote && s.quote.trim()) {
      const status = verifyQuote(s.quote, submission.textOriginal, submission.flags?.quarantined || []);
      if (status === "verified" || status === "verified_fuzzy") {
        verifiedQuote = s.quote;
      }
    }
    return {
      criterionId: s.criterionId,
      text: s.text,
      quote: verifiedQuote,
    };
  });

  const cleanedImprovements = raw.improvements.map((imp) => {
    let verifiedQuote: string | undefined = undefined;
    if (imp.quote && imp.quote.trim()) {
      const status = verifyQuote(imp.quote, submission.textOriginal, submission.flags?.quarantined || []);
      if (status === "verified" || status === "verified_fuzzy") {
        verifiedQuote = imp.quote;
      }
    }
    return {
      criterionId: imp.criterionId,
      text: imp.text,
      quote: verifiedQuote,
    };
  });

  // Ensure exactly 3 next steps
  const steps = raw.nextSteps.filter((s) => typeof s === "string" && s.trim().length > 0);
  while (steps.length < 3) {
    steps.push("Consult the course reading material on regularized learning.");
  }
  const finalNextSteps = steps.slice(0, 3);

  return {
    language,
    strengths: cleanedStrengths,
    improvements: cleanedImprovements,
    dimensionNotes: raw.dimensionNotes,
    nextSteps: finalNextSteps,
    model: res.model,
    promptVersion: res.promptVersion,
  };
}

/**
 * Regenerates feedback on teacher mark change or on demand.
 */
export async function regenerateFeedback(
  submissionId: string,
  language: "en" | "ur" = "en"
): Promise<Submission> {
  const submission = await getSubmission(submissionId);
  if (!submission) {
    throw new Error(`Submission ${submissionId} not found`);
  }

  const assessment = await getAssessment(submission.assessmentId);
  if (!assessment) {
    throw new Error(`Assessment ${submission.assessmentId} not found`);
  }

  const course = await getCourse(assessment.courseId);
  if (!course) {
    throw new Error(`Course ${assessment.courseId} not found`);
  }

  const feedback = await generateFeedback({
    assessment,
    course,
    submission,
    language,
  });

  const updated: Submission = {
    ...submission,
    feedback,
    updatedAt: new Date().toISOString(),
  };

  await saveSubmission(updated);

  await appendAudit({
    actor: "system",
    action: "feedback.regenerated",
    submissionId: submission.id,
    detail: `Feedback regenerated in ${language} with ${feedback.strengths.length} strengths, ${feedback.improvements.length} improvements, and 3 next steps.`,
  });

  return updated;
}
