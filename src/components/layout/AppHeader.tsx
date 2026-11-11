"use client";

import React from "react";
import Link from "next/link";
import { RotateCcw, ShieldCheck, UserCheck } from "lucide-react";
import { useDemo } from "@/lib/store/demo-context";

export function AppHeader() {
  const { course, resetToFixtures } = useDemo();

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

        {/* Center: Active Course & Demo notice */}
        <div className="hidden lg:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded bg-[var(--background)] border border-[var(--rule)] text-xs font-medium">
            <span className="font-semibold text-[var(--foreground)]">{course.code}:</span>
            <span className="text-[var(--muted-foreground)]">{course.title}</span>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[var(--info-bg)] text-[var(--info)] border border-[var(--info)]">
            <ShieldCheck className="w-3.5 h-3.5" />
            Synthetic Demonstration
          </span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={resetToFixtures}
            title="Reset demo data back to baseline"
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] border border-[var(--rule)] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset demo
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
