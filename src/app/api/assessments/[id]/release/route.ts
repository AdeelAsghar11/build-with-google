import { NextResponse } from "next/server";
import crypto from "crypto";
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

    // Invariant #2: Only approved submissions can be released
    const approvedSubmissions = submissions.filter((s) => s.status === "approved");

    if (approvedSubmissions.length === 0) {
      return NextResponse.json(
        { error: "No approved submissions available to release. Teacher approval required first." },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const releases: Array<{ submissionId: string; pseudonym: string; releaseToken: string }> = [];

    for (const sub of approvedSubmissions) {
      if (!sub.releaseToken) {
        sub.releaseToken = crypto.randomBytes(16).toString("hex");
      }
      sub.status = "released";
      sub.updatedAt = now;
      await repo.saveSubmission(sub);

      releases.push({
        submissionId: sub.id,
        pseudonym: sub.pseudonym,
        releaseToken: sub.releaseToken,
      });
    }

    await appendAudit({
      actor: teacher.uid,
      action: "release_submissions",
      detail: `Released ${releases.length} approved submissions with student tokens`,
    });

    return NextResponse.json({
      success: true,
      releasedCount: releases.length,
      releases,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Release failed";
    console.error("Release route error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
