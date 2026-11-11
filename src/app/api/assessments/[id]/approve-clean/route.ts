import { NextResponse } from "next/server";
import { requireTeacher } from "@/lib/auth";
import * as repo from "@/lib/db/repo";
import { initialSubmissions } from "@/lib/demo-data";
import { appendAudit } from "@/lib/audit";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const teacher = await requireTeacher();
    const resolvedParams = await params;
    const { id: assessmentId } = resolvedParams;

    let submissions = await repo.getSubmissions(assessmentId);
    if (submissions.length === 0) {
      submissions = [...initialSubmissions];
    }

    const cleanSubmissions = submissions.filter((s) => s.status === "graded_clean");
    const now = new Date().toISOString();

    for (const sub of cleanSubmissions) {
      sub.status = "approved";
      sub.approvedBy = teacher.uid;
      sub.approvedAt = now;
      sub.updatedAt = now;
      await repo.saveSubmission(sub);
    }

    await appendAudit({
      actor: teacher.uid,
      action: "bulk_approve_clean",
      detail: `Bulk approved ${cleanSubmissions.length} clean submissions for assessment ${assessmentId}`,
    });

    return NextResponse.json({
      success: true,
      approvedCount: cleanSubmissions.length,
      submissions: cleanSubmissions,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to bulk approve clean submissions";
    console.error("Approve-clean route error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
