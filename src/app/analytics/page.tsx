"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useDemo } from "@/lib/store/demo-context";
import { Button } from "@/components/ui/Button";
import { ReasonBadge } from "@/components/ui/Badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Sliders,
  Files,
  ArrowRight,
  ClipboardList,
} from "lucide-react";
import type { Strictness } from "@/lib/contracts";

export default function AnalyticsPage() {
  const { assessment, submissions, analytics, collusionPairs, strictness, setStrictness } = useDemo();

  // Recompute histogram bins based on current submission marks
  const histogramData = useMemo(() => {
    const bins = [
      { range: "0–4", count: 0 },
      { range: "5–8", count: 0 },
      { range: "9–12", count: 0 },
      { range: "13–16", count: 0 },
      { range: "17–20", count: 0 },
    ];

    submissions.forEach((s) => {
      const mark = s.totals?.final ?? 0;
      if (mark < 5) bins[0].count++;
      else if (mark < 9) bins[1].count++;
      else if (mark < 13) bins[2].count++;
      else if (mark < 17) bins[3].count++;
      else bins[4].count++;
    });

    return bins;
  }, [submissions]);

  // Recompute grade counts based on current submission marks
  const gradeData = useMemo(() => {
    const counts = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    submissions.forEach((s) => {
      const pct = ((s.totals?.final ?? 0) / assessment.totalMarks) * 100;
      if (pct >= 85) counts.A++;
      else if (pct >= 70) counts.B++;
      else if (pct >= 55) counts.C++;
      else if (pct >= 50) counts.D++;
      else counts.F++;
    });

    return [
      { grade: "A (85%+)", count: counts.A },
      { grade: "B (70–84%)", count: counts.B },
      { grade: "C (55–69%)", count: counts.C },
      { grade: "D (50–54%)", count: counts.D },
      { grade: "F (<50%)", count: counts.F },
    ];
  }, [submissions, assessment.totalMarks]);

  // CLO attainment calculations
  const cloData = useMemo(() => {
    return [
      {
        id: "CLO-1",
        title: "Concept of Overfitting",
        target: 65,
        attainmentPct: 83,
        attainedCount: 10,
        total: 12,
      },
      {
        id: "CLO-2",
        title: "Detection Methods",
        target: 65,
        attainmentPct: 75,
        attainedCount: 9,
        total: 12,
      },
      {
        id: "CLO-3",
        title: "Reduction & Regularization",
        target: 65,
        attainmentPct: 67,
        attainedCount: 8,
        total: 12,
      },
    ];
  }, []);

  // Collusion pair details
  const pairItem = collusionPairs[0];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--rule)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
              Stage 4 of 5
            </span>
            <span className="text-xs text-[var(--muted-foreground)]">·</span>
            <span className="text-xs font-semibold text-[var(--primary)]">{assessment.title}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)]">
            Class Analytics & Attainment Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/review" className="no-underline">
            <Button variant="secondary">
              <ClipboardList className="w-4 h-4" />
              Open Review Queue
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Statistics Strip per design.md §5 */}
      <section className="bg-[var(--card)] p-6 rounded border border-[var(--border)] shadow-[var(--shadow-paper)]">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
            Cohort Performance Summary (N = {submissions.length} Submissions)
          </span>
          <span className="text-xs text-[var(--muted-foreground)]">
            Updated instantly with partial-credit slider
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="p-3 rounded bg-[var(--background)] border border-[var(--rule)]">
            <div className="text-xs font-semibold text-[var(--muted-foreground)] uppercase">Class Mean</div>
            <div className="text-2xl font-bold tabular-nums text-[var(--foreground)] mt-1">
              {analytics.kpis.mean} <span className="text-xs text-[var(--muted-foreground)] font-normal">/ 20</span>
            </div>
            <div className="text-[11px] text-[var(--muted-foreground)] mt-0.5">Arithmetic average</div>
          </div>

          <div className="p-3 rounded bg-[var(--background)] border border-[var(--rule)]">
            <div className="text-xs font-semibold text-[var(--muted-foreground)] uppercase">Median</div>
            <div className="text-2xl font-bold tabular-nums text-[var(--foreground)] mt-1">
              {analytics.kpis.median} <span className="text-xs text-[var(--muted-foreground)] font-normal">/ 20</span>
            </div>
            <div className="text-[11px] text-[var(--muted-foreground)] mt-0.5">50th percentile mark</div>
          </div>

          <div className="p-3 rounded bg-[var(--background)] border border-[var(--rule)]">
            <div className="text-xs font-semibold text-[var(--muted-foreground)] uppercase">Std. Dev.</div>
            <div className="text-2xl font-bold tabular-nums text-[var(--foreground)] mt-1">
              {analytics.kpis.sd}
            </div>
            <div className="text-[11px] text-[var(--muted-foreground)] mt-0.5">Cohort dispersion</div>
          </div>

          <div className="p-3 rounded bg-[var(--background)] border border-[var(--rule)]">
            <div className="text-xs font-semibold text-[var(--muted-foreground)] uppercase">Pass Rate</div>
            <div className="text-2xl font-bold tabular-nums text-[var(--primary)] mt-1">
              {analytics.kpis.passRatePct}%
            </div>
            <div className="text-[11px] text-[var(--muted-foreground)] mt-0.5">≥ 10.0 marks threshold</div>
          </div>

          <div className="p-3 rounded bg-[var(--background)] border border-[var(--rule)]">
            <div className="text-xs font-semibold text-[var(--muted-foreground)] uppercase">Strictness</div>
            <div className="text-2xl font-bold tabular-nums text-[var(--foreground)] mt-1">
              Level {strictness}
            </div>
            <div className="text-[11px] text-[var(--muted-foreground)] mt-0.5">Deterministic policy</div>
          </div>
        </div>

        {/* Live Strictness Slider Control within Analytics */}
        <div className="mt-6 pt-5 border-t border-[var(--rule)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[var(--primary)]" />
            <span className="text-xs font-bold text-[var(--foreground)]">
              Live Partial-Credit Policy Simulation:
            </span>
          </div>

          <div className="flex items-center gap-4 flex-1 max-w-md">
            <span className="text-xs text-[var(--muted-foreground)]">1 (Lenient)</span>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={strictness}
              onChange={(e) => setStrictness(parseInt(e.target.value) as Strictness)}
              aria-label="Adjust strictness policy"
              className="w-full accent-[var(--primary)] cursor-pointer h-2 bg-[var(--muted)] rounded-lg"
            />
            <span className="text-xs text-[var(--muted-foreground)]">5 (Strict)</span>
          </div>

          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-[var(--background)] border border-[var(--border)]">
            Active: Level {strictness}/5
          </span>
        </div>
      </section>

      {/* Charts Grid: Histogram (8 cols) & Grade Distribution (4 cols) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Score Distribution Histogram */}
        <div className="lg:col-span-8 bg-[var(--card)] p-6 rounded border border-[var(--border)] shadow-[var(--shadow-paper)] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[var(--foreground)]">Marks Distribution Histogram</h2>
              <p className="text-xs text-[var(--muted-foreground)]">
                Student count across 5 score brackets with mean & median indicators
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 font-semibold text-[var(--primary)]">
                <span className="w-2.5 h-2.5 rounded-sm bg-[var(--chart-1)]" /> Mean ({analytics.kpis.mean})
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-[var(--accent)]">
                <span className="w-2.5 h-2.5 rounded-sm bg-[var(--chart-2)]" /> Median ({analytics.kpis.median})
              </span>
            </div>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={histogramData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 4" stroke="var(--rule)" vertical={false} />
                <XAxis dataKey="range" stroke="var(--foreground)" fontSize={12} />
                <YAxis allowDecimals={false} stroke="var(--foreground)" fontSize={12} />
                <Tooltip
                  cursor={{ fill: "var(--muted)", opacity: 0.5 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[var(--card)] border border-[var(--border)] p-2 rounded shadow-sm text-xs">
                          <p className="font-bold">{payload[0].payload.range} Marks</p>
                          <p className="text-[var(--primary)] font-semibold">{payload[0].value} students</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" fill="var(--chart-1)" isAnimationActive={false} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grade Distribution Horizontal Bars */}
        <section className="lg:col-span-4 bg-[var(--card)] p-6 rounded border border-[var(--border)] shadow-[var(--shadow-paper)] space-y-4">
          <div>
            <h2 className="text-base font-bold text-[var(--foreground)]">Grade Categories</h2>
            <p className="text-xs text-[var(--muted-foreground)]">Counts across university grade bands</p>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={gradeData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 4" stroke="var(--rule)" horizontal={false} />
                <XAxis type="number" allowDecimals={false} stroke="var(--foreground)" fontSize={12} />
                <YAxis dataKey="grade" type="category" stroke="var(--foreground)" fontSize={11} width={80} />
                <Tooltip
                  cursor={{ fill: "var(--muted)", opacity: 0.5 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-[var(--card)] border border-[var(--border)] p-2 rounded shadow-sm text-xs">
                          <p className="font-bold">{payload[0].payload.grade}</p>
                          <p className="text-[var(--accent)] font-semibold">{payload[0].value} students</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" fill="var(--chart-2)" isAnimationActive={false} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </section>

      {/* CLO Attainment Bars & Attention List (7 cols / 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* CLO Attainment Bars */}
        <section className="lg:col-span-7 bg-[var(--card)] p-6 rounded border border-[var(--border)] shadow-[var(--shadow-paper)] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[var(--foreground)]">
                Course Learning Outcome (CLO) Attainment
              </h2>
              <p className="text-xs text-[var(--muted-foreground)]">
                Percent of students meeting the 65% attainment target per outcome
              </p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-[var(--background)] border border-[var(--rule)]">
              Target: 65%
            </span>
          </div>

          <div className="space-y-4 pt-2">
            {cloData.map((clo) => {
              const meetsTarget = clo.attainmentPct >= clo.target;
              return (
                <div key={clo.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[var(--foreground)]">
                      {clo.id}: {clo.title}
                    </span>
                    <span className="font-mono tabular-nums font-semibold">
                      {clo.attainmentPct}% ({clo.attainedCount}/{clo.total} students)
                    </span>
                  </div>

                  <div className="w-full bg-[var(--muted)] rounded-full h-3 overflow-hidden relative">
                    <div
                      className={`h-full rounded-full transition-all ${
                        meetsTarget ? "bg-[var(--evidence-verified)]" : "bg-[var(--accent)]"
                      }`}
                      style={{ width: `${clo.attainmentPct}%` }}
                    />
                    {/* Class target marker */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-[var(--foreground)] border-dashed"
                      style={{ left: `${clo.target}%` }}
                      title="Target threshold (65%)"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Students Needing Attention (5 cols) */}
        <section className="lg:col-span-5 bg-[var(--card)] p-6 rounded border border-[var(--border)] shadow-[var(--shadow-paper)] space-y-4">
          <div>
            <h2 className="text-base font-bold text-[var(--foreground)]">
              Students Needing Attention
            </h2>
            <p className="text-xs text-[var(--muted-foreground)]">
              Flagged integrity cases and low scoring submissions
            </p>
          </div>

          <div className="space-y-2">
            {submissions
              .filter((s) => (s.totals?.final ?? 20) < 10 || (s.reviewReasons && s.reviewReasons.length > 0))
              .slice(0, 4)
              .map((sub) => (
                <Link
                  key={sub.id}
                  href={`/review?id=${sub.id}`}
                  className="p-3 rounded bg-[var(--background)] border border-[var(--border)] text-xs flex items-center justify-between hover:bg-[var(--muted)] transition-colors no-underline text-[var(--foreground)] block"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold font-mono">{sub.pseudonym}</span>
                      <span className="font-semibold tabular-nums text-[var(--muted-foreground)]">
                        {sub.totals?.final ?? 0} / 20.0
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {sub.reviewReasons?.map((r) => (
                        <ReasonBadge key={r.code} code={r.code} />
                      ))}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-[var(--accent)] flex-shrink-0" />
                </Link>
              ))}
          </div>
        </section>
      </div>

      {/* Within-Class Collusion Analysis Panel (Full Width) */}
      <section className="bg-[var(--card)] p-6 rounded border border-[var(--border)] shadow-[var(--shadow-paper)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Files className="w-5 h-5 text-[var(--flag-integrity)]" />
              <h2 className="text-lg font-bold text-[var(--foreground)]">
                Within-Batch Similarity & Collusion Analysis
              </h2>
            </div>
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
              Lexical 5-shingles containment and embedding cosine similarity across the uploaded cohort only (D-006). Not an external web plagiarism search.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded bg-[var(--flag-integrity-bg)] text-[var(--flag-integrity)] border border-[var(--flag-integrity)]">
              1 High-Similarity Pair Flagged
            </span>
          </div>
        </div>

        {/* Side-by-side comparison for high-similarity pair */}
        {pairItem && (
          <div className="border border-[var(--border)] rounded bg-[var(--background)] p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[var(--rule)] gap-2">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-[var(--card)] border border-[var(--border)]">
                  Pair: {pairItem.a} & {pairItem.b}
                </span>
                <span className="text-xs text-[var(--muted-foreground)]">
                  Containment: <strong className="text-[var(--flag-integrity)]">{Math.round(pairItem.containment * 100)}%</strong> · Cosine: <strong className="text-[var(--flag-integrity)]">{Math.round(pairItem.cosine * 100)}%</strong>
                </span>
              </div>

              <span className="text-xs text-[var(--flag-integrity)] font-semibold">
                Needs Teacher Judgement (Misconduct not asserted)
              </span>
            </div>

            {/* Side by side extracts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed">
              <div className="p-3 rounded bg-[var(--card)] border border-[var(--rule)] space-y-2">
                <div className="font-bold text-[var(--foreground)] flex items-center justify-between">
                  <span>Extract from {pairItem.a}</span>
                  <span className="font-mono text-[11px] text-[var(--muted-foreground)]">Shared passage</span>
                </div>
                <p className="p-2 rounded bg-[var(--partial-bg)] border border-[var(--partial)] text-[var(--foreground)]">
                  &ldquo;{pairItem.sharedPassages?.[0]?.textA || "Overfitting is fundamentally an issue of high model variance where the hypothesis function fits the specific training sample noise rather than the population signal."}&rdquo;
                </p>
              </div>

              <div className="p-3 rounded bg-[var(--card)] border border-[var(--rule)] space-y-2">
                <div className="font-bold text-[var(--foreground)] flex items-center justify-between">
                  <span>Extract from {pairItem.b}</span>
                  <span className="font-mono text-[11px] text-[var(--muted-foreground)]">Shared passage</span>
                </div>
                <p className="p-2 rounded bg-[var(--partial-bg)] border border-[var(--partial)] text-[var(--foreground)]">
                  &ldquo;{pairItem.sharedPassages?.[0]?.textB || "Overfitting is an issue of high model variance where the hypothesis function fits specific training sample noise rather than population signal."}&rdquo;
                </p>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
