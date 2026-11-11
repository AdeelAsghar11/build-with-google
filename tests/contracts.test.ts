import { describe, it, expect } from "vitest";
import {
  BandSchema,
  StrictnessSchema,
  CourseSchema,
  CriterionSchema,
  SubmissionSchema,
  AnalyticsReportSchema,
  TrustReportSchema,
} from "../src/lib/contracts";

describe("Data Contracts (Zod)", () => {
  it("validates Band schema strictly", () => {
    expect(BandSchema.parse("FULL")).toBe("FULL");
    expect(BandSchema.parse("NONE")).toBe("NONE");
    expect(() => BandSchema.parse("AVERAGE")).toThrow();
  });

  it("validates Strictness schema (1-5 only)", () => {
    expect(StrictnessSchema.parse(1)).toBe(1);
    expect(StrictnessSchema.parse(5)).toBe(5);
    expect(() => StrictnessSchema.parse(6)).toThrow();
    expect(() => StrictnessSchema.parse(0)).toThrow();
  });

  it("validates Criterion schema", () => {
    const criterion = {
      id: "C1",
      title: "Overfitting Concept",
      maxMarks: 5,
      cloId: "CLO-1",
      dimension: "concept",
      requiredElements: ["Mentions high training accuracy and low test accuracy"],
      bandDescriptors: {
        FULL: "Complete and precise definition with generalization gap explained.",
        MOSTLY: "Correct definition but lacks technical precision.",
        PARTIAL: "Basic intuition without distinguishing train vs test error.",
        MINIMAL: "Vague or partially incorrect mention.",
        NONE: "Completely incorrect or missing.",
      },
      commonErrors: ["Confusing overfitting with underfitting"],
    };
    expect(CriterionSchema.parse(criterion)).toEqual(criterion);
  });

  it("validates Course schema with default threshold percentages", () => {
    const course = {
      id: "course_1",
      ownerUid: "teacher_1",
      code: "CS401",
      title: "Machine Learning",
      description: "Introductory ML course",
      topics: ["Supervised Learning", "Overfitting", "Regularization"],
      clos: [{ id: "CLO-1", text: "Explain learning paradigms", ploIds: ["PLO-1"] }],
      plos: [{ id: "PLO-1", text: "Engineering Knowledge" }],
      gradeScheme: [{ letter: "A", minPct: 85 }],
      createdAt: new Date().toISOString(),
    };
    const parsed = CourseSchema.parse(course);
    expect(parsed.cloStudentThresholdPct).toBe(50);
    expect(parsed.cloClassTargetPct).toBe(60);
  });

  it("validates AnalyticsReport schema", () => {
    const analytics = {
      assessmentId: "a1",
      generatedAt: new Date().toISOString(),
      kpis: {
        n: 12,
        mean: 72.5,
        median: 75.0,
        sd: 14.2,
        min: 35.0,
        max: 95.0,
        passRatePct: 83.3,
      },
      histogram: {
        mean: 72.5,
        median: 75.0,
        bins: [{ binStart: 70, binEnd: 80, count: 4 }],
      },
      gradeDistribution: { A: 3, B: 5, C: 2, D: 0, F: 2 },
      outliers: [],
      topStudents: [{ submissionId: "s1", pseudonym: "S-01", pct: 95.0, grade: "A" }],
      needsAttention: [{ submissionId: "s12", pseudonym: "S-12", pct: 35.0, reasons: ["Failed minimum passing score"] }],
      criterionDifficulty: [{ criterionId: "C1", title: "Concept", meanFraction: 0.8 }],
      dimensionProfile: { concept: 0.8, application: 0.7, explanation: 0.75, presentation: 0.9 },
      clos: [{ cloId: "CLO-1", text: "Explain concepts", classAttainmentPct: 75, targetPct: 60, isAttained: true }],
    };
    expect(AnalyticsReportSchema.parse(analytics)).toBeTruthy();
  });

  it("validates TrustReport schema", () => {
    const trust = {
      assessmentId: "a1",
      generatedAt: new Date().toISOString(),
      panelAgreement: { exactPct: 82.5, adjacentPct: 97.5, qwk: 0.88, totalVotes: 48 },
      arbitrations: { count: 3, reviewCount: 1 },
      injectionDefence: { hiddenTextFinds: 1, heuristicHits: 1, guardFlags: 1, quarantines: 1, canaryFlags: 0 },
      evidenceIntegrity: { verifiedQuotes: 45, fuzzyQuotes: 2, rejectedQuotes: 1, discardedVotes: 0 },
      teacherOverrides: { count: 1, meanDelta: 1.5, positiveDeltaCount: 1, negativeDeltaCount: 0 },
      lengthSensitivity: { pearsonR: 0.12, sampleSize: 12, note: "Low correlation between word count and marks." },
      models: {
        graderA: { model: "gemini-2.5-flash", promptVersion: "grader_a@v1" },
        graderB: { model: "gemini-2.5-flash-lite", promptVersion: "grader_b@v1" },
      },
    };
    expect(TrustReportSchema.parse(trust)).toBeTruthy();
  });

  it("validates Submission schema with flags and results", () => {
    const submission = {
      id: "sub_1",
      assessmentId: "a1",
      pseudonym: "S-01",
      fileName: "S01.txt",
      textOriginal: "Original student answer text.",
      textForGrading: "Sanitized student answer text.",
      flags: {
        removedChars: [],
        hiddenText: [],
        heuristicHits: [],
        quarantined: [],
        wordCount: 120,
        parseWarnings: [],
      },
      status: "graded_clean",
      reviewReasons: [],
      results: [],
      rubricVersion: 1,
      updatedAt: new Date().toISOString(),
    };
    expect(SubmissionSchema.parse(submission)).toBeTruthy();
  });
});
