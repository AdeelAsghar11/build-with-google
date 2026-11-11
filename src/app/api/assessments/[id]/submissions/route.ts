import { NextResponse } from "next/server";
import { requireTeacher } from "@/lib/auth";
import * as repo from "@/lib/db/repo";
import { ingestFiles, type IngestFileInput } from "@/lib/ingest";
import { score } from "@/lib/pipeline/score";
import { initialAssessment, initialSubmissions } from "@/lib/demo-data";
import { appendAudit } from "@/lib/audit";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireTeacher();
    const resolvedParams = await params;
    const { id: assessmentId } = resolvedParams;

    let submissions = await repo.getSubmissions(assessmentId);
    if (submissions.length === 0) {
      submissions = initialSubmissions;
    }

    const assessment = (await repo.getAssessment(assessmentId)) ?? initialAssessment;
    const strictness = assessment.strictness ?? 3;
    const criteria = assessment.rubric?.criteria ?? [];

    // Recompute deterministic marks per current strictness
    const rescored = submissions.map((sub) => {
      if (sub.results && sub.results.length > 0 && criteria.length > 0) {
        const scoreOutput = score(sub.results, criteria, strictness);
        return {
          ...sub,
          results: scoreOutput.results,
          totals: scoreOutput.totals,
        };
      }
      return sub;
    });

    return NextResponse.json({ submissions: rescored });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to load submissions";
    console.error("Submissions GET error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const teacher = await requireTeacher();
    const resolvedParams = await params;
    const { id: assessmentId } = resolvedParams;

    const contentType = request.headers.get("content-type") || "";
    const filesToIngest: IngestFileInput[] = [];

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const files = formData.getAll("files") as File[];

      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        filesToIngest.push({
          fileName: file.name,
          buffer: Buffer.from(arrayBuffer),
        });
      }
    } else {
      // JSON body format fallback
      const body = await request.json();
      const items = (body.files ?? []) as Array<{ fileName: string; content: string }>;
      for (const item of items) {
        filesToIngest.push({
          fileName: item.fileName,
          buffer: Buffer.from(item.content, "utf-8"),
        });
      }
    }

    if (filesToIngest.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const { submissions, identities } = await ingestFiles(assessmentId, filesToIngest);

    for (const sub of submissions) {
      await repo.saveSubmission(sub);
    }
    for (const ident of identities) {
      await repo.saveIdentity(ident);
    }

    await appendAudit({
      actor: teacher.uid,
      action: "ingest_submissions",
      detail: `Ingested ${submissions.length} submissions for assessment ${assessmentId}`,
    });

    return NextResponse.json({
      success: true,
      count: submissions.length,
      submissions,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to ingest files";
    console.error("Submissions POST error:", err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
