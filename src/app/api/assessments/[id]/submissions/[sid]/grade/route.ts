import { NextResponse } from "next/server";
import { requireTeacher } from "@/lib/auth";
import { gradeSubmission } from "@/lib/pipeline/orchestrator";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; sid: string }> }
) {
  try {
    await requireTeacher();
    const resolvedParams = await params;
    const { id: assessmentId, sid: submissionId } = resolvedParams;

    const url = new URL(request.url);
    const force = url.searchParams.get("force") === "1";

    const submission = await gradeSubmission({
      assessmentId,
      submissionId,
      force,
    });

    return NextResponse.json({
      success: true,
      submission,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Grading failed";
    console.error("Grade route error:", err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
