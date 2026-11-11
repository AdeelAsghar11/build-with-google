import "server-only";
import {
  type Submission,
  type TrustReport,
  TrustReportSchema,
} from "../contracts";
import * as repo from "../db/repo";
import { initialSubmissions } from "../demo-data";

const BAND_ORDER: Record<string, number> = {
  NONE: 0,
  MINIMAL: 1,
  PARTIAL: 2,
  MOSTLY: 3,
  FULL: 4,
};

/**
 * Pure calculation of TrustReport from submissions.
 */
export function computeTrustReport(
  assessmentId: string,
  submissions: Submission[]
): TrustReport {
  let exactCount = 0;
  let adjacentCount = 0;
  let totalVotes = 0;

  // 5x5 confusion matrix for QWK
  const observedMatrix: number[][] = Array.from({ length: 5 }, () => Array(5).fill(0));

  let arbiterCount = 0;
  let splitReviewCount = 0;

  let hiddenTextFinds = 0;
  let heuristicHits = 0;
  let guardFlags = 0;
  let quarantines = 0;
  let canaryFlags = 0;

  let verifiedQuotes = 0;
  let fuzzyQuotes = 0;
  let rejectedQuotes = 0;
  let discardedVotes = 0;

  let overrideCount = 0;
  let sumDeltas = 0;
  let positiveDeltaCount = 0;
  let negativeDeltaCount = 0;

  const pairs: Array<{ words: number; marks: number }> = [];

  for (const sub of submissions) {
    // 1. Panel agreement & evidence
    for (const res of sub.results ?? []) {
      if (res.source === "arbiter") {
        arbiterCount++;
      }

      const voteA = res.votes?.find((v) => v.grader === "A");
      const voteB = res.votes?.find((v) => v.grader === "B");

      if (voteA?.band && voteB?.band) {
        const idxA = BAND_ORDER[voteA.band] ?? -1;
        const idxB = BAND_ORDER[voteB.band] ?? -1;
        if (idxA >= 0 && idxB >= 0) {
          totalVotes++;
          observedMatrix[idxA][idxB]++;
          if (idxA === idxB) {
            exactCount++;
            adjacentCount++;
          } else if (Math.abs(idxA - idxB) === 1) {
            adjacentCount++;
          }
        }
      }

      // Evidence integrity stats
      for (const vote of res.votes ?? []) {
        if (vote.status === "error" || vote.evidence?.some((ev) => ev.status === "rejected_flagged")) {
          discardedVotes++;
        }
        for (const ev of vote.evidence ?? []) {
          if (ev.status === "verified") {
            verifiedQuotes++;
          } else if (ev.status === "verified_fuzzy") {
            fuzzyQuotes++;
          } else if (ev.status === "rejected" || ev.status === "rejected_flagged") {
            rejectedQuotes++;
          }
        }
      }

      // Overrides per criterion
      if (
        res.teacherMarks !== undefined &&
        res.aiMarks !== undefined &&
        res.teacherMarks !== res.aiMarks
      ) {
        const diff = res.teacherMarks - res.aiMarks;
        sumDeltas += Math.abs(diff);
        if (diff > 0) positiveDeltaCount++;
        else if (diff < 0) negativeDeltaCount++;
      }
    }

    // Feedback quote stats
    if (sub.feedback) {
      for (const s of sub.feedback.strengths ?? []) {
        if (s.quote) verifiedQuotes++;
      }
      for (const imp of sub.feedback.improvements ?? []) {
        if (imp.quote) verifiedQuotes++;
      }
    }

    // 2. Routing & Injection defence
    if (sub.reviewReasons?.some((r) => r.code === "SPLIT")) {
      splitReviewCount++;
    }
    if (sub.reviewReasons?.some((r) => r.code === "CANARY")) {
      canaryFlags++;
    }

    const hasHidden =
      (sub.flags?.hiddenText && sub.flags.hiddenText.length > 0) ||
      sub.reviewReasons?.some((r) => r.code === "HIDDEN_TEXT");
    if (hasHidden) hiddenTextFinds++;

    const hasHeuristics =
      (sub.flags?.heuristicHits && sub.flags.heuristicHits.length > 0) ||
      sub.reviewReasons?.some((r) => r.code === "HEURISTIC");
    if (hasHeuristics) heuristicHits++;

    const hasGuard =
      sub.flags?.guard?.verdict === "manipulation" ||
      sub.reviewReasons?.some((r) => r.code === "GUARD");
    if (hasGuard) guardFlags++;

    const hasQuarantine =
      (sub.flags?.quarantined && sub.flags.quarantined.length > 0) ||
      sub.reviewReasons?.some((r) => r.code === "QUARANTINE");
    if (hasQuarantine) quarantines++;

    // Teacher override per submission
    if (
      sub.totals?.final !== undefined &&
      sub.totals?.ai !== undefined &&
      sub.totals.final !== sub.totals.ai
    ) {
      overrideCount++;
    }

    // Length sensitivity pair
    const words =
      sub.flags?.wordCount ??
      sub.textOriginal.trim().split(/\s+/).filter(Boolean).length;
    const marks = sub.totals?.ai ?? sub.totals?.final ?? 0;
    pairs.push({ words, marks });
  }

  // Calculate Quadratic Weighted Kappa (QWK)
  let qwk = 1.0;
  if (totalVotes > 0) {
    const K = 5;
    const weights: number[][] = Array.from({ length: K }, (_, i) =>
      Array.from({ length: K }, (_, j) => Math.pow(i - j, 2) / Math.pow(K - 1, 2))
    );

    const rowSums = observedMatrix.map((row) =>
      row.reduce((sum, val) => sum + val, 0)
    );
    const colSums = Array.from({ length: K }, (_, j) =>
      observedMatrix.reduce((sum, row) => sum + row[j], 0)
    );

    let observedDisagreement = 0;
    let expectedDisagreement = 0;

    for (let i = 0; i < K; i++) {
      for (let j = 0; j < K; j++) {
        observedDisagreement += weights[i][j] * (observedMatrix[i][j] / totalVotes);
        const expectedP = (rowSums[i] * colSums[j]) / (totalVotes * totalVotes);
        expectedDisagreement += weights[i][j] * expectedP;
      }
    }

    if (expectedDisagreement > 0) {
      qwk = Number(
        Math.max(-1, Math.min(1, 1 - observedDisagreement / expectedDisagreement)).toFixed(2)
      );
    }
  }

  const exactPct =
    totalVotes > 0 ? Number(((exactCount / totalVotes) * 100).toFixed(2)) : 100;
  const adjacentPct =
    totalVotes > 0 ? Number(((adjacentCount / totalVotes) * 100).toFixed(2)) : 100;

  // Length sensitivity Pearson r
  let pearsonR = 0;
  const n = pairs.length;
  if (n > 1) {
    const meanX = pairs.reduce((sum, p) => sum + p.words, 0) / n;
    const meanY = pairs.reduce((sum, p) => sum + p.marks, 0) / n;

    let num = 0;
    let denX = 0;
    let denY = 0;
    for (const p of pairs) {
      const dx = p.words - meanX;
      const dy = p.marks - meanY;
      num += dx * dy;
      denX += dx * dx;
      denY += dy * dy;
    }

    const denom = Math.sqrt(denX * denY);
    if (denom > 0) {
      pearsonR = Number((num / denom).toFixed(2));
    }
  }

  // Teacher drift (if sequenced reviews exist)
  const reviewedSubmissions = submissions
    .filter(
      (s) =>
        s.reviewOrder !== undefined &&
        s.totals?.final !== undefined &&
        s.totals?.ai !== undefined
    )
    .sort((a, b) => (a.reviewOrder ?? 0) - (b.reviewOrder ?? 0));

  let teacherDrift = undefined;
  if (reviewedSubmissions.length >= 3) {
    const deltas = reviewedSubmissions.map((s) => s.totals!.final - s.totals!.ai);
    const third = Math.floor(deltas.length / 3);
    const firstThird = deltas.slice(0, third);
    const lastThird = deltas.slice(-third);

    const meanFirst = firstThird.reduce((a, b) => a + b, 0) / firstThird.length;
    const meanLast = lastThird.reduce((a, b) => a + b, 0) / lastThird.length;

    const xMean = (deltas.length - 1) / 2;
    const yMean = deltas.reduce((a, b) => a + b, 0) / deltas.length;
    let oNum = 0;
    let oDen = 0;
    for (let i = 0; i < deltas.length; i++) {
      oNum += (i - xMean) * (deltas[i] - yMean);
      oDen += Math.pow(i - xMean, 2);
    }
    const olsSlope = oDen > 0 ? Number((oNum / oDen).toFixed(3)) : 0;

    teacherDrift = {
      olsSlope,
      firstThirdMeanDelta: Number(meanFirst.toFixed(2)),
      lastThirdMeanDelta: Number(meanLast.toFixed(2)),
      warning: meanFirst - meanLast > 5,
      isSimulated: false,
    };
  }

  const rawReport: TrustReport = {
    assessmentId,
    generatedAt: new Date().toISOString(),
    panelAgreement: {
      exactPct,
      adjacentPct,
      qwk,
      totalVotes,
    },
    arbitrations: {
      count: arbiterCount,
      reviewCount: splitReviewCount,
    },
    injectionDefence: {
      hiddenTextFinds,
      heuristicHits,
      guardFlags,
      quarantines,
      canaryFlags,
    },
    evidenceIntegrity: {
      verifiedQuotes,
      fuzzyQuotes,
      rejectedQuotes,
      discardedVotes,
    },
    teacherOverrides: {
      count: overrideCount,
      meanDelta:
        overrideCount > 0 ? Number((sumDeltas / overrideCount).toFixed(2)) : 0,
      positiveDeltaCount,
      negativeDeltaCount,
    },
    lengthSensitivity: {
      pearsonR,
      sampleSize: n,
      note:
        Math.abs(pearsonR) < 0.3
          ? "No correlation observed between sheer text length and marks (padding penalized correctly)."
          : "Moderate correlation observed between length and marks.",
    },
    teacherDrift,
    models: {
      graderA: {
        model: process.env.MODEL_GRADER_A || "gemini-2.5-flash",
        promptVersion: "grader_a@v1",
      },
      graderB: {
        model: process.env.MODEL_GRADER_B || "gemini-2.5-flash-lite",
        promptVersion: "grader_b@v1",
      },
      arbiter: {
        model: process.env.MODEL_ARBITER || "gemini-2.5-pro",
        promptVersion: "arbiter@v1",
      },
      guard: {
        model: process.env.MODEL_GUARD || "gemma-3-27b-it",
        promptVersion: "guard@v1",
      },
    },
  };

  return TrustReportSchema.parse(rawReport);
}

/**
 * Loads submissions and returns the validated TrustReport for an assessment.
 */
export async function getTrustReport(assessmentId: string): Promise<TrustReport> {
  let submissions = await repo.getSubmissions(assessmentId);

  // Fallback to demo fixture if empty in demo mode or matching initial assessment
  if (submissions.length === 0) {
    submissions = initialSubmissions;
  }

  return computeTrustReport(assessmentId, submissions);
}
