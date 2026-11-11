"use client";

import React from "react";
import Link from "next/link";
import { useDemo } from "@/lib/store/demo-context";
import { Info, X } from "lucide-react";

export function AppFooter() {
  const { toastMessage, clearToast } = useDemo();

  return (
    <>
      {/* Toast Notification Container (Restrained, per design.md) */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 max-w-md bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)] rounded shadow-[var(--shadow-overlay)] p-4 flex items-start gap-3 transition-opacity"
        >
          <Info className="w-5 h-5 text-[var(--primary)] flex-shrink-0 mt-0.5" />
          <p className="text-sm font-medium leading-snug flex-1 m-0">{toastMessage}</p>
          <button
            onClick={clearToast}
            aria-label="Dismiss notification"
            className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <footer className="w-full bg-[var(--card)] border-t border-[var(--rule)] py-8 mt-12 text-xs text-[var(--muted-foreground)]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <span className="font-semibold text-[var(--foreground)]">Moderator</span>
            <span className="hidden sm:inline">·</span>
            <span>Build with Google Hackathon 2026 · COMSATS</span>
            <span className="hidden sm:inline">·</span>
            <span className="text-[var(--primary)] font-medium">UN SDG 4: Quality Education</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/disclosure" className="text-[var(--accent)] hover:underline">
              AI Disclosure
            </Link>
            <Link href="/trust" className="text-[var(--accent)] hover:underline">
              Trust & Audit Ledger
            </Link>
            <span className="text-[var(--muted-foreground)]">
              All student scripts and roster names are synthetic
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
