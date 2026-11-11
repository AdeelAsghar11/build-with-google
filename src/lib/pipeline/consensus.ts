import "server-only";
import { runArbiter, BAND_ORDER } from "./arbiter";
import type { Criterion, GraderVote, CriterionResult, Band } from "../contracts";

interface ResolveConsensusParams {
  criterion: Criterion;
  voteA: GraderVote;
  voteB: GraderVote;
  topics: string[];
  question: string;
  referenceAnswer: string;
  submissionText: string;
  quarantinedSpans?: { text: string }[];
}

/**
 * Resolves consensus between Grader A and Grader B per Architecture §6.6:
 * - A == B -> exact consensus, source: "agree"
 * - |A - B| == 1 -> Arbiter picks one of the two, source: "arbiter"
 * - |A - B| >= 2 -> Arbiter picks within [min, max], source: "arbiter" (flagged for review)
 * - One vote discarded -> single remaining vote stands, source: "single" (forced low confidence)
 * - Both votes discarded -> no AI consensus, source: "none"
 */
export async function resolveConsensus(
  params: ResolveConsensusParams
): Promise<CriterionResult> {
  const {
    criterion,
    voteA,
    voteB,
    topics,
    question,
    referenceAnswer,
    submissionText,
    quarantinedSpans,
  } = params;

  const validA = voteA.status === "ok" || voteA.status === "retried";
  const validB = voteB.status === "ok" || voteB.status === "retried";

  // Case 1: Both votes discarded
  if (!validA && !validB) {
    return {
      criterionId: criterion.id,
      votes: [voteA, voteB],
      source: "none",
    };
  }

  // Case 2: One vote discarded
  if (validA && !validB) {
    return {
      criterionId: criterion.id,
      votes: [
        voteA,
        {
          ...voteB,
          confidence: "low",
        },
      ],
      consensusBand: voteA.band,
      source: "single",
    };
  }

  if (!validA && validB) {
    return {
      criterionId: criterion.id,
      votes: [
        {
          ...voteA,
          confidence: "low",
        },
        voteB,
      ],
      consensusBand: voteB.band,
      source: "single",
    };
  }

  // Case 3: Both votes valid and exact agree
  if (voteA.band === voteB.band) {
    return {
      criterionId: criterion.id,
      votes: [voteA, voteB],
      consensusBand: voteA.band,
      source: "agree",
    };
  }

  // Case 4: Disagreement -> Invoke Arbiter
  const ordA = BAND_ORDER[voteA.band];
  const ordB = BAND_ORDER[voteB.band];
  const minBand: Band = ordA < ordB ? voteA.band : voteB.band;
  const maxBand: Band = ordA < ordB ? voteB.band : voteA.band;

  const arbiterResult = await runArbiter({
    criterion,
    topics,
    question,
    referenceAnswer,
    submissionText,
    voteA,
    voteB,
    minBand,
    maxBand,
    quarantinedSpans,
  });

  return {
    criterionId: criterion.id,
    votes: [voteA, voteB],
    arbiter: {
      band: arbiterResult.band,
      rationale: arbiterResult.rationale,
      model: arbiterResult.model,
    },
    consensusBand: arbiterResult.band,
    source: "arbiter",
  };
}
