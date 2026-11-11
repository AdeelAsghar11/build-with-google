import type { Band, Strictness, CriterionResult, Criterion, GradeBand } from "../contracts";

export const STRICTNESS_TABLE: Record<Strictness, Record<Band, number>> = {
  1: { FULL: 1.0, MOSTLY: 0.9, PARTIAL: 0.7, MINIMAL: 0.4, NONE: 0.0 },
  2: { FULL: 1.0, MOSTLY: 0.85, PARTIAL: 0.6, MINIMAL: 0.3, NONE: 0.0 },
  3: { FULL: 1.0, MOSTLY: 0.8, PARTIAL: 0.5, MINIMAL: 0.2, NONE: 0.0 },
  4: { FULL: 1.0, MOSTLY: 0.7, PARTIAL: 0.4, MINIMAL: 0.1, NONE: 0.0 },
  5: { FULL: 1.0, MOSTLY: 0.6, PARTIAL: 0.3, MINIMAL: 0.0, NONE: 0.0 },
};

export const DEFAULT_GRADE_SCHEME: GradeBand[] = [
  { letter: "A", minPct: 85 },
  { letter: "B", minPct: 70 },
  { letter: "C", minPct: 55 },
  { letter: "D", minPct: 50 },
  { letter: "F", minPct: 0 },
];

export function roundToHalf(num: number): number {
  return Math.round(num * 2) / 2;
}

export function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

export function determineGrade(pct: number, gradeScheme: GradeBand[] = DEFAULT_GRADE_SCHEME): string {
  const sorted = [...gradeScheme].sort((a, b) => b.minPct - a.minPct);
  for (const band of sorted) {
    if (pct >= band.minPct) {
      return band.letter;
    }
  }
  return "F";
}

export interface ScoreOutput {
  results: CriterionResult[];
  totals: {
    ai: number;
    final: number;
    pct: number;
    grade: string;
  };
}

/**
 * Pure scoring function: computes deterministic marks from consensus bands and criteria.
 * Models never output marks directly.
 */
export function score(
  results: CriterionResult[],
  criteria: Criterion[],
  strictness: Strictness = 3,
  calibrationOffsets?: Record<string, number>,
  teacherOverrides?: Record<string, number>
): ScoreOutput {
  const criteriaMap = new Map(criteria.map((c) => [c.id, c]));
  let totalAi = 0;
  let totalFinal = 0;
  let totalMaxMarks = 0;

  const scoredResults: CriterionResult[] = results.map((res) => {
    const criterion = criteriaMap.get(res.criterionId);
    const maxMarks = criterion ? criterion.maxMarks : 0;
    totalMaxMarks += maxMarks;

    const band = res.consensusBand ?? "NONE";
    const fraction = STRICTNESS_TABLE[strictness][band] ?? 0;
    const offset = calibrationOffsets?.[res.criterionId] ?? 0;
    const calibratedFraction = clamp(fraction + offset, 0, 1);
    const aiMarks = roundToHalf(calibratedFraction * maxMarks);
    const teacherOverride = teacherOverrides?.[res.criterionId] ?? res.teacherMarks;
    const finalMarks = teacherOverride !== undefined ? teacherOverride : aiMarks;

    totalAi += aiMarks;
    totalFinal += finalMarks;

    return {
      ...res,
      aiMarks,
      teacherMarks: teacherOverride,
      finalMarks,
    };
  });

  const pct = totalMaxMarks > 0 ? (totalFinal / totalMaxMarks) * 100 : 0;
  const grade = determineGrade(pct);

  return {
    results: scoredResults,
    totals: {
      ai: totalAi,
      final: totalFinal,
      pct: Math.round(pct * 10) / 10,
      grade,
    },
  };
}
