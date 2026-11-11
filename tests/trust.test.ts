import { describe, it, expect } from "vitest";
import { computeTrustReport } from "../src/lib/pipeline/trust";
import { TrustReportSchema, type Submission, type Criterion } from "../src/lib/contracts";
import mockDataRaw from "../fixtures/mock-graded-assessment.json";
import { sanitize } from "../src/lib/ingest/sanitize";
import { score } from "../src/lib/pipeline/score";

describe("Trust Report Generator (Architecture §12 / M7.1)", () => {
  const submissions = mockDataRaw.submissions as unknown as Submission[];

  it("computes a valid TrustReport conforming to TrustReportSchema", () => {
    const report = computeTrustReport("assessment_ml_01", submissions);
    const parsed = TrustReportSchema.parse(report);

    expect(parsed.assessmentId).toBe("assessment_ml_01");
    expect(parsed.panelAgreement.totalVotes).toBeGreaterThan(0);
    expect(parsed.panelAgreement.exactPct).toBeGreaterThanOrEqual(0);
    expect(parsed.panelAgreement.exactPct).toBeLessThanOrEqual(100);
    expect(parsed.panelAgreement.adjacentPct).toBeGreaterThanOrEqual(parsed.panelAgreement.exactPct);
    expect(parsed.panelAgreement.qwk).toBeGreaterThan(0.5);
  });

  it("accurately counts security and injection defense mitigations", () => {
    const report = computeTrustReport("assessment_ml_01", submissions);

    expect(report.injectionDefence.hiddenTextFinds).toBeGreaterThanOrEqual(1);
    expect(report.injectionDefence.heuristicHits).toBeGreaterThanOrEqual(1);
    expect(report.injectionDefence.guardFlags).toBeGreaterThanOrEqual(1);
    expect(report.injectionDefence.quarantines).toBeGreaterThanOrEqual(1);
  });

  it("computes length-score Pearson r showing near-zero sensitivity to padding", () => {
    const report = computeTrustReport("assessment_ml_01", submissions);

    expect(report.lengthSensitivity.sampleSize).toBe(12);
    expect(Math.abs(report.lengthSensitivity.pearsonR)).toBeLessThan(0.3);
  });

  it("accurately tracks evidence integrity quotes", () => {
    const report = computeTrustReport("assessment_ml_01", submissions);

    expect(report.evidenceIntegrity.verifiedQuotes).toBeGreaterThan(0);
  });
});

describe("Invariance Tests (Architecture §12 / M7.2)", () => {
  const assessment = mockDataRaw.assessment;
  const criteria: Criterion[] = assessment.rubric.criteria as unknown as Criterion[];

  it("proves whitespace invariance: adding whitespace leaves score unchanged", () => {
    const cleanText = "Overfitting happens when a model learns noise rather than underlying patterns.";
    const paddedWhitespace = `\n\n\n   ${cleanText}   \n\n\t\t\n`;

    const cleanSanitized = sanitize(cleanText);
    const paddedSanitized = sanitize(paddedWhitespace);

    expect(cleanSanitized.sanitizedText).toBe(paddedSanitized.sanitizedText);
  });

  it("proves padding resilience: sheer word padding without evidence does not inflate marks", () => {
    const submissions = mockDataRaw.submissions as unknown as Submission[];
    const s01Clean = submissions.find((s) => s.fileName === "S01.txt")!;
    const s11Padded = submissions.find((s) => s.fileName === "S11.txt")!;

    // S11 has repetitive padding but lacks required evidence
    const wordsS01 = s01Clean.textOriginal.split(/\s+/).length;
    const wordsS11 = s11Padded.textOriginal.split(/\s+/).length;

    expect(wordsS11).toBeGreaterThan(wordsS01 * 2);
    // S11 must score far lower than S01 despite word count
    expect(s11Padded.totals?.final).toBeLessThan(s01Clean.totals?.final ?? 20);
    expect(s11Padded.totals?.pct).toBeLessThan(35);
  });

  it("proves strictness monotonicity: higher strictness never increases marks", () => {
    const submissions = mockDataRaw.submissions as unknown as Submission[];
    const cleanSub = submissions.find((s) => s.fileName === "S01.txt")!;

    const scoreStrict3 = score(cleanSub.results, criteria, 3);
    const scoreStrict4 = score(cleanSub.results, criteria, 4);
    const scoreStrict5 = score(cleanSub.results, criteria, 5);

    expect(scoreStrict3.totals.final).toBeGreaterThanOrEqual(scoreStrict4.totals.final);
    expect(scoreStrict4.totals.final).toBeGreaterThanOrEqual(scoreStrict5.totals.final);
  });
});
