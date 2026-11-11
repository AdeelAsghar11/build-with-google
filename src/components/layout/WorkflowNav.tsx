"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileCode2,
  FolderUp,
  ClipboardCheck,
  BarChart3,
  ShieldAlert,
  HelpCircle,
  Smartphone,
} from "lucide-react";
import { useDemo } from "@/lib/store/demo-context";

export function WorkflowNav() {
  const pathname = usePathname();
  const { submissions } = useDemo();

  const needsReviewCount = submissions.filter(
    (s) => s.status === "needs_review" || (s.reviewReasons && s.reviewReasons.length > 0 && s.status !== "approved" && s.status !== "released")
  ).length;

  const navItems = [
    { href: "/setup", label: "1. Setup & Rubric", icon: FileCode2 },
    { href: "/submissions", label: "2. Submissions", icon: FolderUp },
    {
      href: "/review",
      label: "3. Review Queue",
      icon: ClipboardCheck,
      badge: needsReviewCount > 0 ? `${needsReviewCount} to review` : undefined,
    },
    { href: "/analytics", label: "4. Analytics", icon: BarChart3 },
    { href: "/trust", label: "5. Trust & Audit", icon: ShieldAlert },
    { href: "/disclosure", label: "6. AI Disclosure", icon: HelpCircle },
    { href: "/r/tok-synth-s01", label: "Student Card (Demo)", icon: Smartphone },
  ];

  return (
    <nav
      aria-label="Workflow Navigation"
      className="w-full bg-[var(--card)] border-b border-[var(--rule)] sticky top-16 z-30"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar py-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-selected={isActive}
                className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors border-b-2 no-underline ${
                  isActive
                    ? "border-[var(--primary)] text-[var(--primary)] font-bold bg-[var(--background)]"
                    : "border-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
                }`}
              >
                <Icon className="w-4 h-4" aria-hidden="true" />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="px-2 py-0.5 text-[11px] rounded-full font-bold bg-[var(--state-needs-review-bg)] text-[var(--state-needs-review)] border border-[var(--state-needs-review)]">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
