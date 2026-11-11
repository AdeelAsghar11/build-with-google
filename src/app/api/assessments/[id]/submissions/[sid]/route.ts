import { NextResponse } from "next/server";
import { requireTeacher } from "@/lib/auth";
import * as repo from "@/lib/db/repo";
import { score } from "@/lib/pipeline/score";
import { regenerateFeedback } from "@/lib/pipeline/feedback";
import { initialAssessment, initialSubmissions } from "@/lib/demo-data";
import { appendAudit } from "@/lib/audit";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; sid: string }> }
) {
  try {
    const teacher = await requireTeacher();
    const resolvedParams = await params;
    const { id: assessmentId, sid: submissionId } = resolvedParams;

    const body = await request.json();
    const { teacherMarks, teacherNotes, approve } = body as {
      teacherMarks?: Record<string, number>;
      teacherNotes?: string;
      approve?: boolean;
    };

    let sub = await repo.getSubmission(submissionId);
    if (!sub) {
      sub = initialSubmissions.find((s) => s.id === submissionId) ?? null;
    }

    if (!sub) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    const assessment = (await repo.getAssessment(assessmentId)) ?? initialAssessment;
    const criteria = assessment.rubric?.criteria ?? [];
    const strictness = assessment.strictness ?? 3;

    let marksChanged = false;
    const beforeTotals = { ...sub.totals };

    // Apply teacher mark overrides
    if (teacherMarks && Object.keys(teacherMarks).length > 0) {
      marksChanged = true;
      sub.results = sub.results.map((res) => {
        if (teacherMarks[res.criterionId] !== undefined) {
          return {
            ...res,
            teacherMarks: teacherMarks[res.criterionId],
            finalMarks: teacherMarks[res.criterionId],
          };
        }
        return res;
      });

      // Recalculate deterministic marks through pure score()
      const scored = score(sub.results, criteria, strictness, undefined, teacherMarks);
      sub.results = scored.results;
      sub.totals = scored.totals;

      // Invariant: edits set status to needs_review until explicitly approved
      sub.status = "needs_review";
      sub.approvedBy = undefined;
      sub.approvedAt = undefined;
    }

    if (teacherNotes !== undefined) {
      sub.teacherNotes = teacherNotes;
    }

    // Explicit teacher approval
    if (approve === true) {
      sub.status = "approved";
      sub.approvedBy = teacher.uid;
      sub.approvedAt = new Date().toISOString();
    }

    sub.updatedAt = new Date().toISOString();

    // If marks changed, re-verify qualitative feedback
    if (marksChanged) {
      try {
        sub = await regenerateFeedback(sub.id);
      } catch {
        // Fallback: keep existing feedback structure
      }
    }

    await repo.saveSubmission(sub);

    await appendAudit({
      actor: teacher.uid,
      action: approve ? "approve_submission" : "edit_submission_marks",
      submissionId: sub.id,
      before: beforeTotals,
      after: sub.totals,
      detail: approve
        ? `Approved submission ${sub.pseudonym}`
        : `Updated marks for submission ${sub.pseudonym}`,
    });

    return NextResponse.json({
      success: true,
      submission: sub,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update submission";
    console.error("Submission PATCH error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
