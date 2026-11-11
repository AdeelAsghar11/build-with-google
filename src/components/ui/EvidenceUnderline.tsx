import React from "react";
import { CheckCircle2, AlertTriangle, ShieldAlert } from "lucide-react";

export interface EvidenceUnderlineProps {
  quote: string;
  kind?: "verified" | "fuzzy" | "error" | "quarantined";
  criterionId?: string;
  onSelectCriterion?: (criterionId: string) => void;
}

export function EvidenceUnderline({
  quote,
  kind = "verified",
  criterionId,
  onSelectCriterion,
}: EvidenceUnderlineProps) {
  const getBadge = () => {
    switch (kind) {
      case "verified":
        return {
          label: criterionId ? `${criterionId} · Verified quote` : "Verified quote",
          icon: CheckCircle2,
          textColor: "var(--evidence-verified)",
          bg: "var(--evidence-verified-bg)",
        };
      case "fuzzy":
        return {
          label: criterionId ? `${criterionId} · Approximate match` : "Approximate match",
          icon: AlertTriangle,
          textColor: "var(--partial)",
          bg: "var(--partial-bg)",
        };
      case "quarantined":
        return {
          label: "Quarantined instruction",
          icon: ShieldAlert,
          textColor: "var(--flag-integrity)",
          bg: "var(--flag-integrity-bg)",
        };
      case "error":
        return {
          label: "Misconception noted",
          icon: AlertTriangle,
          textColor: "var(--error)",
          bg: "var(--error-bg)",
        };
    }
  };

  const badge = getBadge();
  const Icon = badge.icon;

  return (
    <span className="inline">
      <mark
        className="moderator-quote rounded-sm px-1 py-0.5 font-medium transition-colors"
        data-kind={kind}
      >
        {quote}
      </mark>
      <button
        type="button"
        onClick={() => criterionId && onSelectCriterion?.(criterionId)}
        title={criterionId ? `Jump to criterion ${criterionId}` : undefined}
        className="inline-flex items-center gap-1 ml-1.5 px-2 py-0.5 text-[11px] font-bold rounded cursor-pointer border select-none align-middle hover:opacity-90"
        style={{
          color: badge.textColor,
          backgroundColor: badge.bg,
          borderColor: badge.textColor,
        }}
      >
        <Icon className="w-3 h-3" aria-hidden="true" />
        <span>{badge.label}</span>
      </button>
    </span>
  );
}
