import { NextResponse } from "next/server";
import { requireTeacher } from "@/lib/auth";
import { getAnalyticsReport } from "@/lib/pipeline/analytics";
import { appendAudit } from "@/lib/audit";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const teacher = await requireTeacher();
    const resolvedParams = await params;
    const { id: assessmentId } = resolvedParams;

    const report = await getAnalyticsReport(assessmentId);

    await appendAudit({
      actor: teacher.uid,
      action: "view_analytics",
      detail: `Viewed analytics report for assessment ${assessmentId}`,
    });

    return NextResponse.json(report);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load analytics";
    console.error("Analytics route error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
