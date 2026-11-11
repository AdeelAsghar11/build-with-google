"use client";

import React from "react";
import Link from "next/link";
import { RotateCcw, ShieldCheck, UserCheck, Sparkles, Activity } from "lucide-react";
import { useDemo } from "@/lib/store/demo-context";

export function AppHeader() {
  const {
    mode,
    setMode,
    course,
    resetToFixtures,
    isGradingLive,
    liveGradingStage,
  } = useDemo();

  return (
    <header className="w-full bg-[var(--card)] border-b border-[var(--rule)] sticky top-0 z-40 shadow-[var(--shadow-paper)]">
      <div className="max-w-[1440px] mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Brand & Metaphor */}
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-baseline gap-2.5 no-underline group">
            <span className="font-[family-name:var(--font-heading)] text-2xl font-bold tracking-tight text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
              Moderator
            </span>
          </Link>
          <div className="hidden md:block h-4 w-px bg-[var(--rule)]" />
          <span className="hidden md:inline-block text-xs text-[var(--muted-foreground)] font-medium">
            Teacher-assisted, bias-audited AI grading
          </span>
        </div>

        {/* Center: Mode Switcher (Synthetic Demo vs Real Live Pipeline) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-0.5 rounded-lg bg-[var(--background)] border border-[var(--rule)] shadow-inner">
            <button
              onClick={() => setMode("synthetic")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                mode === "synthetic"
                  ? "bg-[var(--card)] text-[var(--foreground)] shadow-sm border border-[var(--border)]"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
              title="12 benchmark fixtures with 12 planted security and collusion cases"
            >
              <ShieldCheck className={`w-3.5 h-3.5 ${mode === "synthetic" ? "text-[var(--primary)]" : ""}`} />
              <span>Synthetic Cohort</span>
            </button>

            <button
              onClick={() => setMode("live")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                mode === "live"
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
              title="Run real end-to-end AI grading with live Gemini API keys"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Real Live Pipeline</span>
              <span className="ml-1 px-1.5 py-0.2 rounded text-[9px] uppercase tracking-wider font-mono font-bold bg-amber-400 text-stone-900">
                Gemini
              </span>
            </button>
          </div>

          {/* Live grading status pill */}
          {isGradingLive && (
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-300 text-xs font-medium animate-pulse">
              <Activity className="w-3.5 h-3.5 text-amber-600 animate-spin" />
              <span>{liveGradingStage || "AI Grading in progress..."}</span>
            </div>
          )}
        </div>

        {/* Right Actions: Course, Reset, Teacher Identity */}
        <div className="flex items-center gap-3">
          <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded bg-[var(--background)] border border-[var(--rule)] text-xs font-medium">
            <span className="font-semibold text-[var(--foreground)]">{course.code}:</span>
            <span className="text-[var(--muted-foreground)]">{course.title}</span>
          </div>

          <button
            onClick={resetToFixtures}
            title={mode === "synthetic" ? "Reset synthetic fixtures back to baseline" : "Reset live assessment to default template"}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] border border-[var(--rule)] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>

          <div className="flex items-center gap-2 px-3 py-1 rounded bg-[var(--background)] border border-[var(--border)] text-xs">
            <UserCheck className="w-3.5 h-3.5 text-[var(--primary)]" />
            <span className="font-semibold text-[var(--foreground)]">Dr. Tariq Mahmood</span>
            <span className="text-[10px] uppercase font-bold text-[var(--primary)] bg-[var(--evidence-verified-bg)] px-1.5 py-0.2 rounded">
              Teacher
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
