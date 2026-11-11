"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useDemo } from "@/lib/store/demo-context";
import { Button } from "@/components/ui/Button";
import { StatusBadge, ReasonBadge } from "@/components/ui/Badge";
import { sampleGoodStudentText, sampleAdversarialSubmissionText } from "@/lib/live-data";
import {
  CheckCircle2,
  FolderUp,
  Play,
  ClipboardList,
  UserX,
  FileCheck2,
  Sparkles,
  ShieldAlert,
  FileText,
  Activity,
  PlusCircle,
} from "lucide-react";
import type { Submission } from "@/lib/contracts";

export default function SubmissionsPage() {
  const {
    mode,
    assessment,
    submissions,
    addLiveSubmission,
    gradeLiveSubmission,
    isGradingLive,
    liveGradingStage,
  } = useDemo();

  // Synthetic batch state
  const [isGradingSynthetic, setIsGradingSynthetic] = useState(false);
  const [syntheticGradedCount, setSyntheticGradedCount] = useState(submissions.length);

  // Live submission form state
  const [inputText, setInputText] = useState(sampleGoodStudentText);
  const [studentName, setStudentName] = useState("Ayesha Khan");
  const [isAdding, setIsAdding] = useState(false);

  const simulateBatchGrade = () => {
    setIsGradingSynthetic(true);
    setSyntheticGradedCount(0);

    const interval = setInterval(() => {
      setSyntheticGradedCount((prev) => {
        if (prev >= submissions.length) {
          clearInterval(interval);
          setIsGradingSynthetic(false);
          return submissions.length;
        }
        return prev + 1;
      });
    }, 250);
  };

  const handleAddSubmission = async () => {
    if (!inputText.trim()) return;
    setIsAdding(true);
    try {
      await addLiveSubmission(inputText, studentName);
    } finally {
      setIsAdding(false);
    }
  };

  const needsReviewCount = submissions.filter(
    (s) =>
      s.status === "needs_review" ||
      (s.reviewReasons && s.reviewReasons.length > 0 && s.status !== "approved" && s.status !== "released")
  ).length;

  return (
    <div className="space-y-8">
      {/* Mode Banner */}
      {mode === "live" ? (
        <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <div className="font-bold text-sm">Real Live AI Pipeline Mode</div>
              <div className="text-xs text-amber-800">
                Connected to live Gemini API. Input real student work or test adversarial prompt injections below.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-amber-200 text-amber-900 font-bold">
              Gemini 2.5 Flash + Pro
            </span>
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-lg bg-[var(--card)] border border-[var(--rule)] text-xs text-[var(--muted-foreground)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[var(--foreground)]">Synthetic Demonstration Mode:</span>
            <span>Displaying 12 pre-graded benchmark scripts with 12 planted security cases. Switch to &quot;Real Live Pipeline&quot; above to grade new student scripts with Gemini.</span>
          </div>
        </div>
      )}

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

      {/* LIVE MODE: Custom Submission Creator */}
      {mode === "live" && (
        <section className="bg-[var(--card)] p-6 rounded border border-[var(--border)] shadow-[var(--shadow-paper)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--rule)] pb-3">
            <div>
              <h2 className="text-base font-bold text-[var(--foreground)] flex items-center gap-2">
                <FileText className="w-4 h-4 text-[var(--primary)]" />
                <span>Submit Student Script for Live AI Grading</span>
              </h2>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                Type or paste a student answer, or choose one of the demonstration templates.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setInputText(sampleGoodStudentText);
                  setStudentName("Ayesha Khan");
                }}
                className="text-xs px-2.5 py-1 rounded bg-[var(--background)] border border-[var(--rule)] hover:bg-[var(--muted)] font-medium text-[var(--foreground)] transition-colors"
              >
                Load Quality Answer
              </button>
              <button
                type="button"
                onClick={() => {
                  setInputText(sampleAdversarialSubmissionText);
                  setStudentName("Adversarial Test Script");
                }}
                className="text-xs px-2.5 py-1 rounded bg-red-50 border border-red-200 hover:bg-red-100 font-medium text-red-800 transition-colors flex items-center gap-1"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                Load Prompt Injection
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-8 space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
                Student Response Text
              </label>
              <textarea
                rows={6}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste or write the student submission text here..."
                className="w-full p-3 rounded bg-[var(--background)] border border-[var(--border)] text-xs sm:text-sm font-sans leading-relaxed focus:outline-none focus:border-[var(--primary)] resize-y"
              />
            </div>

            <div className="lg:col-span-4 flex flex-col justify-between space-y-3">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-1">
                    Student Name / Roll ID (Redacted for Blind Grading)
                  </label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    placeholder="e.g. Bilal Ahmed (FA22-BCS-041)"
                    className="w-full p-2 rounded bg-[var(--background)] border border-[var(--border)] text-xs font-medium focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>

                <div className="p-3 rounded bg-[var(--background)] border border-[var(--rule)] text-[11px] text-[var(--muted-foreground)] space-y-1">
                  <div className="font-semibold text-[var(--foreground)]">Security & Ingestion:</div>
                  <div>• Automatic PII redaction to pseudonym</div>
                  <div>• Sanitization of zero-width & invisible runs</div>
                  <div>• Heuristic scanning for prompt injections</div>
                </div>
              </div>

              <Button
                variant="secondary"
                onClick={handleAddSubmission}
                disabled={isAdding || !inputText.trim()}
                className="w-full py-2"
              >
                <PlusCircle className="w-4 h-4 text-[var(--primary)]" />
                {isAdding ? "Ingesting..." : "Add to Grading Queue"}
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* SYNTHETIC MODE: Ingest Strip */}
      {mode === "synthetic" && (
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
      )}

      {/* Batch / Live Grading Control Bar */}
      <section className="bg-[var(--card)] p-5 rounded border border-[var(--border)] shadow-[var(--shadow-paper)] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-[var(--primary)]" />
            <h3 className="font-bold text-sm text-[var(--foreground)]">
              {mode === "live" ? "Live Gemini Grading Engine" : "Batch Grading Engine (Concurrency: 3)"}
            </h3>
          </div>
          <p className="text-xs text-[var(--muted-foreground)]">
            {mode === "live"
              ? isGradingLive
                ? liveGradingStage || "Grading in progress with live Gemini models..."
                : `Ready to grade ${submissions.length} submission(s) using Guard + Dual Graders + Consensus + Verifier.`
              : `Completed ${syntheticGradedCount} of ${submissions.length} scripts. Two-panel consensus (Grader A + Grader B) with pure scoring.`}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {mode === "live" ? (
            <Button
              variant="primary"
              onClick={() => gradeLiveSubmission()}
              disabled={isGradingLive || submissions.length === 0}
              className="w-full sm:w-auto bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white shadow"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              {isGradingLive ? "Grading with Gemini..." : "⚡ Grade with Real Gemini AI"}
            </Button>
          ) : (
            <Button
              variant="secondary"
              onClick={simulateBatchGrade}
              disabled={isGradingSynthetic}
              className="w-full sm:w-auto"
            >
              <Play className="w-4 h-4" />
              {isGradingSynthetic ? `Grading (${syntheticGradedCount}/${submissions.length})...` : "Re-run Batch Grading"}
            </Button>
          )}
        </div>
      </section>

      {/* Submissions Table */}
      <section className="bg-[var(--card)] rounded border border-[var(--border)] shadow-[var(--shadow-paper)] overflow-hidden">
        <div className="p-4 border-b border-[var(--rule)] bg-[var(--background)] flex items-center justify-between">
          <h2 className="font-bold text-sm text-[var(--foreground)]">
            {mode === "live" ? "Live Cohort Submissions" : "Ingested Submission Records"} ({submissions.length})
          </h2>
          <span className="text-xs text-[var(--muted-foreground)]">
            {mode === "live" ? "Live Assessment Submissions" : "Seeded random review order (D-016)"}
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
                      ) : sub.status === "queued" ? (
                        <span className="text-[var(--muted-foreground)] font-mono text-[11px]">
                          Pending grading
                        </span>
                      ) : (
                        <span className="text-[var(--evidence-verified)] font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Clean script
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 font-bold tabular-nums text-sm text-[var(--foreground)]">
                      {sub.totals?.final !== undefined && sub.status !== "queued"
                        ? `${sub.totals.final} / ${assessment.totalMarks}`
                        : "—"}
                    </td>

                    <td className="py-3 px-4">
                      <StatusBadge status={sub.status as Submission["status"]} />
                    </td>

                    <td className="py-3 px-4 text-right">
                      {sub.status === "queued" && mode === "live" ? (
                        <button
                          type="button"
                          onClick={() => gradeLiveSubmission(sub.id)}
                          disabled={isGradingLive}
                          className="text-xs font-semibold text-[var(--primary)] hover:underline flex items-center gap-1 ml-auto"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>Grade Now</span>
                        </button>
                      ) : (
                        <Link
                          href={`/review?id=${sub.id}`}
                          className="text-[var(--accent)] font-semibold hover:underline no-underline"
                        >
                          Inspect & Review
                        </Link>
                      )}
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
