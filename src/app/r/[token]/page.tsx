"use client";

import React, { use, Suspense } from "react";
import Link from "next/link";
import { useDemo } from "@/lib/store/demo-context";
import { StatusBadge } from "@/components/ui/Badge";
import {
  CheckCircle2,
  ArrowRight,
  Award,
  Quote,
  Target,
  ListOrdered,
} from "lucide-react";

function StudentFeedbackContent({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const resolvedParams = use(params);
  const token = resolvedParams.token;
  const { assessment, submissions } = useDemo();

  // Find submission matching token or default to S01 for demo preview
  const submission =
    submissions.find((s) => s.releaseToken === token || token === "tok-synth-s01") ||
    submissions[0];

  const totalMax = assessment.totalMarks;
  const studentScore = submission.totals?.final ?? 16.5;

  return (
    <div className="max-w-[720px] mx-auto space-y-8 py-4 px-2 sm:px-0">
      {/* Header Card */}
      <div className="bg-[var(--card)] p-6 sm:p-8 rounded border border-[var(--border)] shadow-[var(--shadow-paper)] space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-[family-name:var(--font-heading)] font-bold text-xl text-[var(--foreground)]">
            Moderator
          </span>
          <StatusBadge status="released" />
        </div>

        <div className="space-y-1">
          <div className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
            Student Assessment Feedback Record
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
            {assessment.title}
          </h1>
          <p className="text-xs text-[var(--muted-foreground)]">
            Course: CS301 Software Engineering · Evaluated against frozen Rubric v1
          </p>
        </div>

        {/* Big Mark Denominator Block per design.md §5 */}
        <div className="p-6 rounded bg-[var(--background)] border border-[var(--border)] text-center space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
            Your Released Score
          </div>
          <div className="text-4xl sm:text-5xl font-bold font-mono tracking-tight text-[var(--foreground)] tabular-nums">
            {studentScore} <span className="text-2xl font-normal text-[var(--muted-foreground)]">/ {totalMax}.0</span>
          </div>
          <div className="text-xs text-[var(--primary)] font-semibold flex items-center justify-center gap-1.5 pt-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>AI helped draft this feedback. Your teacher reviewed and approved your marks before release.</span>
          </div>
        </div>
      </div>

      {/* Criterion-by-Criterion Evaluated Breakdown */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-[var(--foreground)] flex items-center gap-2">
          <Award className="w-5 h-5 text-[var(--primary)]" />
          <span>Criterion Assessment & Quoted Evidence</span>
        </h2>

        <div className="space-y-4">
          {assessment.rubric?.criteria.map((c) => {
            const cr = submission.results?.find((r) => r.criterionId === c.id);
            const critScore = cr?.finalMarks ?? cr?.aiMarks ?? 4.0;
            const voteA = cr?.votes?.find((v) => v.grader === "A");
            const voteB = cr?.votes?.find((v) => v.grader === "B");
            const evidenceQuote = voteA?.evidence?.[0]?.quote;

            return (
              <div
                key={c.id}
                className="bg-[var(--card)] p-5 rounded border border-[var(--border)] shadow-[var(--shadow-paper)] space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-[var(--rule)]">
                  <div>
                    <span className="font-bold text-sm text-[var(--foreground)]">
                      {c.id}: {c.title}
                    </span>
                    <div className="text-xs text-[var(--muted-foreground)]">
                      Outcome {c.cloId} · {c.dimension}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-bold font-mono text-[var(--foreground)] tabular-nums">
                      {critScore}
                    </span>
                    <span className="text-xs text-[var(--muted-foreground)] font-mono"> / {c.maxMarks}.0</span>
                  </div>
                </div>

                {/* Quoted Evidence from student's own work */}
                <div className="space-y-2 text-xs">
                  {evidenceQuote && (
                    <div className="p-3 rounded bg-[var(--background)] border border-[var(--rule)] space-y-1">
                      <div className="font-semibold text-[var(--evidence-verified)] flex items-center gap-1">
                        <Quote className="w-3 h-3" />
                        <span>Demonstrated Strength (From your submission):</span>
                      </div>
                      <p className="italic text-[var(--foreground)] leading-relaxed">
                        &ldquo;{evidenceQuote}&rdquo;
                      </p>
                    </div>
                  )}

                  {/* Constructive improvement descriptor */}
                  <div className="p-3 rounded bg-[var(--background)] border border-[var(--rule)] space-y-1">
                    <div className="font-semibold text-[var(--muted-foreground)]">
                      Feedback & Growth Opportunity:
                    </div>
                    <p className="text-[var(--foreground)] leading-relaxed">
                      {voteB?.rationale || "Clear demonstration of core concepts. Deepen analysis on secondary trade-offs."}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CLO Attainment Status */}
      <section className="bg-[var(--card)] p-6 rounded border border-[var(--border)] shadow-[var(--shadow-paper)] space-y-3">
        <h2 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2">
          <Target className="w-4 h-4 text-[var(--primary)]" />
          <span>Course Learning Outcome Attainment</span>
        </h2>
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2.5 rounded bg-[var(--background)] border border-[var(--rule)]">
            <span className="font-semibold">CLO-1: Concept of Overfitting & Noise</span>
            <span className="px-2 py-0.5 rounded font-bold text-[var(--evidence-verified)] bg-[var(--evidence-verified-bg)]">
              Attained (85%)
            </span>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded bg-[var(--background)] border border-[var(--rule)]">
            <span className="font-semibold">CLO-2: Detection via Loss Curve Divergence</span>
            <span className="px-2 py-0.5 rounded font-bold text-[var(--evidence-verified)] bg-[var(--evidence-verified-bg)]">
              Attained (80%)
            </span>
          </div>
          <div className="flex items-center justify-between p-2.5 rounded bg-[var(--background)] border border-[var(--rule)]">
            <span className="font-semibold">CLO-3: Regularization Techniques & Trade-offs</span>
            <span className="px-2 py-0.5 rounded font-bold text-[var(--evidence-verified)] bg-[var(--evidence-verified-bg)]">
              Attained (75%)
            </span>
          </div>
        </div>
      </section>

      {/* 3 Concrete Next Steps per design.md §5 */}
      <section className="bg-[var(--card)] p-6 rounded border border-[var(--border)] shadow-[var(--shadow-paper)] space-y-3">
        <h2 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2">
          <ListOrdered className="w-4 h-4 text-[var(--primary)]" />
          <span>Recommended Next Steps for Study</span>
        </h2>

        <ol className="list-decimal list-inside space-y-2 text-xs text-[var(--foreground)] leading-relaxed">
          <li>
            <strong>Review Early Stopping Criteria:</strong> Experiment with patience hyperparameter tuning on validation loss divergence.
          </li>
          <li>
            <strong>Contrast L1 vs L2 Norms:</strong> Contrast sparsity in Lasso weights versus uniform weight shrinkage in Ridge regression.
          </li>
          <li>
            <strong>Consult Course Office Hours:</strong> Discuss any questions regarding criterion marks or feedback directly with Dr. Tariq Mahmood.
          </li>
        </ol>
      </section>

      {/* Footer Disclaimer Link */}
      <div className="text-center text-xs text-[var(--muted-foreground)] space-y-1">
        <p>Moderator AI Evaluation Engine · Version 1.0.0</p>
        <Link href="/disclosure" className="text-[var(--accent)] hover:underline inline-flex items-center gap-1">
          Read our Public AI Disclosure & Marking Transparency Policy <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

export default function StudentFeedbackPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-sm text-[var(--muted-foreground)]">
          Loading student feedback record...
        </div>
      }
    >
      <StudentFeedbackContent params={params} />
    </Suspense>
  );
}
