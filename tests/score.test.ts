import { describe, it, expect } from "vitest";
import { score, roundToHalf } from "../src/lib/pipeline/score";
import type { Criterion, CriterionResult } from "../src/lib/contracts";

describe("score() pure function", () => {
  const mockCriteria: Criterion[] = [
    {
      id: "C1",
      title: "Concept",
      maxMarks: 10,
      cloId: "CLO1",
      dimension: "concept",
      requiredElements: ["element1"],
      bandDescriptors: { FULL: "desc", MOSTLY: "desc", PARTIAL: "desc", MINIMAL: "desc", NONE: "desc" },
      commonErrors: [],
    },
    {
      id: "C2",
      title: "Application",
      maxMarks: 10,
      cloId: "CLO2",
      dimension: "application",
      requiredElements: ["element2"],
      bandDescriptors: { FULL: "desc", MOSTLY: "desc", PARTIAL: "desc", MINIMAL: "desc", NONE: "desc" },
      commonErrors: [],
    },
  ];

  const mockResults: CriterionResult[] = [
    {
      criterionId: "C1",
      votes: [],
      consensusBand: "FULL",
      source: "agree",
    },
    {
      criterionId: "C2",
      votes: [],
      consensusBand: "PARTIAL",
      source: "agree",
    },
  ];

  it("calculates marks deterministically with strictness 3 (balanced)", () => {
    const scored = score(mockResults, mockCriteria, 3);
    // C1: FULL = 1.0 * 10 = 10
    // C2: PARTIAL = 0.5 * 10 = 5
    // Total = 15 / 20 = 75% -> Grade B
    expect(scored.totals.ai).toBe(15);
    expect(scored.totals.final).toBe(15);
    expect(scored.totals.pct).toBe(75);
    expect(scored.totals.grade).toBe("B");
  });

  it("changes partial credit when strictness changes from 3 to 5", () => {
    const balanced = score(mockResults, mockCriteria, 3);
    const strict = score(mockResults, mockCriteria, 5);

    // FULL is still 10 on both
    expect(balanced.results[0].aiMarks).toBe(10);
    expect(strict.results[0].aiMarks).toBe(10);

    // PARTIAL drops from 5 (0.5) to 3 (0.3)
    expect(balanced.results[1].aiMarks).toBe(5);
    expect(strict.results[1].aiMarks).toBe(3);
    expect(strict.totals.final).toBe(13);
  });

  it("respects teacher override over AI marks", () => {
    const scored = score(mockResults, mockCriteria, 3, undefined, { C2: 8 });
    expect(scored.results[1].finalMarks).toBe(8);
    expect(scored.totals.final).toBe(18); // 10 + 8 = 18
  });

  it("roundToHalf handles fractional rounding correctly", () => {
    expect(roundToHalf(4.25)).toBe(4.5);
    expect(roundToHalf(4.24)).toBe(4);
    expect(roundToHalf(4.76)).toBe(5);
  });
});
