import type {
  IngestFlags,
  CriterionResult,
  ReviewReason,
  SubmissionStatus,
} from "../contracts";
import { BAND_ORDER } from "./arbiter";

interface DetermineRouteInput {
  flags: IngestFlags;
  criterionResults: CriterionResult[];
  isAnchor?: boolean;
  isSpotCheck?: boolean;
  collusionFlag?: string;
}

export interface RouteResult {
  status: SubmissionStatus;
  reasons: ReviewReason[];
}

/**
 * Maps all review reasons and determines routing status per Architecture §6.8:
 * - If any reason applies -> "needs_review"
 * - Else -> "graded_clean"
 */
export function determineRoute(input: DetermineRouteInput): RouteResult {
  const { flags, criterionResults, isAnchor, isSpotCheck, collusionFlag } = input;
  const reasons: ReviewReason[] = [];

  // 1. Hidden text
  if (flags.hiddenText && flags.hiddenText.length > 0) {
    reasons.push({
      code: "HIDDEN_TEXT",
      detail: `Hidden text detected (${flags.hiddenText.map((h) => h.reason).join(", ")}).`,
    });
  }

  // 2. Heuristic hits
  if (flags.heuristicHits && flags.heuristicHits.length > 0) {
    reasons.push({
      code: "HEURISTIC",
      detail: `Heuristic injection pattern detected: "${flags.heuristicHits[0].pattern}".`,
    });
  }

  // 3. Guard verdict
  if (flags.guard && flags.guard.verdict !== "clean") {
    reasons.push({
      code: "GUARD",
      detail: `Guard model flagged content with verdict: ${flags.guard.verdict}.`,
    });
  }

  // 4. Quarantined spans
  if (flags.quarantined && flags.quarantined.length > 0) {
    reasons.push({
      code: "QUARANTINE",
      detail: `${flags.quarantined.length} span(s) quarantined from grading.`,
    });
  }

  // 5. Short text
  if (flags.wordCount < 30) {
    reasons.push({
      code: "SHORT_TEXT",
      detail: `Submission is unusually short (${flags.wordCount} words; threshold is 30).`,
    });
  }

  // 6. Parse errors / warnings
  if (flags.parseWarnings && flags.parseWarnings.length > 0) {
    reasons.push({
      code: "PARSE_ERROR",
      detail: `Parsing issue: ${flags.parseWarnings[0]}.`,
    });
  }

  // 7. Criterion-level checks (Canary, Split, Unsupported, Low Confidence)
  for (const cr of criterionResults) {
    const voteA = cr.votes.find((v) => v.grader === "A");
    const voteB = cr.votes.find((v) => v.grader === "B");

    // Canary check
    if (voteA?.manipulationNoticed || voteB?.manipulationNoticed) {
      if (!reasons.some((r) => r.code === "CANARY")) {
        reasons.push({
          code: "CANARY",
          detail: "Grader model self-reported prompt manipulation in student text.",
          criterionId: cr.criterionId,
        });
      }
    }

    // Split check (|A - B| >= 2)
    if (voteA && voteB && voteA.status !== "unsupported" && voteB.status !== "unsupported") {
      const diff = Math.abs(BAND_ORDER[voteA.band] - BAND_ORDER[voteB.band]);
      if (diff >= 2) {
        reasons.push({
          code: "SPLIT",
          detail: `Graders split by ${diff} bands on ${cr.criterionId} (${voteA.band} vs ${voteB.band}).`,
          criterionId: cr.criterionId,
        });
      }
    }

    // Unsupported quotes
    if (voteA?.status === "unsupported" || voteB?.status === "unsupported" || cr.source === "none") {
      reasons.push({
        code: "UNSUPPORTED",
        detail: `Unsupported evidence quotes on ${cr.criterionId}.`,
        criterionId: cr.criterionId,
      });
    }

    // Low confidence
    if (voteA?.confidence === "low" || voteB?.confidence === "low") {
      if (!reasons.some((r) => r.code === "LOW_CONFIDENCE" && r.criterionId === cr.criterionId)) {
        reasons.push({
          code: "LOW_CONFIDENCE",
          detail: `Low confidence judgement on ${cr.criterionId}.`,
          criterionId: cr.criterionId,
        });
      }
    }
  }

  // 8. Collusion flag
  if (collusionFlag) {
    reasons.push({
      code: "COLLUSION",
      detail: collusionFlag,
    });
  }

  // 9. Anchor / Spot check
  if (isAnchor) {
    reasons.push({
      code: "ANCHOR",
      detail: "Selected as blind teacher calibration anchor.",
    });
  }

  if (isSpotCheck) {
    reasons.push({
      code: "SPOT_CHECK",
      detail: "Selected for random spot check audit.",
    });
  }

  const status: SubmissionStatus = reasons.length > 0 ? "needs_review" : "graded_clean";

  return { status, reasons };
}
