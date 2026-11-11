import { describe, it, expect } from "vitest";
import { detectCollusion } from "../src/lib/pipeline/collusion";
import { initialSubmissions, initialAssessment } from "../src/lib/demo-data";

describe("Collusion Detector (Architecture §9)", () => {
  it("flags S-09 and S-10 as a high-similarity pair", () => {
    const pairs = detectCollusion(initialSubmissions, {
      question: initialAssessment.question,
      referenceAnswer: initialAssessment.referenceAnswer,
    });

    expect(pairs.length).toBeGreaterThanOrEqual(1);

    const s09s10 = pairs.find(
      (p) => (p.a === "S-09" && p.b === "S-10") || (p.a === "S-10" && p.b === "S-09")
    );

    expect(s09s10).toBeDefined();
    expect(s09s10?.level).toBe("high");
    expect(s09s10?.containment).toBeGreaterThanOrEqual(0.08);
    expect(s09s10?.sharedPassages.length).toBeGreaterThan(0);
  });

  it("does not flag clean distinct submissions like S-01 vs S-02", () => {
    const pairs = detectCollusion(initialSubmissions, {
      question: initialAssessment.question,
      referenceAnswer: initialAssessment.referenceAnswer,
    });

    const cleanPair = pairs.find(
      (p) => (p.a === "S-01" && p.b === "S-02") || (p.a === "S-02" && p.b === "S-01")
    );

    expect(cleanPair).toBeUndefined();
  });
});
