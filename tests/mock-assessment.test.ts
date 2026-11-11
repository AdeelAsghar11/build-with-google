import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import {
  AssessmentSchema,
  SubmissionSchema,
  CollusionPairSchema,
  AnalyticsReportSchema,
  TrustReportSchema,
  type Submission,
} from "../src/lib/contracts";

describe("Mock Graded Assessment Fixture Validation (M0.8)", () => {
  const filePath = path.resolve(__dirname, "../fixtures/mock-graded-assessment.json");

  it("exists and is valid JSON", () => {
    expect(fs.existsSync(filePath)).toBe(true);
  });

  const raw = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  it("validates assessment against AssessmentSchema", () => {
    const assessment = AssessmentSchema.parse(raw.assessment);
    expect(assessment.id).toBe("assessment_ml_01");
    expect(assessment.totalMarks).toBe(20);
  });

  it("validates all 12 submissions against SubmissionSchema", () => {
    expect(raw.submissions.length).toBe(12);
    for (const sub of raw.submissions) {
      expect(() => SubmissionSchema.parse(sub)).not.toThrow();
    }
  });

  it("verifies planted cases in mock data", () => {
    const submissions: Submission[] = raw.submissions.map((s: unknown) => SubmissionSchema.parse(s));
    const s07 = submissions.find((s: Submission) => s.fileName === "S07.txt")!;
    const s08 = submissions.find((s: Submission) => s.fileName === "S08.txt")!;
    const s09 = submissions.find((s: Submission) => s.fileName === "S09.txt")!;
    const s10 = submissions.find((s: Submission) => s.fileName === "S10.txt")!;
    const s11 = submissions.find((s: Submission) => s.fileName === "S11.txt")!;
    const s12 = submissions.find((s: Submission) => s.fileName === "S12.txt")!;

    // S07 has hidden text
    expect(s07.flags.hiddenText.length).toBeGreaterThan(0);
    expect(s07.status).toBe("needs_review");

    // S08 has prompt injection caught
    expect(s08.flags.heuristicHits.length).toBeGreaterThan(0);
    expect(s08.flags.guard?.verdict).toBe("manipulation");
    expect(s08.flags.quarantined.length).toBeGreaterThan(0);
    expect(s08.status).toBe("needs_review");

    // S09 & S10 have collusion flags
    expect(s09.status).toBe("needs_review");
    expect(s10.status).toBe("needs_review");

    // S11 has low score despite length
    expect(s11.totals?.pct).toBeLessThan(30);

    // S12 has split requiring review
    expect(s12.status).toBe("needs_review");
    const splitReason = s12.reviewReasons.find((r: { code: string }) => r.code === "SPLIT");
    expect(splitReason).toBeDefined();
  });

  it("validates collusionPairs, analytics, and trust against their schemas", () => {
    expect(raw.collusionPairs.length).toBe(1);
    expect(CollusionPairSchema.parse(raw.collusionPairs[0])).toBeTruthy();
    expect(AnalyticsReportSchema.parse(raw.analytics)).toBeTruthy();
    expect(TrustReportSchema.parse(raw.trust)).toBeTruthy();
  });
});
