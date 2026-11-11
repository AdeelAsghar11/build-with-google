"use client";

import React, { useState } from "react";
import { useDemo } from "@/lib/store/demo-context";
import { Button } from "@/components/ui/Button";
import { StatusBadge, BandBadge } from "@/components/ui/Badge";
import { STRICTNESS_TABLE } from "@/lib/pipeline/score";
import type { Strictness, Band } from "@/lib/contracts";
import {
  CheckCircle2,
  Sliders,
  ChevronDown,
  ChevronUp,
  FileCheck,
  BookOpen,
  Layers,
} from "lucide-react";

export default function SetupPage() {
  const { course, assessment, strictness, setStrictness } = useDemo();
  const [expandedCriteria, setExpandedCriteria] = useState<Record<string, boolean>>({
    C1: true,
    C2: false,
    C3: false,
    C4: false,
  });
  const [isApproved, setIsApproved] = useState(assessment.rubric?.status === "approved");

  const toggleExpand = (id: string) => {
    setExpandedCriteria((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const criteria = assessment.rubric?.criteria || [];
  const criteriaSum = criteria.reduce((acc, c) => acc + c.maxMarks, 0);
  const isValidTotal = criteriaSum === assessment.totalMarks;

  const strictnessLabels: Record<Strictness, string> = {
    1: "Lenient (Higher partial credit)",
    2: "Mildly Lenient",
    3: "Balanced (Recommended default)",
    4: "Mildly Strict",
    5: "Strict (Zero credit for minimal)",
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--rule)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
              Stage 1 of 5
            </span>
            <span className="text-xs text-[var(--muted-foreground)]">·</span>
            <span className="text-xs font-semibold text-[var(--primary)]">{course.title} ({course.code})</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
            Assessment Setup & Rubric Approval Gate
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status={isApproved ? "approved" : "draft_ready"} />
          <span className="text-xs text-[var(--muted-foreground)] font-mono">
            Rubric v{assessment.rubric?.version || 1}.0.0
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Left Pane: Assessment Question & Rubric Compiler (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Question & Reference Answer */}
          <section className="bg-[var(--card)] p-6 rounded border border-[var(--border)] shadow-[var(--shadow-paper)] space-y-4">
            <h2 className="text-lg font-bold tracking-tight text-[var(--foreground)] flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[var(--primary)]" />
              <span>Assessment Details</span>
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-1">
                  Title & Denominator
                </label>
                <div className="flex items-center justify-between p-3 rounded bg-[var(--background)] border border-[var(--border)]">
                  <span className="font-semibold text-sm">{assessment.title}</span>
                  <span className="text-xs font-bold font-mono px-2 py-1 rounded bg-[var(--card)] border border-[var(--rule)]">
                    {assessment.totalMarks} Marks Total
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-1">
                  Question Prompt (Presented to Students)
                </label>
                <div className="p-3 rounded bg-[var(--background)] border border-[var(--border)] text-sm leading-relaxed">
                  {assessment.question}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)] mb-1">
                  Reference Solution (For Evidence Matching)
                </label>
                <div className="p-3 rounded bg-[var(--background)] border border-[var(--border)] text-xs text-[var(--muted-foreground)] leading-relaxed max-h-36 overflow-y-auto">
                  {assessment.referenceAnswer}
                </div>
              </div>
            </div>
          </section>

          {/* Compiled Rubric Criteria Table */}
          <section className="bg-[var(--card)] p-6 rounded border border-[var(--border)] shadow-[var(--shadow-paper)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-[var(--foreground)] flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-[var(--primary)]" />
                  <span>Compiled Criteria ({criteria.length})</span>
                </h2>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                  Pre-compiled schema with 5 ordinal band descriptors. Code calculates marks from these bands.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold">Sum: {criteriaSum} / {assessment.totalMarks}</span>
                {isValidTotal ? (
                  <CheckCircle2 className="w-4 h-4 text-[var(--evidence-verified)]" />
                ) : (
                  <span className="text-xs font-bold text-[var(--error)]">Sum mismatch</span>
                )}
              </div>
            </div>

            <div className="space-y-3">
              {criteria.map((c) => {
                const isExpanded = expandedCriteria[c.id];
                return (
                  <div
                    key={c.id}
                    className="border border-[var(--border)] rounded bg-[var(--background)] overflow-hidden"
                  >
                    <div
                      onClick={() => toggleExpand(c.id)}
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-[var(--muted)] transition-colors select-none"
                    >
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-0.5 text-xs font-bold font-mono rounded bg-[var(--card)] border border-[var(--border)]">
                          {c.id}
                        </span>
                        <div>
                          <div className="font-bold text-sm text-[var(--foreground)]">{c.title}</div>
                          <div className="text-xs text-[var(--muted-foreground)] flex items-center gap-2 mt-0.5">
                            <span>Mapped to {c.cloId}</span>
                            <span>·</span>
                            <span className="capitalize">{c.dimension}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className="text-xs font-bold font-mono px-2.5 py-1 rounded bg-[var(--card)] border border-[var(--rule)]">
                          {c.maxMarks} Marks
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-[var(--muted-foreground)]" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-[var(--muted-foreground)]" />
                        )}
                      </div>
                    </div>

                    {/* Expandable Descriptors */}
                    {isExpanded && (
                      <div className="p-4 border-t border-[var(--rule)] bg-[var(--card)] space-y-3 text-xs">
                        <div>
                          <div className="font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-1.5">
                            Required Elements:
                          </div>
                          <ul className="list-disc list-inside space-y-0.5 text-[var(--foreground)]">
                            {c.requiredElements.map((elem, idx) => (
                              <li key={idx}>{elem}</li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <div className="font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-2">
                            5-Band Ordinal Descriptors:
                          </div>
                          <div className="grid grid-cols-1 gap-2">
                            {(["FULL", "MOSTLY", "PARTIAL", "MINIMAL", "NONE"] as Band[]).map((b) => (
                              <div
                                key={b}
                                className="flex items-start gap-3 p-2 rounded bg-[var(--background)] border border-[var(--rule)]"
                              >
                                <BandBadge band={b} />
                                <span className="text-xs leading-relaxed text-[var(--foreground)] flex-1">
                                  {c.bandDescriptors[b]}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Approval Gate Footer */}
            <div className="pt-4 border-t border-[var(--rule)] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-[var(--muted-foreground)]">
                {isApproved
                  ? "✓ Rubric approved and frozen. Submissions are graded against this immutable version."
                  : "Review descriptors and verify sum before approving."}
              </div>

              <Button
                variant={isApproved ? "secondary" : "primary"}
                onClick={() => setIsApproved(true)}
                disabled={!isValidTotal}
              >
                {isApproved ? "Rubric Approved (Frozen)" : "Approve Rubric (Freeze Version)"}
              </Button>
            </div>
          </section>
        </div>

        {/* Support Right Pane: Strictness Policy & CLO Mappings (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Partial-Credit Strictness Slider */}
          <section className="bg-[var(--card)] p-6 rounded border border-[var(--border)] shadow-[var(--shadow-paper)] space-y-4">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[var(--primary)]" />
              <h2 className="text-base font-bold tracking-tight text-[var(--foreground)]">
                Partial-Credit Policy
              </h2>
            </div>

            <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              Strictness is pure deterministic math, not a model prompt instruction (D-005). Adjusting the slider selects a column in the partial-credit fraction table:
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--foreground)]">Policy Level:</span>
                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-[var(--primary)] text-[var(--primary-foreground)]">
                  Level {strictness} of 5
                </span>
              </div>

              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={strictness}
                onChange={(e) => setStrictness(parseInt(e.target.value) as Strictness)}
                aria-label="Partial-credit policy"
                aria-valuetext={`${strictness}, ${strictnessLabels[strictness]}`}
                className="w-full accent-[var(--primary)] cursor-pointer h-2 bg-[var(--muted)] rounded-lg"
              />

              <div className="text-xs font-semibold text-[var(--foreground)] text-center">
                {strictnessLabels[strictness]}
              </div>

              {/* Live Fraction Table for Current Strictness */}
              <div className="mt-4 pt-4 border-t border-[var(--rule)] space-y-2">
                <div className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase tracking-wider">
                  Active Multipliers (Level {strictness}):
                </div>
                <div className="grid grid-cols-5 gap-1 text-center font-mono text-[11px]">
                  {(["FULL", "MOSTLY", "PARTIAL", "MINIMAL", "NONE"] as Band[]).map((b) => (
                    <div key={b} className="p-1 rounded bg-[var(--background)] border border-[var(--rule)]">
                      <div className="font-bold text-[9px] text-[var(--muted-foreground)]">{b.slice(0, 4)}</div>
                      <div className="font-bold text-[var(--foreground)] mt-0.5">
                        {STRICTNESS_TABLE[strictness][b] * 100}%
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-[var(--muted-foreground)] italic mt-2">
                  Notice: FULL always equals 100% and NONE always equals 0%. The slider calibrates partial credit only.
                </p>
              </div>
            </div>
          </section>

          {/* Course CLO & PLO Context */}
          <section className="bg-[var(--card)] p-6 rounded border border-[var(--border)] shadow-[var(--shadow-paper)] space-y-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[var(--primary)]" />
              <h2 className="text-base font-bold tracking-tight text-[var(--foreground)]">
                Course Learning Outcomes
              </h2>
            </div>

            <div className="space-y-3">
              {course.clos.map((clo) => (
                <div
                  key={clo.id}
                  className="p-3 rounded bg-[var(--background)] border border-[var(--rule)] space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="font-mono text-[var(--primary)]">{clo.id}</span>
                    <span className="text-[var(--muted-foreground)] font-normal">Target: 65% attainment</span>
                  </div>
                  <p className="text-[var(--foreground)] leading-relaxed">{clo.text}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
