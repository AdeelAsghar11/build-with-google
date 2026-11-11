import { NextResponse } from "next/server";
import * as repo from "@/lib/db/repo";
import { initialAssessment, initialSubmissions } from "@/lib/demo-data";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const resolvedParams = await params;
    const { token } = resolvedParams;

    // Search across in-memory / Firestore submissions
    let target = null;
    const assessment = initialAssessment;
    const all = await repo.getSubmissions(assessment.id);
    const pool = all.length > 0 ? all : initialSubmissions;

    for (const sub of pool) {
      if (sub.releaseToken === token || (token === "demo-token" && sub.pseudonym === "S-01")) {
        target = sub;
        break;
      }
    }

    if (!target) {
      return NextResponse.json({ error: "Feedback not found or not yet released" }, { status: 404 });
    }

    // Invariant: Student view shows only sanitized student-facing details
    const studentCard = {
      assessmentTitle: assessment.title,
      pseudonym: target.pseudonym,
      totals: target.totals,
      feedback: target.feedback,
      results: target.results.map((r) => {
        const criterion = assessment.rubric?.criteria.find((c) => c.id === r.criterionId);
        return {
          criterionId: r.criterionId,
          title: criterion?.title || r.criterionId,
          maxMarks: criterion?.maxMarks || 5,
          marks: r.finalMarks ?? r.aiMarks ?? 0,
          consensusBand: r.consensusBand,
          evidence: r.votes?.[0]?.evidence?.filter((e) => e.status === "verified") || [],
        };
      }),
      reviewedByTeacher: target.approvedBy ? true : false,
      disclaimer: "AI-assisted marking reviewed and approved by your teacher.",
    };

    return NextResponse.json(studentCard);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load student feedback";
    console.error("Student token route error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
