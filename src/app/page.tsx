"use client";

import React from "react";
import Link from "next/link";
import { useDemo } from "@/lib/store/demo-context";
import { Button } from "@/components/ui/Button";
import { StatusBadge, ReasonBadge } from "@/components/ui/Badge";
import {
  ClipboardList,
  ArrowRight,
  AlertTriangle,
  EyeOff,
  Files,
  Split,
  ShieldCheck,
  BarChart3,
  Sparkles,
} from "lucide-react";

export default function HomePage() {
  const { assessment, submissions, analytics, approveAllClean } = useDemo();

  const needsReviewList = submissions.filter(
    (s) =>
      s.status === "needs_review" ||
      (s.reviewReasons && s.reviewReasons.length > 0 && s.status !== "approved" && s.status !== "released")
  );
  const cleanList = submissions.filter(
    (s) => (!s.reviewReasons || s.reviewReasons.length === 0) && s.status !== "approved" && s.status !== "released"
  );
  const approvedList = submissions.filter((s) => s.status === "approved" || s.status === "released");

  return (
    <div className="space-y-8">
      {/* Hero / Assessment Context */}
      <section className="bg-[var(--card)] border border-[var(--border)] rounded p-6 sm:p-8 shadow-[var(--shadow-paper)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--muted)] text-[var(--muted-foreground)]">
                Active Assessment
              </span>
              <StatusBadge status={assessment.rubric?.status === "approved" ? "approved" : "draft_ready"} />
              <span className="text-xs text-[var(--muted-foreground)]">
                Rubric v{assessment.rubric?.version || 1} · Partial-credit Strictness: {assessment.strictness}/5
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
              {assessment.title}
            </h1>
            <p className="text-sm sm:text-base text-[var(--muted-foreground)] leading-relaxed">
              {assessment.question}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 min-w-[240px]">
            <Link href="/review" className="no-underline">
              <Button variant="primary" className="w-full">
                <ClipboardList className="w-4 h-4" />
                Open Review Queue ({needsReviewList.length} pending)
              </Button>
            </Link>
            {cleanList.length > 0 && (
              <Button
                variant="secondary"
                onClick={approveAllClean}
                className="w-full"
                title="Bulk approve clean scripts with zero integrity flags"
              >
                Approve {cleanList.length} Clean Scripts
              </Button>
            )}
          </div>
        </div>

        {/* KPI Strip (Plain text & numbers per design.md §5) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-[var(--rule)]">
          <div>
            <div className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
              Submissions
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] tabular-nums mt-1">
              {submissions.length}
            </div>
            <div className="text-xs text-[var(--muted-foreground)] mt-0.5">
              {approvedList.length} approved · {needsReviewList.length} review
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
              Class Average
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] tabular-nums mt-1">
              {analytics.kpis?.mean ?? 12.2} <span className="text-base font-normal text-[var(--muted-foreground)]">/ {assessment.totalMarks}</span>
            </div>
            <div className="text-xs text-[var(--muted-foreground)] mt-0.5">
              Median {analytics.kpis?.median ?? 13.0} · SD {analytics.kpis?.sd ?? 3.8}
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
              Pass Rate
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[var(--primary)] tabular-nums mt-1">
              {analytics.kpis?.passRatePct ?? 83}%
            </div>
            <div className="text-xs text-[var(--muted-foreground)] mt-0.5">
              Threshold {(assessment.totalMarks / 2).toFixed(1)} / {assessment.totalMarks}.0
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
              Audit Defense
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-[var(--evidence-verified)] tabular-nums mt-1">
              100%
            </div>
            <div className="text-xs text-[var(--muted-foreground)] mt-0.5">
              All 12 planted test cases defended
            </div>
          </div>
        </div>
      </section>

      {/* Flagged Cases Attention Box (Pre-attentive triage per design.md §1) */}
      {needsReviewList.length > 0 && (
        <section className="bg-[var(--state-needs-review-bg)] border border-[var(--state-needs-review)] rounded p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[var(--state-needs-review)] font-semibold text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>Prioritized Teacher Attention ({needsReviewList.length} scripts flagged for human judgement)</span>
            </div>
            <Link
              href="/review"
              className="text-xs font-bold text-[var(--accent)] hover:text-[var(--accent-hover)] no-underline flex items-center gap-1"
            >
              Start reviewing <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {needsReviewList.slice(0, 5).map((sub) => (
              <Link
                key={sub.id}
                href={`/review?id=${sub.id}`}
                className="bg-[var(--card)] p-3 rounded border border-[var(--border)] text-xs flex flex-col justify-between hover:bg-[var(--muted)] transition-colors no-underline text-[var(--foreground)]"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold font-[family-name:var(--font-mono)]">{sub.pseudonym}</span>
                  <span className="tabular-nums font-semibold">{sub.totals?.final ?? 0} / 20.0</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {sub.reviewReasons?.map((r) => (
                    <ReasonBadge key={r.code} code={r.code} />
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Defense in Depth Verification Highlights */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-[var(--foreground)]">
          Audit & Integrity Layers Active
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[var(--card)] p-5 rounded border border-[var(--border)] shadow-[var(--shadow-paper)] space-y-2">
            <div className="flex items-center gap-2 text-[var(--flag-integrity)] font-semibold text-sm">
              <EyeOff className="w-4 h-4" />
              <span>Sanitizer (S-07)</span>
            </div>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              Detected and removed hidden white text and zero-width spaces. Excluded from model prompt and flagged for teacher.
            </p>
            <div className="text-[11px] font-semibold text-[var(--flag-integrity)] bg-[var(--flag-integrity-bg)] px-2 py-1 rounded inline-block">
              Passed · Hidden injection blocked
            </div>
          </div>

          <div className="bg-[var(--card)] p-5 rounded border border-[var(--border)] shadow-[var(--shadow-paper)] space-y-2">
            <div className="flex items-center gap-2 text-[var(--flag-integrity)] font-semibold text-sm">
              <ShieldCheck className="w-4 h-4" />
              <span>Gemma Guard (S-08)</span>
            </div>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              Gemma 2 9B model screened student input. Identified prompt injection instruction and quarantined span with strikethrough.
            </p>
            <div className="text-[11px] font-semibold text-[var(--evidence-verified)] bg-[var(--evidence-verified-bg)] px-2 py-1 rounded inline-block">
              Passed · Span quarantined
            </div>
          </div>

          <div className="bg-[var(--card)] p-5 rounded border border-[var(--border)] shadow-[var(--shadow-paper)] space-y-2">
            <div className="flex items-center gap-2 text-[var(--state-needs-review)] font-semibold text-sm">
              <Split className="w-4 h-4" />
              <span>Arbiter Resolution (S-12)</span>
            </div>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              Grader A (evidence-first) and Grader B (deficit-first) split by 2 bands on C4. Resolved within bounded range and flagged.
            </p>
            <div className="text-[11px] font-semibold text-[var(--state-needs-review)] bg-[var(--state-needs-review-bg)] px-2 py-1 rounded inline-block">
              Passed · Bounded consensus
            </div>
          </div>

          <div className="bg-[var(--card)] p-5 rounded border border-[var(--border)] shadow-[var(--shadow-paper)] space-y-2">
            <div className="flex items-center gap-2 text-[var(--primary)] font-semibold text-sm">
              <Files className="w-4 h-4" />
              <span>Collusion Detector (S-09/10)</span>
            </div>
            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              Lexical 5-shingles and embedding cosine similarity identified 84% passage overlap between S-09 and S-10.
            </p>
            <div className="text-[11px] font-semibold text-[var(--primary)] bg-[var(--evidence-verified-bg)] px-2 py-1 rounded inline-block">
              Passed · Pair flagged
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Navigation Cards */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold tracking-tight text-[var(--foreground)]">
          Grading Workflow Stages
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/setup"
            className="bg-[var(--card)] p-6 rounded border border-[var(--border)] shadow-[var(--shadow-paper)] hover:border-[var(--primary)] transition-all no-underline text-[var(--foreground)] flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider">Stage 1</span>
                <StatusBadge status="approved" />
              </div>
              <h3 className="text-lg font-bold">Setup & Rubric</h3>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                Course CLO/PLO mappings, assessment prompt, 4-criterion approved rubric, and partial-credit policy calibration.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[var(--rule)] flex items-center justify-between text-xs font-semibold text-[var(--accent)]">
              <span>Inspect Rubric</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          <Link
            href="/submissions"
            className="bg-[var(--card)] p-6 rounded border border-[var(--border)] shadow-[var(--shadow-paper)] hover:border-[var(--primary)] transition-all no-underline text-[var(--foreground)] flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider">Stage 2</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[var(--muted)]">12 Uploaded</span>
              </div>
              <h3 className="text-lg font-bold">Submissions & Batch Run</h3>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                Ingested scripts (TXT/DOCX/PDF), pseudonymized roster, extraction telemetry, and batch grading execution.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[var(--rule)] flex items-center justify-between text-xs font-semibold text-[var(--accent)]">
              <span>View Submissions</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          <Link
            href="/review"
            className="bg-[var(--card)] p-6 rounded border border-[var(--primary)] shadow-[var(--shadow-paper)] hover:border-[var(--primary-hover)] transition-all no-underline text-[var(--foreground)] flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider">Stage 3</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[var(--state-needs-review-bg)] text-[var(--state-needs-review)]">
                  {needsReviewList.length} Pending
                </span>
              </div>
              <h3 className="text-lg font-bold">Teacher Review Queue</h3>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                Triage flagged scripts, inspect verified evidence underlines, compare Grader A vs B vs Arbiter, override marks, and approve.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[var(--rule)] flex items-center justify-between text-xs font-semibold text-[var(--primary)] font-bold">
              <span>Open Queue</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          <Link
            href="/analytics"
            className="bg-[var(--card)] p-6 rounded border border-[var(--border)] shadow-[var(--shadow-paper)] hover:border-[var(--primary)] transition-all no-underline text-[var(--foreground)] flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider">Stage 4</span>
                <BarChart3 className="w-4 h-4 text-[var(--muted-foreground)]" />
              </div>
              <h3 className="text-lg font-bold">Analytics & Collusion</h3>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                Marks distribution histogram, CLO attainment bars vs targets, criterion difficulty, and side-by-side collusion viewer.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[var(--rule)] flex items-center justify-between text-xs font-semibold text-[var(--accent)]">
              <span>Open Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          <Link
            href="/trust"
            className="bg-[var(--card)] p-6 rounded border border-[var(--border)] shadow-[var(--shadow-paper)] hover:border-[var(--primary)] transition-all no-underline text-[var(--foreground)] flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider">Stage 5</span>
                <ShieldCheck className="w-4 h-4 text-[var(--evidence-verified)]" />
              </div>
              <h3 className="text-lg font-bold">Trust & Audit Ledger</h3>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                Inter-panel agreement, quote verification rates, length correlation, red-team attack defenses, and immutable audit logs.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[var(--rule)] flex items-center justify-between text-xs font-semibold text-[var(--accent)]">
              <span>View Trust Report</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          <Link
            href="/disclosure"
            className="bg-[var(--card)] p-6 rounded border border-[var(--border)] shadow-[var(--shadow-paper)] hover:border-[var(--primary)] transition-all no-underline text-[var(--foreground)] flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--primary)] uppercase tracking-wider">Transparency</span>
                <Sparkles className="w-4 h-4 text-[var(--muted-foreground)]" />
              </div>
              <h3 className="text-lg font-bold">Public AI Disclosure</h3>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                Publicly accessible explanation for students, model & prompt versions, privacy protections, and mathematical scoring guarantees.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[var(--rule)] flex items-center justify-between text-xs font-semibold text-[var(--accent)]">
              <span>Read Disclosure</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}
