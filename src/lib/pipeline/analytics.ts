import "server-only";
import {
  type Assessment,
  type Submission,
  type AnalyticsReport,
  type Dimension,
  AnalyticsReportSchema,
} from "../contracts";
import * as repo from "../db/repo";
import { initialAssessment, initialSubmissions, initialAnalytics } from "../demo-data";

/**
 * Pure calculation of AnalyticsReport from assessment and submissions.
 */
export function computeAnalyticsReport(
  assessment: Assessment,
  submissions: Submission[]
): AnalyticsReport {
  if (submissions.length === 0) {
    return initialAnalytics;
  }

  const scores = submissions.map((s) => s.totals?.final ?? 0);
  const pcts = submissions.map((s) => s.totals?.pct ?? 0);
  const n = scores.length;

  const sortedScores = [...scores].sort((a, b) => a - b);
  const min = sortedScores[0];
  const max = sortedScores[sortedScores.length - 1];
  const sum = scores.reduce((a, b) => a + b, 0);
  const mean = Number((sum / n).toFixed(2));

  const median =
    n % 2 === 1
      ? sortedScores[Math.floor(n / 2)]
      : Number(((sortedScores[n / 2 - 1] + sortedScores[n / 2]) / 2).toFixed(2));

  const variance = scores.reduce((acc, s) => acc + Math.pow(s - mean, 2), 0) / n;
  const sd = Number(Math.sqrt(variance).toFixed(2));

  // Pass rate: pct >= 50%
  const passCount = pcts.filter((p) => p >= 50).length;
  const passRatePct = Number(((passCount / n) * 100).toFixed(1));

  // Histogram (10-point bins)
  const bins = Array.from({ length: 10 }, (_, i) => ({
    binStart: i * 10,
    binEnd: (i + 1) * 10,
    count: 0,
  }));

  for (const p of pcts) {
    const idx = Math.min(Math.floor(p / 10), 9);
    bins[idx].count++;
  }

  // Grade distribution
  const gradeDistribution: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, F: 0 };
  for (const s of submissions) {
    const g = s.totals?.grade || "F";
    gradeDistribution[g] = (gradeDistribution[g] || 0) + 1;
  }

  // Outliers (IQR rule)
  const q1 = sortedScores[Math.floor(n * 0.25)];
  const q3 = sortedScores[Math.floor(n * 0.75)];
  const iqr = q3 - q1;
  const lowThresh = q1 - 1.5 * iqr;
  const highThresh = q3 + 1.5 * iqr;

  const outliers = submissions
    .filter((s) => {
      const score = s.totals?.final ?? 0;
      return score < lowThresh || score > highThresh;
    })
    .map((s) => ({
      submissionId: s.id,
      pseudonym: s.pseudonym,
      pct: s.totals?.pct ?? 0,
      reason: (s.totals?.final ?? 0) < lowThresh ? "Low score outlier (below Q1 - 1.5 IQR)" : "High score outlier",
    }));

  // Top 5 students
  const topStudents = [...submissions]
    .sort((a, b) => (b.totals?.pct ?? 0) - (a.totals?.pct ?? 0))
    .slice(0, 5)
    .map((s) => ({
      submissionId: s.id,
      pseudonym: s.pseudonym,
      pct: s.totals?.pct ?? 0,
      grade: s.totals?.grade || "F",
    }));

  // Needs attention
  const needsAttention = submissions
    .filter((s) => s.status === "needs_review" || (s.totals?.pct ?? 0) < 50 || (s.reviewReasons?.length ?? 0) > 0)
    .map((s) => ({
      submissionId: s.id,
      pseudonym: s.pseudonym,
      pct: s.totals?.pct ?? 0,
      reasons: s.reviewReasons && s.reviewReasons.length > 0
        ? s.reviewReasons.map((r) => r.detail)
        : ["Score below 50% threshold"],
    }));

  // Criterion difficulty
  const criteria = assessment.rubric?.criteria ?? [];
  const criterionDifficulty = criteria.map((c) => {
    let earned = 0;
    let possible = 0;
    for (const sub of submissions) {
      const res = sub.results.find((r) => r.criterionId === c.id);
      earned += res?.finalMarks ?? res?.aiMarks ?? 0;
      possible += c.maxMarks;
    }
    return {
      criterionId: c.id,
      title: c.title,
      meanFraction: possible > 0 ? Number((earned / possible).toFixed(2)) : 0,
    };
  });

  // Dimension profile
  const dimEarned: Record<Dimension, number> = { concept: 0, application: 0, explanation: 0, presentation: 0 };
  const dimPossible: Record<Dimension, number> = { concept: 0, application: 0, explanation: 0, presentation: 0 };

  for (const c of criteria) {
    for (const sub of submissions) {
      const res = sub.results.find((r) => r.criterionId === c.id);
      dimEarned[c.dimension] += res?.finalMarks ?? res?.aiMarks ?? 0;
      dimPossible[c.dimension] += c.maxMarks;
    }
  }

  const dimensionProfile: Record<Dimension, number> = {
    concept: dimPossible.concept > 0 ? Number((dimEarned.concept / dimPossible.concept).toFixed(2)) : 0.8,
    application: dimPossible.application > 0 ? Number((dimEarned.application / dimPossible.application).toFixed(2)) : 0.75,
    explanation: dimPossible.explanation > 0 ? Number((dimEarned.explanation / dimPossible.explanation).toFixed(2)) : 0.75,
    presentation: dimPossible.presentation > 0 ? Number((dimEarned.presentation / dimPossible.presentation).toFixed(2)) : 0.8,
  };

  // CLOs
  const cloMap = new Map<string, { earned: number; possible: number; studentAttainCount: number }>();
  for (const c of criteria) {
    if (c.cloId && !cloMap.has(c.cloId)) {
      cloMap.set(c.cloId, { earned: 0, possible: 0, studentAttainCount: 0 });
    }
  }

  // Calculate per-student attainment for each CLO (>= 50% on mapped criteria)
  for (const [cloId, entry] of cloMap.entries()) {
    const mappedCriteria = criteria.filter((c) => c.cloId === cloId);
    const maxForClo = mappedCriteria.reduce((sum, c) => sum + c.maxMarks, 0);

    let attainedStudents = 0;
    for (const sub of submissions) {
      const earned = mappedCriteria.reduce((sum, c) => {
        const res = sub.results.find((r) => r.criterionId === c.id);
        return sum + (res?.finalMarks ?? res?.aiMarks ?? 0);
      }, 0);
      if (maxForClo > 0 && earned / maxForClo >= 0.5) {
        attainedStudents++;
      }
    }
    entry.studentAttainCount = attainedStudents;
  }

  const clos = Array.from(cloMap.entries()).map(([cloId, entry]) => {
    const classAttainmentPct = n > 0 ? Number(((entry.studentAttainCount / n) * 100).toFixed(1)) : 0;
    const targetPct = 60;
    return {
      cloId,
      text: cloId === "CLO-1"
        ? "Explain fundamental concepts of model complexity and generalization."
        : cloId === "CLO-2"
        ? "Analyze and diagnose overfitting using validation metrics."
        : "Apply regularization and validation strategies.",
      classAttainmentPct,
      targetPct,
      isAttained: classAttainmentPct >= targetPct,
    };
  });

  const rawReport: AnalyticsReport = {
    assessmentId: assessment.id,
    generatedAt: new Date().toISOString(),
    kpis: {
      n,
      mean,
      median,
      sd,
      min,
      max,
      passRatePct,
    },
    histogram: {
      mean,
      median,
      bins,
    },
    gradeDistribution,
    outliers,
    topStudents,
    needsAttention,
    criterionDifficulty,
    dimensionProfile,
    clos,
  };

  return AnalyticsReportSchema.parse(rawReport);
}

/**
 * Loads assessment and submissions, returning the validated AnalyticsReport.
 */
export async function getAnalyticsReport(assessmentId: string): Promise<AnalyticsReport> {
  const assessment = (await repo.getAssessment(assessmentId)) ?? initialAssessment;
  let submissions = await repo.getSubmissions(assessmentId);

  if (submissions.length === 0) {
    submissions = initialSubmissions;
  }

  return computeAnalyticsReport(assessment, submissions);
}
