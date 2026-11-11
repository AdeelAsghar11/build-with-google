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
import {
  defaultLiveAssessment,
  defaultLiveSubmission,
} from "../live-data";
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
  Criterion,
} from "../contracts";

export type DemoMode = "synthetic" | "live";

export interface AuditLogItem {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  summary: string;
}

interface DemoContextType {
  mode: DemoMode;
  setMode: (m: DemoMode) => void;
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
  isGradingLive: boolean;
  liveGradingStage: string | null;
  setActiveSubmissionId: (id: string) => void;
  setStrictness: (level: Strictness) => void;
  updateCriterionMark: (submissionId: string, criterionId: string, mark: number, note?: string) => void;
  approveSubmission: (submissionId: string) => void;
  approveAllClean: () => void;
  releaseSubmissions: () => void;
  resetToFixtures: () => void;
  clearToast: () => void;

  // Real Assessment & Live Pipeline actions
  updateLiveAssessment: (patch: Partial<Assessment>) => void;
  updateLiveCriteria: (criteria: Criterion[]) => void;
  approveLiveRubric: () => void;
  compileLiveRubric: () => Promise<void>;
  addLiveSubmission: (text: string, studentName?: string, fileName?: string) => Promise<Submission>;
  gradeLiveSubmission: (submissionId?: string) => Promise<void>;
}

const DemoContext = createContext<DemoContextType | null>(null);

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<DemoMode>("synthetic");

  // Mode 1: Synthetic Cohort
  const [course] = useState<Course>(initialCourse);
  const [syntheticAssessment, setSyntheticAssessment] = useState<Assessment>(initialAssessment);
  const [syntheticSubmissions, setSyntheticSubmissions] = useState<Submission[]>(initialSubmissions);

  // Mode 2: Live Assessment (Real AI Pipeline)
  const [liveAssessment, setLiveAssessment] = useState<Assessment>(defaultLiveAssessment);
  const [liveSubmissions, setLiveSubmissions] = useState<Submission[]>([defaultLiveSubmission]);

  // Strictness Policy
  const [strictness, setStrictnessState] = useState<Strictness>(
    (initialAssessment.strictness as Strictness) || 3
  );

  // Active submission selection
  const [activeSubmissionId, setActiveSubmissionId] = useState<string>("S08");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Live grading progress states
  const [isGradingLive, setIsGradingLive] = useState(false);
  const [liveGradingStage, setLiveGradingStage] = useState<string | null>(null);

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
    }, 6000);
  }, []);

  const clearToast = useCallback(() => {
    setToastMessage(null);
  }, []);

  // Switch between Synthetic Demo and Real Live Assessment
  const setMode = useCallback((newMode: DemoMode) => {
    setModeState(newMode);
    if (newMode === "synthetic") {
      setActiveSubmissionId("S08");
      showToast("Switched to Synthetic Demonstration Cohort (12 benchmark fixtures, planted defenses).");
    } else {
      setActiveSubmissionId((prev) => {
        const exists = liveSubmissions.some((s) => s.id === prev);
        return exists ? prev : (liveSubmissions[0]?.id || "live_sub_01");
      });
      showToast("Switched to Real Live Pipeline. Configure custom rubric and run Gemini live!");
    }
  }, [liveSubmissions, showToast]);

  // Active state pointers depending on mode
  const currentAssessment = mode === "synthetic" ? syntheticAssessment : liveAssessment;
  const currentSubmissions = mode === "synthetic" ? syntheticSubmissions : liveSubmissions;
  const setCurrentSubmissions = mode === "synthetic" ? setSyntheticSubmissions : setLiveSubmissions;
  const setCurrentAssessment = mode === "synthetic" ? setSyntheticAssessment : setLiveAssessment;

  // Update strictness and recompute all marks instantly via pure score()
  const setStrictness = useCallback(
    (newStrictness: Strictness) => {
      setStrictnessState(newStrictness);
      setCurrentAssessment((prev) => ({ ...prev, strictness: newStrictness }));

      if (!currentAssessment.rubric?.criteria) return;
      const criteria = currentAssessment.rubric.criteria;

      setCurrentSubmissions((prevSubmissions) =>
        prevSubmissions.map((sub) => {
          if (!sub.results || sub.results.length === 0) return sub;
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
        summary: `Strictness adjusted to level ${newStrictness}. Recomputed marks via pure score().`,
      };
      setAuditLog((prev) => [logItem, ...prev]);
      showToast(`Partial-credit policy set to level ${newStrictness}. Marks recalculated.`);
    },
    [currentAssessment.rubric, setCurrentAssessment, setCurrentSubmissions, showToast]
  );

  // Update mark for a specific criterion on a submission
  const updateCriterionMark = useCallback(
    (submissionId: string, criterionId: string, mark: number, note?: string) => {
      if (!currentAssessment.rubric?.criteria) return;
      const criteria = currentAssessment.rubric.criteria;

      setCurrentSubmissions((prev) =>
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
    [currentAssessment.rubric, strictness, setCurrentSubmissions, showToast]
  );

  // Approve single submission
  const approveSubmission = useCallback(
    (submissionId: string) => {
      setCurrentSubmissions((prev) =>
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
    [setCurrentSubmissions, showToast]
  );

  // Bulk approve clean scripts (D-016, §5)
  const approveAllClean = useCallback(() => {
    let count = 0;
    setCurrentSubmissions((prev) =>
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
  }, [setCurrentSubmissions, showToast]);

  // Release approved grades with access tokens
  const releaseSubmissions = useCallback(() => {
    let releasedCount = 0;
    setCurrentSubmissions((prev) =>
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
  }, [setCurrentSubmissions, showToast]);

  // Reset back to initial fixtures
  const resetToFixtures = useCallback(() => {
    if (mode === "synthetic") {
      setSyntheticAssessment(initialAssessment);
      setSyntheticSubmissions(initialSubmissions);
      setStrictnessState((initialAssessment.strictness as Strictness) || 3);
      setActiveSubmissionId("S08");
      showToast("Reset all synthetic demo data back to baseline fixtures.");
    } else {
      setLiveAssessment(defaultLiveAssessment);
      setLiveSubmissions([defaultLiveSubmission]);
      setActiveSubmissionId(defaultLiveSubmission.id);
      showToast("Reset live assessment and student submissions to defaults.");
    }
  }, [mode, showToast]);

  // -------------------------------------------------------------
  // Live Assessment Actions (Setting rubric yourself, live AI pipeline)
  // -------------------------------------------------------------

  const updateLiveAssessment = useCallback((patch: Partial<Assessment>) => {
    setLiveAssessment((prev) => ({
      ...prev,
      ...patch,
      rubric: patch.rubric ? patch.rubric : prev.rubric,
    }));
  }, []);

  const updateLiveCriteria = useCallback((criteria: Criterion[]) => {
    setLiveAssessment((prev) => {
      const sum = criteria.reduce((acc, c) => acc + c.maxMarks, 0);
      return {
        ...prev,
        totalMarks: sum,
        rubric: {
          version: (prev.rubric?.version || 1) + 1,
          status: "draft",
          warnings: [],
          criteria,
        },
      };
    });
  }, []);

  const approveLiveRubric = useCallback(() => {
    setLiveAssessment((prev) => {
      if (!prev.rubric) return prev;
      return {
        ...prev,
        rubric: {
          ...prev.rubric,
          status: "approved",
        },
      };
    });

    const logItem: AuditLogItem = {
      id: `aud-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: "Dr. Tariq Mahmood (Teacher)",
      action: "rubric_approved",
      summary: `Teacher approved & froze custom rubric v${liveAssessment.rubric?.version || 1} (${liveAssessment.rubric?.criteria.length} criteria). Invariant #2 passed.`,
    };
    setAuditLog((prev) => [logItem, ...prev]);
    showToast("Rubric approved & frozen. Submissions are now unlocked for AI grading.");
  }, [liveAssessment, showToast]);

  const compileLiveRubric = useCallback(async () => {
    try {
      showToast("Compiling structured rubric with Gemini 2.5 Pro...");
      const response = await fetch("/api/grade-live", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "compile_rubric",
          assessment: liveAssessment,
        }),
      });

      const data = await response.json();
      if (!data.success || !data.rubric) {
        throw new Error(data.error || "Rubric compilation failed");
      }

      setLiveAssessment((prev) => ({
        ...prev,
        rubric: data.rubric,
      }));

      const logItem: AuditLogItem = {
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: "Gemini 2.5 Pro (Rubric Compiler)",
        action: "rubric_compiled",
        summary: `Compiled rubric with ${data.rubric.criteria.length} criteria and 5-band descriptors. Ready for teacher approval.`,
      };
      setAuditLog((prev) => [logItem, ...prev]);
      showToast("Rubric compiled with Gemini! Review descriptors and click Approve to freeze.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Rubric compilation failed";
      showToast(`Compilation error: ${msg}`);
    }
  }, [liveAssessment, showToast]);

  const addLiveSubmission = useCallback(
    async (text: string, studentName?: string, fileName?: string): Promise<Submission> => {
      try {
        const response = await fetch("/api/grade-live", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "ingest",
            assessmentId: liveAssessment.id,
            text,
            studentName: studentName || "Student Live Demo",
            fileName: fileName || `submission_${Date.now()}.txt`,
          }),
        });

        const data = await response.json();
        if (!data.success || !data.submission) {
          throw new Error(data.error || "Ingestion failed");
        }

        const newSub = data.submission as Submission;
        setLiveSubmissions((prev) => [newSub, ...prev]);
        setActiveSubmissionId(newSub.id);

        const logItem: AuditLogItem = {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: "Moderator Ingestion Pipeline",
          action: "live_submission_ingest",
          summary: `Ingested live student submission ${newSub.pseudonym} (${newSub.flags?.wordCount ?? 0} words). PII redacted.`,
        };
        setAuditLog((prev) => [logItem, ...prev]);
        showToast(`Submission added (${newSub.pseudonym}). Click 'Grade with Real Gemini AI' to grade!`);
        return newSub;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to add submission";
        showToast(`Ingestion error: ${msg}`);
        throw err;
      }
    },
    [liveAssessment.id, showToast]
  );

  const gradeLiveSubmission = useCallback(
    async (submissionId?: string) => {
      const targetId = submissionId || activeSubmissionId;
      const subToGrade = liveSubmissions.find((s) => s.id === targetId) || liveSubmissions[0];
      if (!subToGrade) {
        showToast("No live submission found to grade.");
        return;
      }

      if (liveAssessment.rubric?.status !== "approved") {
        showToast("Rubric must be approved first (Invariant #2). Go to Setup & Rubric to approve.");
        return;
      }

      setIsGradingLive(true);
      setLiveGradingStage("Stage 1/5: Screening with Guard (injection defense)...");

      const t1 = setTimeout(() => {
        setLiveGradingStage("Stage 2/5: Dual Grader A & B parallel evaluation with Gemini...");
      }, 4000);

      const t2 = setTimeout(() => {
        setLiveGradingStage("Stage 3/5: Resolving consensus & verifying evidence quotes...");
      }, 10000);

      const t3 = setTimeout(() => {
        setLiveGradingStage("Stage 4/5: Deterministic scoring & student feedback synthesis...");
      }, 18000);

      try {
        const response = await fetch("/api/grade-live", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "grade",
            assessment: liveAssessment,
            submission: subToGrade,
            course,
          }),
        });

        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);

        const data = await response.json();
        if (!data.success || !data.submission) {
          throw new Error(data.error || "Grading failed");
        }

        const gradedSub = data.submission as Submission;

        setLiveSubmissions((prev) =>
          prev.map((s) => (s.id === gradedSub.id ? gradedSub : s))
        );
        setActiveSubmissionId(gradedSub.id);

        const logItem: AuditLogItem = {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: "Moderator Live Pipeline (Gemini)",
          action: "live_ai_grading",
          summary: `Graded ${gradedSub.pseudonym} live using Gemini. Score: ${gradedSub.totals?.final ?? 0}/${liveAssessment.totalMarks} (${gradedSub.totals?.pct ?? 0}%). Status: ${gradedSub.status}.`,
        };
        setAuditLog((prev) => [logItem, ...prev]);

        showToast(
          `Live grading complete! Score: ${gradedSub.totals?.final ?? 0}/${liveAssessment.totalMarks} (${gradedSub.status}). Open Review Queue to inspect evidence.`
        );
      } catch (err: unknown) {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
        const msg = err instanceof Error ? err.message : "Live grading failed";
        showToast(`Grading error: ${msg}`);
      } finally {
        setIsGradingLive(false);
        setLiveGradingStage(null);
      }
    },
    [activeSubmissionId, liveSubmissions, liveAssessment, course, showToast]
  );

  // Compute live analytics based on current submission marks
  const dynamicAnalytics = useMemo(() => {
    const scoredSubs = currentSubmissions.filter((s) => s.totals?.final !== undefined && s.status !== "queued");
    const marks = scoredSubs.map((s) => s.totals?.final ?? 0);
    const n = marks.length;
    if (n === 0) {
      return {
        ...initialAnalytics,
        kpis: {
          n: currentSubmissions.length,
          mean: 0,
          median: 0,
          sd: 0,
          min: 0,
          max: currentAssessment.totalMarks,
          passRatePct: 0,
        },
      };
    }

    const mean = Math.round((marks.reduce((a, b) => a + b, 0) / n) * 10) / 10;
    const sorted = [...marks].sort((a, b) => a - b);
    const median = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)];
    const variance = marks.reduce((acc, m) => acc + Math.pow(m - mean, 2), 0) / n;
    const stdDev = Math.round(Math.sqrt(variance) * 10) / 10;
    const passCount = marks.filter((m) => m >= currentAssessment.totalMarks / 2).length;
    const passRate = Math.round((passCount / n) * 100);

    return {
      ...initialAnalytics,
      kpis: {
        n,
        mean,
        median,
        sd: stdDev,
        min: sorted[0] ?? 0,
        max: sorted[sorted.length - 1] ?? currentAssessment.totalMarks,
        passRatePct: passRate,
      },
    };
  }, [currentSubmissions, currentAssessment]);

  return (
    <DemoContext.Provider
      value={{
        mode,
        setMode,
        course,
        assessment: currentAssessment,
        submissions: currentSubmissions,
        collusionPairs: initialCollusionPairs,
        analytics: dynamicAnalytics,
        trustReport: initialTrustReport,
        strictness,
        activeSubmissionId,
        auditLog,
        toastMessage,
        isGradingLive,
        liveGradingStage,
        setActiveSubmissionId,
        setStrictness,
        updateCriterionMark,
        approveSubmission,
        approveAllClean,
        releaseSubmissions,
        resetToFixtures,
        clearToast,
        updateLiveAssessment,
        updateLiveCriteria,
        approveLiveRubric,
        compileLiveRubric,
        addLiveSubmission,
        gradeLiveSubmission,
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
