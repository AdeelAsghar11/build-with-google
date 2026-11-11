import React from "react";
import {
  ShieldCheck,
  Cpu,
  UserCheck,
  Lock,
  Calculator,
  AlertCircle,
} from "lucide-react";

export default function DisclosurePage() {
  const modelTable = [
    {
      role: "Guard (Prompt Injection Screening)",
      model: "gemma-2-9b-it (Google Gemma)",
      promptVersion: "guard.v1.md",
      purpose: "Screens student submissions for instructions attempting to manipulate grading. Quarantines flagged spans.",
    },
    {
      role: "Grader A (Evidence-First Stance)",
      model: "gemini-2.5-pro",
      promptVersion: "grader_a.v1.md",
      purpose: "Identifies demonstrated understanding and cites verbatim student text supporting rubric band.",
    },
    {
      role: "Grader B (Deficit-First Stance)",
      model: "gemini-2.5-flash",
      promptVersion: "grader_b.v1.md",
      purpose: "Audits for missing technical elements, misconceptions, and vague phrasing to counter model leniency.",
    },
    {
      role: "Consensus Arbiter",
      model: "gemini-2.5-pro",
      promptVersion: "arbiter.v1.md",
      purpose: "Resolves splits when Grader A and B disagree by 1 band, strictly bounded within [min, max] range.",
    },
    {
      role: "Qualitative Feedback Writer",
      model: "gemini-2.5-flash",
      promptVersion: "feedback.v1.md",
      purpose: "Synthesizes student-facing feedback with 3 actionable next steps. Never generates numeric marks.",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2 pb-4 border-b border-[var(--rule)]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
            Institutional Transparency
          </span>
          <span className="text-xs text-[var(--muted-foreground)]">·</span>
          <span className="text-xs font-semibold text-[var(--primary)]">UN SDG 4: Quality Education</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--foreground)]">
          Public AI Assistance & Accountability Disclosure
        </h1>
        <p className="text-base text-[var(--muted-foreground)] leading-relaxed pt-1">
          Insaaf helps teachers review written work against an approved rubric. AI proposes judgements and quoted evidence; code calculates marks. Your teacher can change the draft and must approve marks before they are released.
        </p>
      </div>

      {/* 4 Pillars of Responsible AI Grading */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded bg-[var(--card)] border border-[var(--border)] shadow-[var(--shadow-paper)] space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm text-[var(--primary)]">
            <Calculator className="w-4 h-4" />
            <span>1. Deterministic Math, Never Model Scores</span>
          </div>
          <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
            Large Language Models never compute numbers or grades directly (D-004). Models only propose ordinal bands (Full, Mostly, Partial, Minimal, None). Marks are calculated strictly by deterministic TypeScript code via an auditable partial-credit policy.
          </p>
        </div>

        <div className="p-5 rounded bg-[var(--card)] border border-[var(--border)] shadow-[var(--shadow-paper)] space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm text-[var(--primary)]">
            <UserCheck className="w-4 h-4" />
            <span>2. Mandatory Teacher Approval Gate</span>
          </div>
          <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
            No grade is released automatically (D-001). Every script must be individually or batch-approved by the course instructor. Teachers can override any criterion mark at any time, which instantly recomputes the total score and logs an audit record.
          </p>
        </div>

        <div className="p-5 rounded bg-[var(--card)] border border-[var(--border)] shadow-[var(--shadow-paper)] space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm text-[var(--primary)]">
            <Lock className="w-4 h-4" />
            <span>3. Zero PII Sent to Inference Models</span>
          </div>
          <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
            Student names, registration numbers, emails, and contact details are stripped from all documents prior to inference (D-011). Scripts are assigned randomized pseudonyms (S-01 .. S-12) to ensure blind, unbiased evaluation.
          </p>
        </div>

        <div className="p-5 rounded bg-[var(--card)] border border-[var(--border)] shadow-[var(--shadow-paper)] space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm text-[var(--primary)]">
            <ShieldCheck className="w-4 h-4" />
            <span>4. Verbatim Quote Verification</span>
          </div>
          <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
            AI graders cannot cite hallucinated text. Every piece of quoted evidence is algorithmically verified against the student&apos;s actual extracted words with a sliding-window matcher before it can support a band or appear in student feedback.
          </p>
        </div>
      </div>

      {/* Model & Prompt Versioning Ledger */}
      <section className="bg-[var(--card)] rounded border border-[var(--border)] shadow-[var(--shadow-paper)] overflow-hidden space-y-0">
        <div className="p-4 border-b border-[var(--rule)] bg-[var(--background)]">
          <h2 className="font-bold text-sm text-[var(--foreground)] flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[var(--primary)]" />
            <span>Active Model Roles & Prompt Version Catalog</span>
          </h2>
        </div>

        <div className="divide-y divide-[var(--rule)] text-xs">
          {modelTable.map((item, idx) => (
            <div key={idx} className="p-4 space-y-1.5 hover:bg-[var(--muted)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="font-bold text-sm text-[var(--foreground)]">{item.role}</span>
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-[var(--background)] border border-[var(--rule)] font-semibold text-[var(--primary)]">
                    {item.model}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[var(--background)] border border-[var(--rule)] text-[var(--muted-foreground)]">
                    {item.promptVersion}
                  </span>
                </div>
              </div>
              <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                {item.purpose}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Honest Limitations Section per design.md §5 */}
      <section className="p-5 rounded bg-[var(--background)] border border-[var(--border)] space-y-3 text-xs leading-relaxed">
        <div className="flex items-center gap-2 font-bold text-sm text-[var(--foreground)]">
          <AlertCircle className="w-4 h-4 text-[var(--accent)]" />
          <span>Known System Limits & Boundary Conditions</span>
        </div>
        <ul className="list-disc list-inside space-y-1 text-[var(--muted-foreground)]">
          <li><strong>Typed Text Only:</strong> Insaaf processes text extracted from TXT, DOCX, and digital PDF files. Handwritten script OCR is intentionally excluded from MVP to prevent misreading penalties.</li>
          <li><strong>Similarity Scope:</strong> Similarity checks (5-shingles and embedding cosine) operate strictly within the uploaded batch. Insaaf does not search external internet databases or assert plagiarism.</li>
          <li><strong>Teacher Accountability:</strong> The AI proposes drafts to accelerate feedback turnaround; final grades and academic accountability rest entirely with the instructor.</li>
        </ul>
      </section>
    </div>
  );
}
