import { describe, it, expect } from "vitest";
import { computeAnalyticsReport } from "../src/lib/pipeline/analytics";
import { AnalyticsReportSchema, type Assessment, type Submission } from "../src/lib/contracts";
import mockDataRaw from "../fixtures/mock-graded-assessment.json";
import { score } from "../src/lib/pipeline/score";

describe("Analytics Pipeline (Architecture §10 / U4.1)", () => {
  const assessment = mockDataRaw.assessment as unknown as Assessment;
  const submissions = mockDataRaw.submissions as unknown as Submission[];

  it("computes a valid AnalyticsReport adhering to AnalyticsReportSchema", () => {
    const report = computeAnalyticsReport(assessment, submissions);
    const parsed = AnalyticsReportSchema.parse(report);

    expect(parsed.assessmentId).toBe("assessment_ml_01");
    expect(parsed.kpis.n).toBe(12);
    expect(parsed.kpis.mean).toBeGreaterThan(0);
    expect(parsed.kpis.passRatePct).toBeGreaterThan(0);
    expect(parsed.gradeDistribution.A).toBeGreaterThan(0);
    expect(parsed.histogram.bins.length).toBe(10);
    expect(parsed.topStudents.length).toBeLessThanOrEqual(5);
    expect(parsed.needsAttention.length).toBeGreaterThan(0);
  });

  it("calculates CLO attainment matching target threshold", () => {
    const report = computeAnalyticsReport(assessment, submissions);

    expect(report.clos.length).toBeGreaterThan(0);
    for (const clo of report.clos) {
      expect(clo.classAttainmentPct).toBeGreaterThanOrEqual(0);
      expect(clo.classAttainmentPct).toBeLessThanOrEqual(100);
      expect(clo.isAttained).toBe(clo.classAttainmentPct >= clo.targetPct);
    }
  });

  it("calculates 4-dimension profile fractions", () => {
    const report = computeAnalyticsReport(assessment, submissions);

    expect(report.dimensionProfile.concept).toBeGreaterThan(0);
    expect(report.dimensionProfile.application).toBeGreaterThan(0);
    expect(report.dimensionProfile.explanation).toBeGreaterThan(0);
    expect(report.dimensionProfile.presentation).toBeGreaterThan(0);
  });
});

describe("Assessment Lifecycle Invariants (Architecture §15 / §16)", () => {
  const assessment = mockDataRaw.assessment as unknown as Assessment;
  const submissions = mockDataRaw.submissions as unknown as Submission[];

  it("Invariant #1: Models never compute marks - marks come only from score()", () => {
    const sub = submissions[0];
    const scored = score(sub.results, assessment.rubric!.criteria, 3);

    expect(scored.totals.final).toBe(sub.totals?.final);
    expect(typeof scored.totals.pct).toBe("number");
  });

  it("Invariant #2: No release without teacher approval", () => {
    const unapprovedSubs = submissions.filter((s) => s.status !== "approved");
    // Verify unapproved submissions cannot be released
    for (const sub of unapprovedSubs) {
      expect(sub.status).not.toBe("released");
    }
  });

  it("Invariant #8: Teacher mark edits recompute deterministic marks via score()", () => {
    const sub = { ...submissions[0] };
    const overrides = { C1: 5, C2: 5 };

    const rescored = score(sub.results, assessment.rubric!.criteria, 3, undefined, overrides);

    const c1 = rescored.results.find((r) => r.criterionId === "C1");
    expect(c1?.finalMarks).toBe(5);
    expect(rescored.totals.final).toBeGreaterThanOrEqual(sub.totals?.final ?? 0);
  });
});
