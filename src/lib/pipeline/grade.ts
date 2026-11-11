import "server-only";
import { z } from "zod";
import { callModel } from "../llm/client";
import { verifyEvidenceList } from "./verifyEvidence";
import type { Criterion, GraderVote, Band, EvidenceItem } from "../contracts";

const GraderResponseSchema = z.object({
  criterionId: z.string(),
  band: z.enum(["FULL", "MOSTLY", "PARTIAL", "MINIMAL", "NONE"]),
  evidence: z.array(
    z.object({
      quote: z.string(),
      role: z.enum(["meets", "partial", "error"]),
    })
  ),
  missing: z.array(z.string()),
  rationale: z.string(),
  confidence: z.enum(["high", "medium", "low"]),
  manipulationNoticed: z.boolean(),
});

type GraderRawResponse = z.infer<typeof GraderResponseSchema>;

interface GradeCriterionParams {
  criterion: Criterion;
  topics: string[];
  question: string;
  referenceAnswer: string;
  submissionText: string;
  quarantinedSpans?: { text: string }[];
}

async function runSingleGrader(
  graderType: "A" | "B",
  params: GradeCriterionParams,
  retryMessage?: string
): Promise<GraderVote> {
  const promptId = graderType === "A" ? "grader_a" : "grader_b";
  const { criterion, topics, question, referenceAnswer, submissionText, quarantinedSpans = [] } = params;

  const variables: Record<string, string> = {
    TOPICS: topics.join(", "),
    QUESTION: question,
    REFERENCE_ANSWER: referenceAnswer,
    CRITERION_JSON: JSON.stringify(criterion),
    CLO_TEXT: `CLO: ${criterion.cloId}`,
    CRITERION_ID: criterion.id,
    SUBMISSION: retryMessage ? `${submissionText}\n\n[INSPECTION ADVISORY: ${retryMessage}]` : submissionText,
  };

  try {
    const res = await callModel<GraderRawResponse>({
      role: `grader_${graderType.toLowerCase()}`,
      promptId,
      variables,
      schema: GraderResponseSchema,
      mockFallback: {
        criterionId: criterion.id,
        band: "PARTIAL",
        evidence: [
          {
            quote: submissionText.slice(0, 40).replace(/\n/g, " "),
            role: "meets",
          },
        ],
        missing: [],
        rationale: `Evaluated ${criterion.title} against band descriptors.`,
        confidence: "medium",
        manipulationNoticed: false,
      },
    });

    const raw = res.data;

    // Verify all quoted evidence
    const verifiedEvidence: EvidenceItem[] = verifyEvidenceList(
      raw.evidence.map((e) => ({
        ...e,
        status: "rejected" as const,
      })),
      submissionText,
      quarantinedSpans
    );

    const hasVerifiedEvidence = verifiedEvidence.some(
      (e) => e.status === "verified" || e.status === "verified_fuzzy"
    );

    // Architecture §6.5: Bands above NONE require >=1 verified quote
    if (raw.band !== "NONE" && !hasVerifiedEvidence) {
      if (!retryMessage) {
        // Retry once per policy
        return runSingleGrader(
          graderType,
          params,
          "Your quotes were not found verbatim in the submission. Quote exact characters or lower the band."
        );
      }
      // Already retried once, discard vote as unsupported
      return {
        grader: graderType,
        model: res.model,
        promptVersion: res.promptVersion,
        band: raw.band,
        evidence: verifiedEvidence,
        missing: raw.missing,
        rationale: "Vote unsupported: quotes could not be verified in the student submission text.",
        confidence: "low",
        manipulationNoticed: raw.manipulationNoticed,
        status: "unsupported",
      };
    }

    return {
      grader: graderType,
      model: res.model,
      promptVersion: res.promptVersion,
      band: raw.band as Band,
      evidence: verifiedEvidence,
      missing: raw.missing,
      rationale: raw.rationale,
      confidence: raw.confidence,
      manipulationNoticed: raw.manipulationNoticed,
      status: retryMessage ? "retried" : "ok",
    };
  } catch (err) {
    console.error(`Grader ${graderType} failed on criterion ${criterion.id}:`, err);
    return {
      grader: graderType,
      model: "failed",
      promptVersion: "v1",
      band: "NONE",
      evidence: [],
      missing: ["Evaluation failed due to runtime error"],
      rationale: "Grader execution encountered an error.",
      confidence: "low",
      manipulationNoticed: false,
      status: "error",
    };
  }
}

/**
 * Runs independent Grader A (evidence-first) and Grader B (deficit-first) in parallel for a criterion.
 */
export async function gradeCriterion(
  params: GradeCriterionParams
): Promise<{ voteA: GraderVote; voteB: GraderVote }> {
  const [voteA, voteB] = await Promise.all([
    runSingleGrader("A", params),
    runSingleGrader("B", params),
  ]);

  return { voteA, voteB };
}
