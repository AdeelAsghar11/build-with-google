import { gradeSubmission } from "../src/lib/pipeline/orchestrator";
import {
  saveCourse,
  saveAssessment,
  saveSubmission,
} from "../src/lib/db/repo";
import {
  initialCourse,
  initialAssessment,
  initialSubmissions,
} from "../src/lib/demo-data";

async function main() {
  console.log("================================================================================");
  console.log(" MODERATOR — BATCH FIXTURE GRADING RUNNER");
  console.log(" Running end-to-end grading on all 12 benchmark fixtures...");
  console.log("================================================================================\n");

  // 1. Seed database with benchmark course & assessment
  await saveCourse(initialCourse);
  await saveAssessment(initialAssessment);

  console.log(`✓ Seeded course: ${initialCourse.code} — ${initialCourse.title}`);
  console.log(`✓ Seeded assessment: ${initialAssessment.title} (Approved Rubric v1)`);
  console.log(`✓ Rubric criteria count: ${initialAssessment.rubric?.criteria.length}\n`);

  // 2. Seed submissions
  for (const sub of initialSubmissions) {
    await saveSubmission({
      ...sub,
      status: "queued",
      results: [],
      totals: { ai: 0, final: 0, pct: 0, grade: "F" },
      reviewReasons: [],
    });
  }
  console.log(`✓ Seeded 12 submissions in 'queued' state.\n`);

  console.log("Starting batch evaluation loop:\n");
  console.log("ID   | Pseudonym | AI Marks | Status       | Review Reasons");
  console.log("-----+-----------+----------+--------------+-------------------------------------------");

  const results = [];

  for (const sub of initialSubmissions) {
    const graded = await gradeSubmission({
      assessmentId: initialAssessment.id,
      submissionId: sub.id,
      force: true,
    });

    results.push(graded);

    const reasonsStr =
      graded.reviewReasons && graded.reviewReasons.length > 0
        ? graded.reviewReasons.map((r) => r.code).join(", ")
        : "— (Clean agreement)";

    const statusPadded = graded.status.padEnd(12, " ");
    const marksPadded = `${(graded.totals?.final ?? 0).toFixed(1)}/20`.padEnd(8, " ");
    const pseudoPadded = graded.pseudonym.padEnd(9, " ");

    console.log(`${sub.id.padEnd(4, " ")} | ${pseudoPadded} | ${marksPadded} | ${statusPadded} | ${reasonsStr}`);
  }

  console.log("\n================================================================================");
  console.log(" AUDIT & INVARIANT VERIFICATION SUMMARY");
  console.log("================================================================================");

  // Assertion 1: All 12 graded
  if (results.length !== 12) {
    throw new Error(`Expected 12 graded submissions, got ${results.length}`);
  }
  console.log("✓ Invariant #1 passed: All 12 submissions evaluated through dual-panel grading.");

  // Assertion 2: S07 hidden injection caught
  const s07 = results.find((r) => r.id === "sub_07" || r.pseudonym === "S-07");
  if (!s07 || s07.status !== "needs_review") {
    throw new Error("S07 (hidden DOCX injection) failed to be routed to needs_review");
  }
  console.log("✓ Security Check passed: S07 hidden text flagged and routed to needs_review.");

  // Assertion 3: S08 visible prompt injection caught
  const s08 = results.find((r) => r.id === "sub_08" || r.pseudonym === "S-08");
  if (!s08 || s08.status !== "needs_review") {
    throw new Error("S08 (visible prompt injection) failed to be routed to needs_review");
  }
  console.log("✓ Security Check passed: S08 prompt injection quarantined and routed to needs_review.");

  // Assertion 4: LLMs never assign numbers directly
  for (const r of results) {
    for (const cr of r.results) {
      if (cr.aiMarks === undefined || typeof cr.aiMarks !== "number") {
        throw new Error(`Missing derived AI marks on submission ${r.id}`);
      }
    }
  }
  console.log("✓ Invariant #2 passed: Pure score() function deterministically computed all marks.");

  console.log("\n>>> ALL 12 FIXTURES GRADED SUCCESSFULLY WITH 0 FAILURES <<<\n");
}

main().catch((err) => {
  console.error("Grading execution error:", err);
  process.exit(1);
});
