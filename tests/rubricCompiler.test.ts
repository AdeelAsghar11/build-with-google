import { describe, it, expect, beforeEach } from "vitest";
import fs from "fs";
import path from "path";
import { compileRubric } from "../src/lib/pipeline/rubricCompiler";
import { saveCourse, saveAssessment } from "../src/lib/db/repo";
import { CourseSchema, AssessmentSchema } from "../src/lib/contracts";

describe("Rubric Compiler (M1.3)", () => {
  beforeEach(async () => {
    // Load fixtures into repo
    const courseRaw = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, "../fixtures/course.json"), "utf-8")
    );
    const assessmentRaw = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, "../fixtures/assessment.json"), "utf-8")
    );

    await saveCourse(CourseSchema.parse(courseRaw));
    await saveAssessment(AssessmentSchema.parse(assessmentRaw));
  });

  it("compiles informal rubric into 4 criteria with 5 band descriptors each and draft status", async () => {
    const compiled = await compileRubric("course_ml_101", "assessment_ml_01");

    expect(compiled.status).toBe("draft");
    expect(compiled.criteria.length).toBe(4);
    expect(compiled.version).toBeGreaterThanOrEqual(1);

    const sum = compiled.criteria.reduce((acc, c) => acc + c.maxMarks, 0);
    expect(sum).toBe(20);

    for (const c of compiled.criteria) {
      expect(c.cloId).toMatch(/^CLO-/);
      expect(c.requiredElements.length).toBeGreaterThan(0);
      expect(c.bandDescriptors.FULL).toBeDefined();
      expect(c.bandDescriptors.MOSTLY).toBeDefined();
      expect(c.bandDescriptors.PARTIAL).toBeDefined();
      expect(c.bandDescriptors.MINIMAL).toBeDefined();
      expect(c.bandDescriptors.NONE).toBeDefined();
    }
  });

  it("throws if course or assessment does not exist", async () => {
    await expect(compileRubric("non_existent", "assessment_ml_01")).rejects.toThrow("Course not found");
    await expect(compileRubric("course_ml_101", "non_existent")).rejects.toThrow("Assessment not found");
  });
});
