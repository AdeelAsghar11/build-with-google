import { NextResponse } from "next/server";
import { requireTeacher } from "@/lib/auth";
import * as repo from "@/lib/db/repo";
import { StrictnessSchema, type Strictness } from "@/lib/contracts";
import { score } from "@/lib/pipeline/score";
import { initialAssessment, initialSubmissions } from "@/lib/demo-data";
import { appendAudit } from "@/lib/audit";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const teacher = await requireTeacher();
    const resolvedParams = await params;
    const { id: assessmentId } = resolvedParams;

    const body = await request.json();
    const parsedStrictness = StrictnessSchema.parse(body.strictness);

    let assessment = await repo.getAssessment(assessmentId);
    if (!assessment) {
      assessment = { ...initialAssessment, id: assessmentId };
    }

    const previousStrictness = assessment.strictness;
    assessment.strictness = parsedStrictness;
    await repo.saveAssessment(assessment);

    let submissions = await repo.getSubmissions(assessmentId);
    if (submissions.length === 0) {
      submissions = [...initialSubmissions];
    }

    const criteria = assessment.rubric?.criteria ?? [];

    // Recompute marks instantly with pure score() - zero AI calls (Architecture §6.7)
    const updatedSubmissions = submissions.map((sub) => {
      if (sub.results && sub.results.length > 0 && criteria.length > 0) {
        const scored = score(sub.results, criteria, parsedStrictness as Strictness);
        const updated = {
          ...sub,
          results: scored.results,
          totals: scored.totals,
          updatedAt: new Date().toISOString(),
        };
        repo.saveSubmission(updated);
        return updated;
      }
      return sub;
    });

    await appendAudit({
      actor: teacher.uid,
      action: "update_strictness",
      before: { strictness: previousStrictness },
      after: { strictness: parsedStrictness },
      detail: `Adjusted assessment strictness from ${previousStrictness} to ${parsedStrictness}`,
    });

    return NextResponse.json({
      success: true,
      strictness: parsedStrictness,
      submissions: updatedSubmissions,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update strictness";
    console.error("Strictness route error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
