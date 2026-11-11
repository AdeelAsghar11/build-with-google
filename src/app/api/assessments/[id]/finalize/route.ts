import { NextResponse } from "next/server";
import { requireTeacher } from "@/lib/auth";
import { finalizeAssessment } from "@/lib/pipeline/finalize";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireTeacher();
    const resolvedParams = await params;
    const { id: assessmentId } = resolvedParams;

    const result = await finalizeAssessment(assessmentId);

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Finalize failed";
    console.error("Finalize route error:", err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
