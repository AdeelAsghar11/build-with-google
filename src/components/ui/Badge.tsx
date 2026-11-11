import React from "react";
import {
  Check,
  ClipboardList,
  EyeOff,
  Files,
  FileText,
  Flag,
  Quote,
  ShieldAlert,
  Split,
  CircleHelp,
  CircleCheck,
  Send,
} from "lucide-react";
import type { Band, ReviewReasonCode, SubmissionStatus } from "@/lib/contracts";

export interface BandBadgeProps {
  band: Band;
  showOrdinal?: boolean;
}

export function BandBadge({ band, showOrdinal = false }: BandBadgeProps) {
  const bandConfig = {
    FULL: { label: "Full", ordinal: "4/4", bg: "var(--band-full)", text: "var(--card)", border: "var(--border)" },
    MOSTLY: { label: "Mostly", ordinal: "3/4", bg: "var(--band-mostly)", text: "var(--card)", border: "var(--border)" },
    PARTIAL: { label: "Partial", ordinal: "2/4", bg: "var(--band-partial)", text: "var(--foreground)", border: "var(--border)" },
    MINIMAL: { label: "Minimal", ordinal: "1/4", bg: "var(--band-minimal)", text: "var(--foreground)", border: "var(--border)" },
    NONE: { label: "None", ordinal: "0/4", bg: "var(--band-none)", text: "var(--foreground)", border: "var(--border)" },
  }[band] || { label: band, ordinal: "", bg: "var(--muted)", text: "var(--foreground)", border: "var(--border)" };

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"
      style={{
        backgroundColor: bandConfig.bg,
        color: bandConfig.text,
        border: `1px solid ${bandConfig.border}`,
      }}
    >
      <span>{bandConfig.label}</span>
      {showOrdinal && <span className="opacity-80 text-[10px]">({bandConfig.ordinal})</span>}
    </span>
  );
}

export interface StatusBadgeProps {
  status: SubmissionStatus | "draft_ready";
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const configs = {
    queued: { label: "Queued", icon: null, bg: "var(--muted)", text: "var(--muted-foreground)" },
    processing: { label: "Processing", icon: null, bg: "var(--muted)", text: "var(--primary)" },
    graded_clean: { label: "Draft ready", icon: CircleCheck, bg: "var(--state-approved-bg)", text: "var(--state-approved)" },
    draft_ready: { label: "Draft ready", icon: CircleCheck, bg: "var(--state-approved-bg)", text: "var(--state-approved)" },
    needs_review: { label: "Needs review", icon: ClipboardList, bg: "var(--state-needs-review-bg)", text: "var(--state-needs-review)" },
    approved: { label: "Teacher approved", icon: Check, bg: "var(--state-approved-bg)", text: "var(--state-approved)" },
    released: { label: "Released", icon: Send, bg: "var(--state-released-bg)", text: "var(--state-released)" },
    error: { label: "Error", icon: null, bg: "var(--error-bg)", text: "var(--error)" },
  }[status];

  const Icon = configs?.icon;

  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
      style={{
        backgroundColor: configs?.bg,
        color: configs?.text,
        border: `1px solid ${configs?.text}`,
      }}
    >
      {Icon && <Icon className="w-3.5 h-3.5" aria-hidden="true" />}
      <span>{configs?.label}</span>
    </span>
  );
}

export interface ReasonBadgeProps {
  code: ReviewReasonCode;
  customLabel?: string;
}

export function ReasonBadge({ code, customLabel }: ReasonBadgeProps) {
  const reasonMap: Record<
    ReviewReasonCode,
    { label: string; icon: React.ComponentType<{ className?: string }>; bg: string; color: string }
  > = {
    HIDDEN_TEXT: { label: "Hidden text found", icon: EyeOff, bg: "var(--flag-integrity-bg)", color: "var(--flag-integrity)" },
    HEURISTIC: { label: "Grading request found", icon: Flag, bg: "var(--flag-integrity-bg)", color: "var(--flag-integrity)" },
    GUARD: { label: "Possible grading instruction", icon: Flag, bg: "var(--flag-integrity-bg)", color: "var(--flag-integrity)" },
    QUARANTINE: { label: "Text excluded from grading", icon: ShieldAlert, bg: "var(--flag-integrity-bg)", color: "var(--flag-integrity)" },
    CANARY: { label: "Grader noticed an instruction", icon: Flag, bg: "var(--flag-integrity-bg)", color: "var(--flag-integrity)" },
    SPLIT: { label: "Graders disagree", icon: Split, bg: "var(--state-needs-review-bg)", color: "var(--state-needs-review)" },
    UNSUPPORTED: { label: "Evidence not verified", icon: Quote, bg: "var(--state-needs-review-bg)", color: "var(--state-needs-review)" },
    LOW_CONFIDENCE: { label: "Uncertain judgement", icon: CircleHelp, bg: "var(--state-needs-review-bg)", color: "var(--state-needs-review)" },
    SHORT_TEXT: { label: "Little text extracted", icon: FileText, bg: "var(--state-needs-review-bg)", color: "var(--state-needs-review)" },
    PARSE_ERROR: { label: "File could not be read", icon: FileText, bg: "var(--error-bg)", color: "var(--error)" },
    COLLUSION: { label: "High similarity", icon: Files, bg: "var(--flag-integrity-bg)", color: "var(--flag-integrity)" },
    ANCHOR: { label: "Blind calibration script", icon: Flag, bg: "var(--info-bg)", color: "var(--info)" },
    SPOT_CHECK: { label: "Blind spot-check", icon: Flag, bg: "var(--info-bg)", color: "var(--info)" },
  };

  const item = reasonMap[code] || {
    label: code,
    icon: Flag,
    bg: "var(--muted)",
    color: "var(--foreground)",
  };

  const Icon = item.icon;

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{
        backgroundColor: item.bg,
        color: item.color,
        border: `1px solid ${item.color}`,
      }}
    >
      <Icon className="w-3.5 h-3.5" aria-hidden="true" />
      <span>{customLabel || item.label}</span>
    </span>
  );
}
