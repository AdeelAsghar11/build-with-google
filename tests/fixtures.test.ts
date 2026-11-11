import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { CourseSchema, AssessmentSchema } from "../src/lib/contracts";

describe("Fixtures Validation", () => {
  it("validates fixtures/course.json against CourseSchema", () => {
    const coursePath = path.resolve(__dirname, "../fixtures/course.json");
    expect(fs.existsSync(coursePath)).toBe(true);
    const raw = fs.readFileSync(coursePath, "utf-8");
    const json = JSON.parse(raw);
    const parsed = CourseSchema.parse(json);
    expect(parsed.id).toBe("course_ml_101");
    expect(parsed.clos.length).toBe(3);
    expect(parsed.plos.length).toBe(2);
  });

  it("validates fixtures/assessment.json against AssessmentSchema", () => {
    const assessmentPath = path.resolve(__dirname, "../fixtures/assessment.json");
    expect(fs.existsSync(assessmentPath)).toBe(true);
    const raw = fs.readFileSync(assessmentPath, "utf-8");
    const json = JSON.parse(raw);
    const parsed = AssessmentSchema.parse(json);
    expect(parsed.id).toBe("assessment_ml_01");
    expect(parsed.totalMarks).toBe(20);
    expect(parsed.rubric?.criteria.length).toBe(4);
  });

  it("verifies all 12 script fixtures exist and have content", () => {
    const scriptsDir = path.resolve(__dirname, "../fixtures/scripts");
    for (let i = 1; i <= 12; i++) {
      const filename = `S${i.toString().padStart(2, "0")}.txt`;
      const filePath = path.join(scriptsDir, filename);
      expect(fs.existsSync(filePath), `Missing ${filename}`).toBe(true);
      const content = fs.readFileSync(filePath, "utf-8");
      expect(content.trim().length).toBeGreaterThan(50);
    }
  });

  it("verifies fixtures/roster.csv exists with 12 entries", () => {
    const rosterPath = path.resolve(__dirname, "../fixtures/roster.csv");
    expect(fs.existsSync(rosterPath)).toBe(true);
    const lines = fs.readFileSync(rosterPath, "utf-8").trim().split("\n");
    // header + 12 students = 13 lines
    expect(lines.length).toBe(13);
  });
});
