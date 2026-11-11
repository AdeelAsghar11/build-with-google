import { NextResponse } from "next/server";
import { requireTeacher } from "@/lib/auth";
import * as repo from "@/lib/db/repo";
import { gradeSubmission } from "@/lib/pipeline/orchestrator";
import { generateFeedback } from "@/lib/pipeline/feedback";
import { compileRubric } from "@/lib/pipeline/rubricCompiler";
import { ingestFiles } from "@/lib/ingest";
import { initialCourse } from "@/lib/demo-data";
import type { Assessment, Submission, Course } from "@/lib/contracts";

export async function POST(request: Request) {
  try {
    await requireTeacher();
    const body = await request.json();
    const action = body.action || "grade";

    // 1. INGEST ACTION
    if (action === "ingest") {
      const { assessmentId, text, fileName = "submission.txt", studentName } = body;
      if (!text || typeof text !== "string") {
        return NextResponse.json({ error: "No text provided for submission" }, { status: 400 });
      }

      const roster = studentName ? [{ rollNumber: "LIVE-01", name: studentName, email: "student@live.local" }] : [];
      const ingestRes = await ingestFiles(
        assessmentId || "asm_live_1",
        [{ fileName, buffer: Buffer.from(text, "utf-8") }],
        roster
      );

      const submission = ingestRes.submissions[0];
      await repo.saveSubmission(submission);

      return NextResponse.json({
        success: true,
        submission,
      });
    }

    // 2. COMPILE RUBRIC ACTION
    if (action === "compile_rubric") {
      const { assessment } = body;
      if (!assessment) {
        return NextResponse.json({ error: "Assessment object required" }, { status: 400 });
      }

      // Ensure course exists
      const course = (await repo.getCourse(assessment.courseId)) ?? initialCourse;
      await repo.saveCourse(course);
      await repo.saveAssessment(assessment);

      const compiled = await compileRubric(course.id, assessment.id);
      return NextResponse.json({
        success: true,
        rubric: compiled,
      });
    }

    // 3. GRADE ACTION
    if (action === "grade") {
      const { assessment, submission, course } = body as {
        assessment: Assessment;
        submission: Submission;
        course?: Course;
      };

      if (!assessment || !submission) {
        return NextResponse.json({ error: "Both assessment and submission are required" }, { status: 400 });
      }

      const activeCourse = course ?? (await repo.getCourse(assessment.courseId)) ?? initialCourse;
      await repo.saveCourse(activeCourse);
      await repo.saveAssessment(assessment);
      await repo.saveSubmission(submission);

      const graded = await gradeSubmission({
        assessmentId: assessment.id,
        submissionId: submission.id,
        force: true,
      });

      // Generate feedback
      let feedback = graded.feedback;
      try {
        feedback = await generateFeedback({
          assessment,
          course: activeCourse,
          submission: graded,
        });
        graded.feedback = feedback;
        await repo.saveSubmission(graded);
      } catch (fbErr) {
        console.warn("Feedback generation warning:", fbErr);
      }

      return NextResponse.json({
        success: true,
        submission: graded,
      });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Grade live failed";
    console.error("Grade live route error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
