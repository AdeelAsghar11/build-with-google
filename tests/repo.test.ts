import { describe, it, expect } from "vitest";
import {
  saveCourse,
  getCourse,
  saveAssessment,
  getAssessment,
  saveSubmission,
  getSubmission,
  saveIdentity,
  getIdentity,
  saveCollusionPairs,
  getCollusionPairs,
  getAuditLogs,
} from "../src/lib/db/repo";
import { appendAudit } from "../src/lib/audit";
import type { Course, Assessment, Submission, Identity, CollusionPair } from "../src/lib/contracts";

describe("Database Repo & Audit (M0.3)", () => {
  it("saves and retrieves a course", async () => {
    const course: Course = {
      id: "course_test_1",
      ownerUid: "teacher_test",
      code: "CS101",
      title: "Intro CS",
      description: "Introductory course",
      topics: ["Variables", "Loops"],
      clos: [{ id: "CLO-1", text: "Explain programming concepts", ploIds: ["PLO-1"] }],
      plos: [{ id: "PLO-1", text: "Knowledge" }],
      gradeScheme: [{ letter: "A", minPct: 85 }],
      cloStudentThresholdPct: 50,
      cloClassTargetPct: 60,
      createdAt: new Date().toISOString(),
    };
    await saveCourse(course);
    const retrieved = await getCourse("course_test_1");
    expect(retrieved?.title).toBe("Intro CS");
  });

  it("saves and retrieves an assessment", async () => {
    const assessment: Assessment = {
      id: "assess_test_1",
      courseId: "course_test_1",
      ownerUid: "teacher_test",
      title: "Quiz 1",
      type: "quiz",
      question: "What is a loop?",
      totalMarks: 10,
      strictness: 3,
      rubricRaw: "Criterion 1 (10 marks)",
      status: "draft",
      createdAt: new Date().toISOString(),
    };
    await saveAssessment(assessment);
    const retrieved = await getAssessment("assess_test_1");
    expect(retrieved?.title).toBe("Quiz 1");
  });

  it("saves and retrieves a submission", async () => {
    const submission: Submission = {
      id: "sub_test_1",
      assessmentId: "assess_test_1",
      pseudonym: "S-99",
      fileName: "test.txt",
      textOriginal: "raw answer",
      textForGrading: "graded answer",
      flags: {
        removedChars: [],
        hiddenText: [],
        heuristicHits: [],
        quarantined: [],
        wordCount: 10,
        parseWarnings: [],
      },
      status: "queued",
      reviewReasons: [],
      results: [],
      rubricVersion: 1,
      updatedAt: new Date().toISOString(),
    };
    await saveSubmission(submission);
    const retrieved = await getSubmission("sub_test_1");
    expect(retrieved?.pseudonym).toBe("S-99");
  });

  it("saves and retrieves identity", async () => {
    const identity: Identity = {
      submissionId: "sub_test_1",
      name: "Test Student",
      rollNo: "FA23-BCS-999",
    };
    await saveIdentity(identity);
    const retrieved = await getIdentity("sub_test_1");
    expect(retrieved?.name).toBe("Test Student");
  });

  it("saves and retrieves collusion pairs", async () => {
    const pairs: CollusionPair[] = [
      {
        a: "sub_1",
        b: "sub_2",
        containment: 0.9,
        jaccard: 0.85,
        cosine: 0.95,
        level: "high",
        sharedPassages: [{ textA: "passage 1", textB: "passage 1" }],
      },
    ];
    await saveCollusionPairs("assess_test_1", pairs);
    const retrieved = await getCollusionPairs("assess_test_1");
    expect(retrieved.length).toBe(1);
    expect(retrieved[0].level).toBe("high");
  });

  it("appends and reads audit log", async () => {
    await appendAudit({
      ts: new Date().toISOString(),
      actor: "system",
      action: "grade_submission",
      submissionId: "sub_test_1",
      detail: "Graded via model panel",
    });
    const logs = await getAuditLogs("sub_test_1");
    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0].action).toBe("grade_submission");
  });
});
