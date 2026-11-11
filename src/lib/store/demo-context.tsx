"use client";

import React, { createContext, useContext, useState, useMemo, useCallback } from "react";
import {
  initialCourse,
  initialAssessment,
  initialSubmissions,
  initialCollusionPairs,
  initialAnalytics,
  initialTrustReport,
} from "../demo-data";
import { score } from "../pipeline/score";
import type {
  Assessment,
  Submission,
  Course,
  Strictness,
  CollusionPair,
  AnalyticsReport,
  TrustReport,
  CriterionResult,
} from "../contracts";

export interface AuditLogItem {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  summary: string;
}

interface DemoContextType {
  course: Course;
  assessment: Assessment;
  submissions: Submission[];
  collusionPairs: CollusionPair[];
  analytics: AnalyticsReport;
  trustReport: TrustReport;
  strictness: Strictness;
  activeSubmissionId: string;
  auditLog: AuditLogItem[];
  toastMessage: string | null;
  setActiveSubmissionId: (id: string) => void;
  setStrictness: (level: Strictness) => void;
  updateCriterionMark: (submissionId: string, criterionId: string, mark: number, note?: string) => void;
  approveSubmission: (submissionId: string) => void;
  approveAllClean: () => void;
  releaseSubmissions: () => void;
  resetToFixtures: () => void;
  clearToast: () => void;
}

const DemoContext = createContext<DemoContextType | null>(null);

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [course] = useState<Course>(initialCourse);
  const [assessment, setAssessment] = useState<Assessment>(initialAssessment);
  const [submissions, setSubmissions] = useState<Submission[]>(initialSubmissions);
  const [strictness, setStrictnessState] = useState<Strictness>(
    (initialAssessment.strictness as Strictness) || 3
  );
  const [activeSubmissionId, setActiveSubmissionId] = useState<string>("S08");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [auditLog, setAuditLog] = useState<AuditLogItem[]>([
    {
      id: "aud-001",
      timestamp: "2026-11-11T12:25:00Z",
      actor: "Dr. Tariq Mahmood (Teacher)",
      action: "rubric_approved",
      summary: "Approved rubric v1 with 4 criteria totaling 20.0 marks.",
    },
    {
      id: "aud-002",
      timestamp: "2026-11-11T12:28:00Z",
      actor: "Moderator Pipeline",
      action: "batch_ingest",
      summary: "Ingested 12 scripts. Redacted PII, pseudonymized S-01 to S-12.",
    },
    {
      id: "aud-003",
      timestamp: "2026-11-11T12:30:00Z",
      actor: "Gemma Guard",
      action: "quarantine_applied",
      summary: "Flagged and quarantined prompt injection in S-08. Struck through in review.",
    },
  ]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 5000);
  }, []);

  const clearToast = useCallback(() => {
    setToastMessage(null);
  }, []);

  // Update strictness and recompute all marks instantly via pure score()
  const setStrictness = useCallback(
    (newStrictness: Strictness) => {
      setStrictnessState(newStrictness);
      setAssessment((prev) => ({ ...prev, strictness: newStrictness }));

      if (!assessment.rubric?.criteria) return;
      const criteria = assessment.rubric.criteria;

      setSubmissions((prevSubmissions) =>
        prevSubmissions.map((sub) => {
          if (!sub.results) return sub;
          // Recompute with new strictness table
          const scored = score(sub.results, criteria, newStrictness, undefined, undefined);
          return {
            ...sub,
            results: scored.results,
            totals: scored.totals,
          };
        })
      );

      const logItem: AuditLogItem = {
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: "Dr. Tariq Mahmood (Teacher)",
        action: "strictness_changed",
        summary: `Strictness adjusted to level ${newStrictness}. Recomputed marks for all 12 submissions via pure score().`,
      };
      setAuditLog((prev) => [logItem, ...prev]);
      showToast(`Partial-credit policy set to level ${newStrictness}. Marks recalculated.`);
    },
    [assessment.rubric, showToast]
  );

  // Update mark for a specific criterion on a submission
  const updateCriterionMark = useCallback(
    (submissionId: string, criterionId: string, mark: number, note?: string) => {
      if (!assessment.rubric?.criteria) return;
      const criteria = assessment.rubric.criteria;

      setSubmissions((prev) =>
        prev.map((sub) => {
          if (sub.id !== submissionId || !sub.results) return sub;

          const updatedResults: CriterionResult[] = sub.results.map((cr: CriterionResult) => {
            if (cr.criterionId === criterionId) {
              return {
                ...cr,
                teacherMarks: mark,
                finalMarks: mark,
              };
            }
            return cr;
          });

          const scored = score(
            updatedResults,
            criteria,
            strictness,
            undefined,
            { [criterionId]: mark }
          );

          return {
            ...sub,
            results: scored.results,
            totals: scored.totals,
            teacherNotes: note !== undefined ? note : sub.teacherNotes,
            // If it was approved, editing marks resets to review per D-016
            status: sub.status === "approved" ? "needs_review" : sub.status,
          };
        })
      );

      const logItem: AuditLogItem = {
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: "Dr. Tariq Mahmood (Teacher)",
        action: "mark_override",
        summary: `Manual override for ${submissionId} on ${criterionId}: ${mark} marks recorded.`,
      };
      setAuditLog((prev) => [logItem, ...prev]);
      showToast(`Marks saved for ${submissionId}. Review updated feedback before approving.`);
    },
    [assessment.rubric, strictness, showToast]
  );

  // Approve single submission
  const approveSubmission = useCallback(
    (submissionId: string) => {
      setSubmissions((prev) =>
        prev.map((sub) => (sub.id === submissionId ? { ...sub, status: "approved" } : sub))
      );

      const logItem: AuditLogItem = {
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: "Dr. Tariq Mahmood (Teacher)",
        action: "teacher_approval",
        summary: `Approved submission ${submissionId}. Ready for student release.`,
      };
      setAuditLog((prev) => [logItem, ...prev]);
      showToast(`Submission ${submissionId} approved.`);
    },
    [showToast]
  );

  // Bulk approve clean scripts (D-016, §5)
  const approveAllClean = useCallback(() => {
    let count = 0;
    setSubmissions((prev) =>
      prev.map((sub) => {
        const isClean = !sub.reviewReasons || sub.reviewReasons.length === 0;
        if (isClean && sub.status !== "approved" && sub.status !== "released") {
          count++;
          return { ...sub, status: "approved" };
        }
        return sub;
      })
    );

    const logItem: AuditLogItem = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: "Dr. Tariq Mahmood (Teacher)",
      action: "bulk_approval",
      summary: `Bulk approved ${count} clean scripts with zero review flags.`,
    };
    setAuditLog((prev) => [logItem, ...prev]);
    showToast(`Approved ${count} clean scripts.`);
  }, [showToast]);

  // Release approved grades with access tokens
  const releaseSubmissions = useCallback(() => {
    let releasedCount = 0;
    setSubmissions((prev) =>
      prev.map((sub) => {
        if (sub.status === "approved") {
          releasedCount++;
          return {
            ...sub,
            status: "released",
          };
        }
        return sub;
      })
    );

    const logItem: AuditLogItem = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: "Dr. Tariq Mahmood (Teacher)",
      action: "release",
      summary: `Released ${releasedCount} approved submissions. Student feedback links activated.`,
    };
    setAuditLog((prev) => [logItem, ...prev]);
    showToast(`Released ${releasedCount} approved results. Private links active.`);
  }, [showToast]);

  // Reset demo back to initial fixtures
  const resetToFixtures = useCallback(() => {
    setAssessment(initialAssessment);
    setSubmissions(initialSubmissions);
    setStrictnessState((initialAssessment.strictness as Strictness) || 3);
    setActiveSubmissionId("S08");
    showToast("Reset all demo data back to baseline fixtures.");
  }, [showToast]);

  // Compute live analytics based on current submission marks
  const dynamicAnalytics = useMemo(() => {
    const scoredSubs = submissions.filter((s) => s.totals?.final !== undefined);
    const marks = scoredSubs.map((s) => s.totals?.final ?? 0);
    const n = marks.length;
    if (n === 0) return initialAnalytics;

    const mean = Math.round((marks.reduce((a, b) => a + b, 0) / n) * 10) / 10;
    const sorted = [...marks].sort((a, b) => a - b);
    const median = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)];
    const variance = marks.reduce((acc, m) => acc + Math.pow(m - mean, 2), 0) / n;
    const stdDev = Math.round(Math.sqrt(variance) * 10) / 10;
    const passCount = marks.filter((m) => m >= 10).length;
    const passRate = Math.round((passCount / n) * 100);

    return {
      ...initialAnalytics,
      kpis: {
        n,
        mean,
        median,
        sd: stdDev,
        min: sorted[0] ?? 0,
        max: sorted[sorted.length - 1] ?? 20,
        passRatePct: passRate,
      },
    };
  }, [submissions]);

  return (
    <DemoContext.Provider
      value={{
        course,
        assessment,
        submissions,
        collusionPairs: initialCollusionPairs,
        analytics: dynamicAnalytics,
        trustReport: initialTrustReport,
        strictness,
        activeSubmissionId,
        auditLog,
        toastMessage,
        setActiveSubmissionId,
        setStrictness,
        updateCriterionMark,
        approveSubmission,
        approveAllClean,
        releaseSubmissions,
        resetToFixtures,
        clearToast,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error("useDemo must be used within a DemoProvider");
  }
  return context;
}
