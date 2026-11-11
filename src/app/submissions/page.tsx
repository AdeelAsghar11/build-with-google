"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useDemo } from "@/lib/store/demo-context";
import { Button } from "@/components/ui/Button";
import { StatusBadge, ReasonBadge } from "@/components/ui/Badge";
import {
  CheckCircle2,
  FolderUp,
  Play,
  ClipboardList,
  UserX,
  FileCheck2,
} from "lucide-react";
import type { Submission } from "@/lib/contracts";

export default function SubmissionsPage() {
  const { assessment, submissions } = useDemo();
  const [isGrading, setIsGrading] = useState(false);
  const [gradedCount, setGradedCount] = useState(submissions.length);

  const simulateBatchGrade = () => {
    setIsGrading(true);
    setGradedCount(0);

    const interval = setInterval(() => {
      setGradedCount((prev) => {
        if (prev >= submissions.length) {
          clearInterval(interval);
          setIsGrading(false);
          return submissions.length;
        }
        return prev + 1;
      });
    }, 250);
  };

  const needsReviewCount = submissions.filter(
    (s) =>
      s.status === "needs_review" ||
      (s.reviewReasons && s.reviewReasons.length > 0 && s.status !== "approved" && s.status !== "released")
  ).length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--rule)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
              Stage 2 of 5
            </span>
            <span className="text-xs text-[var(--muted-foreground)]">·</span>
            <span className="text-xs font-semibold text-[var(--primary)]">
              {assessment.title} (Rubric v{assessment.rubric?.version || 1})
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
            Upload & Batch Grading Progress
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/review" className="no-underline">
            <Button variant="primary">
              <ClipboardList className="w-4 h-4" />
              Open Review Queue ({needsReviewCount} pending)
            </Button>
          </Link>
        </div>
      </div>

      {/* Upload Zone & Ingest Security Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-[var(--card)] p-6 rounded border border-dashed border-[var(--border)] shadow-[var(--shadow-paper)] flex flex-col items-center justify-center text-center space-y-3">
          <div className="p-3 rounded-full bg-[var(--background)] border border-[var(--border)] text-[var(--primary)]">
            <FolderUp className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-[var(--foreground)]">
              12 Synthetic Scripts Loaded in Ingestion Pipeline
            </h3>
            <p className="text-xs text-[var(--muted-foreground)] max-w-md">
              Supports TXT, DOCX, and text PDF up to 10 MB per file. Document Sanitizer and PII Redactor run automatically on upload.
            </p>
          </div>
          <div className="flex items-center gap-3 pt-1">
            <span className="text-xs text-[var(--muted-foreground)] font-mono">
              Accepted formats: .txt, .docx, .pdf
            </span>
            <span className="text-xs text-[var(--muted-foreground)]">·</span>
            <span className="text-xs text-[var(--muted-foreground)] font-mono">
              12 / 12 files parsed successfully
            </span>
          </div>
        </div>

        <div className="lg:col-span-4 bg-[var(--card)] p-6 rounded border border-[var(--border)] shadow-[var(--shadow-paper)] space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--primary)]">
            <UserX className="w-4 h-4" />
            <span>Blind Grading Privacy Gate</span>
          </div>
          <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
            Student names, emails, and roll numbers are redacted to <code className="bg-[var(--muted)] px-1 py-0.5 rounded text-[var(--foreground)]">[STUDENT]</code> before model calls (D-011).
          </p>
          <div className="pt-2 border-t border-[var(--rule)] space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-[var(--muted-foreground)]">Pseudonym Mapping:</span>
              <span className="font-semibold text-[var(--foreground)]">Shuffled S-01 .. S-12</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted-foreground)]">Student Identity Store:</span>
              <span className="font-semibold text-[var(--primary)]">Server-only (Encrypted)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Batch Runner Bar */}
      <section className="bg-[var(--card)] p-5 rounded border border-[var(--border)] shadow-[var(--shadow-paper)] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-[var(--primary)]" />
            <h3 className="font-bold text-sm text-[var(--foreground)]">
              Batch Grading Engine (Concurrency: 3)
            </h3>
          </div>
          <p className="text-xs text-[var(--muted-foreground)]">
            Completed {gradedCount} of {submissions.length} scripts. Two-panel consensus (Grader A + Grader B) with pure scoring.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            variant="secondary"
            onClick={simulateBatchGrade}
            disabled={isGrading}
            className="w-full sm:w-auto"
          >
            <Play className="w-4 h-4" />
            {isGrading ? `Grading (${gradedCount}/${submissions.length})...` : "Re-run Batch Grading"}
          </Button>
        </div>
      </section>

      {/* Submissions Table */}
      <section className="bg-[var(--card)] rounded border border-[var(--border)] shadow-[var(--shadow-paper)] overflow-hidden">
        <div className="p-4 border-b border-[var(--rule)] bg-[var(--background)] flex items-center justify-between">
          <h2 className="font-bold text-sm text-[var(--foreground)]">
            Ingested Submission Records ({submissions.length})
          </h2>
          <span className="text-xs text-[var(--muted-foreground)]">
            Seeded random review order (D-016)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[var(--rule)] text-[var(--muted-foreground)] font-semibold uppercase tracking-wider text-[11px] bg-[var(--background)]">
                <th className="py-3 px-4">Pseudonym</th>
                <th className="py-3 px-4">Extracted Words</th>
                <th className="py-3 px-4">PII Redactions</th>
                <th className="py-3 px-4">Integrity Defense</th>
                <th className="py-3 px-4">Draft Marks</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--rule)]">
              {submissions.map((sub) => {
                return (
                  <tr
                    key={sub.id}
                    className="hover:bg-[var(--muted)] transition-colors"
                  >
                    <td className="py-3 px-4 font-bold font-[family-name:var(--font-mono)] text-[var(--foreground)]">
                      {sub.pseudonym}
                    </td>

                    <td className="py-3 px-4 tabular-nums text-[var(--muted-foreground)]">
                      {sub.flags?.wordCount ?? sub.textForGrading?.split(/\s+/).length ?? 0} words
                    </td>

                    <td className="py-3 px-4 tabular-nums">
                      <span className="px-2 py-0.5 rounded bg-[var(--background)] border border-[var(--rule)] font-mono">
                        {sub.flags?.removedChars?.length || 2} redacted
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      {sub.reviewReasons && sub.reviewReasons.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {sub.reviewReasons.map((r) => (
                            <ReasonBadge key={r.code} code={r.code} />
                          ))}
                        </div>
                      ) : (
                        <span className="text-[var(--evidence-verified)] font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Clean script
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-bold tabular-nums text-sm text-[var(--foreground)]">
                      {sub.totals?.final !== undefined ? `${sub.totals.final} / 20.0` : "—"}
                    </td>

                    <td className="py-3 px-4">
                      <StatusBadge status={sub.status as Submission["status"]} />
                    </td>

                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/review?id=${sub.id}`}
                        className="text-[var(--accent)] font-semibold hover:underline no-underline"
                      >
                        Inspect & Review
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
