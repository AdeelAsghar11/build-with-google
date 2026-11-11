import "server-only";
import { z } from "zod";
import { callModel } from "../llm/client";
import { verifyEvidenceList } from "./verifyEvidence";
import type { Criterion, GraderVote, Band, EvidenceItem } from "../contracts";

const ArbiterResponseSchema = z.object({
  criterionId: z.string(),
  band: z.enum(["FULL", "MOSTLY", "PARTIAL", "MINIMAL", "NONE"]),
  evidence: z.array(
    z.object({
      quote: z.string(),
      role: z.enum(["meets", "partial", "error"]),
    })
  ),
  rationale: z.string(),
});

type ArbiterRawResponse = z.infer<typeof ArbiterResponseSchema>;

export interface ArbiterResult {
  band: Band;
  rationale: string;
  model: string;
  evidence: EvidenceItem[];
}

export const BAND_ORDER: Record<Band, number> = {
  NONE: 0,
  MINIMAL: 1,
  PARTIAL: 2,
  MOSTLY: 3,
  FULL: 4,
};

export const ORDER_TO_BAND: Band[] = ["NONE", "MINIMAL", "PARTIAL", "MOSTLY", "FULL"];

interface RunArbiterParams {
  criterion: Criterion;
  topics: string[];
  question: string;
  referenceAnswer: string;
  submissionText: string;
  voteA: GraderVote;
  voteB: GraderVote;
  minBand: Band;
  maxBand: Band;
  quarantinedSpans?: { text: string }[];
}

/**
 * Runs Arbiter model to resolve split between Grader A and Grader B.
 * Bound to the range [minBand, maxBand].
 */
export async function runArbiter(params: RunArbiterParams): Promise<ArbiterResult> {
  const {
    criterion,
    topics,
    question,
    referenceAnswer,
    submissionText,
    voteA,
    voteB,
    minBand,
    maxBand,
    quarantinedSpans = [],
  } = params;

  const minOrd = BAND_ORDER[minBand];
  const maxOrd = BAND_ORDER[maxBand];

  const variables: Record<string, string> = {
    TOPICS: topics.join(", "),
    QUESTION: question,
    REFERENCE_ANSWER: referenceAnswer,
    CRITERION_JSON: JSON.stringify(criterion),
    VOTE_A_JSON: JSON.stringify({
      band: voteA.band,
      evidence: voteA.evidence.filter((e) => e.status.startsWith("verified")),
      rationale: voteA.rationale,
    }),
    VOTE_B_JSON: JSON.stringify({
      band: voteB.band,
      evidence: voteB.evidence.filter((e) => e.status.startsWith("verified")),
      rationale: voteB.rationale,
    }),
    MIN_BAND: minBand,
    MAX_BAND: maxBand,
    CRITERION_ID: criterion.id,
    SUBMISSION: submissionText,
  };

  try {
    const res = await callModel<ArbiterRawResponse>({
      role: "arbiter",
      promptId: "arbiter",
      variables,
      schema: ArbiterResponseSchema,
      mockFallback: {
        criterionId: criterion.id,
        band: minBand,
        evidence: [],
        rationale: `Arbiter resolved split between ${minBand} and ${maxBand} choosing ${minBand}.`,
      },
    });

    const raw = res.data;
    const chosenOrd = BAND_ORDER[raw.band as Band];

    // Ensure Arbiter did not choose outside the bounded [min, max] range
    let finalBand = raw.band as Band;
    let finalRationale = raw.rationale;
    if (chosenOrd < minOrd || chosenOrd > maxOrd) {
      console.warn(`Arbiter chose ${raw.band} outside [${minBand}, ${maxBand}], clamping to lower-middle.`);
      const midOrd = Math.floor((minOrd + maxOrd) / 2);
      finalBand = ORDER_TO_BAND[midOrd];
      finalRationale = `Clamped to ${finalBand}: Arbiter suggested band outside allowed range [${minBand}, ${maxBand}].`;
    }

    const verifiedEvidence = verifyEvidenceList(
      raw.evidence.map((e) => ({ ...e, status: "rejected" as const })),
      submissionText,
      quarantinedSpans
    );

    return {
      band: finalBand,
      rationale: finalRationale,
      model: res.model,
      evidence: verifiedEvidence,
    };
  } catch (err) {
    console.error("Arbiter execution error:", err);
    // Fallback: pick lower-middle band in range
    const midOrd = Math.floor((minOrd + maxOrd) / 2);
    const fallbackBand = ORDER_TO_BAND[midOrd];
    return {
      band: fallbackBand,
      rationale: `Arbiter failed. Assigned provisional lower-middle band ${fallbackBand}.`,
      model: "fallback",
      evidence: [],
    };
  }
}
