import { z } from "zod";

export const BandSchema = z.enum(["FULL", "MOSTLY", "PARTIAL", "MINIMAL", "NONE"]);
export type Band = z.infer<typeof BandSchema>;

export const DimensionSchema = z.enum(["concept", "application", "explanation", "presentation"]);
export type Dimension = z.infer<typeof DimensionSchema>;

export const StrictnessSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
]);
export type Strictness = z.infer<typeof StrictnessSchema>;

export const CLOSchema = z.object({
  id: z.string(),
  text: z.string(),
  bloom: z.string().optional(),
  ploIds: z.array(z.string()),
});
export type CLO = z.infer<typeof CLOSchema>;

export const PLOSchema = z.object({
  id: z.string(),
  text: z.string(),
});
export type PLO = z.infer<typeof PLOSchema>;

export const GradeBandSchema = z.object({
  letter: z.string(),
  minPct: z.number(),
});
export type GradeBand = z.infer<typeof GradeBandSchema>;

export const CourseSchema = z.object({
  id: z.string(),
  ownerUid: z.string(),
  code: z.string(),
  title: z.string(),
  description: z.string(),
  topics: z.array(z.string()),
  clos: z.array(CLOSchema),
  plos: z.array(PLOSchema),
  gradeScheme: z.array(GradeBandSchema),
  cloStudentThresholdPct: z.number().default(50),
  cloClassTargetPct: z.number().default(60),
  createdAt: z.string(),
});
export type Course = z.infer<typeof CourseSchema>;

export const CriterionSchema = z.object({
  id: z.string(),
  title: z.string(),
  maxMarks: z.number(),
  cloId: z.string(),
  dimension: DimensionSchema,
  requiredElements: z.array(z.string()),
  bandDescriptors: z.record(BandSchema, z.string()),
  commonErrors: z.array(z.string()),
});
export type Criterion = z.infer<typeof CriterionSchema>;

export const CompiledRubricSchema = z.object({
  version: z.number(),
  status: z.enum(["draft", "approved"]),
  criteria: z.array(CriterionSchema),
  warnings: z.array(z.string()),
  approvedAt: z.string().optional(),
});
export type CompiledRubric = z.infer<typeof CompiledRubricSchema>;

export const AssessmentTypeSchema = z.enum(["quiz", "assignment", "lab", "mid", "final", "project"]);
export type AssessmentType = z.infer<typeof AssessmentTypeSchema>;

export const AssessmentSchema = z.object({
  id: z.string(),
  courseId: z.string(),
  ownerUid: z.string(),
  title: z.string(),
  type: AssessmentTypeSchema,
  question: z.string(),
  referenceAnswer: z.string().optional(),
  totalMarks: z.number(),
  strictness: StrictnessSchema,
  rubricRaw: z.string(),
  rubric: CompiledRubricSchema.optional(),
  status: z.enum(["draft", "rubric_approved", "grading", "graded", "released"]),
  calibration: z
    .object({
      anchorIds: z.array(z.string()),
      offsets: z.record(z.string(), z.number()),
      looMaeBefore: z.number().optional(),
      looMaeAfter: z.number().optional(),
    })
    .optional(),
  createdAt: z.string(),
});
export type Assessment = z.infer<typeof AssessmentSchema>;

export const IngestFlagsSchema = z.object({
  removedChars: z.array(z.object({ kind: z.string(), count: z.number() })),
  hiddenText: z.array(z.object({ text: z.string(), reason: z.enum(["vanish", "white", "tiny"]) })),
  heuristicHits: z.array(
    z.object({ pattern: z.string(), text: z.string(), start: z.number(), end: z.number() })
  ),
  guard: z
    .object({
      verdict: z.enum(["clean", "suspicious", "manipulation"]),
      spans: z.array(z.object({ quote: z.string(), type: z.string(), verified: z.boolean() })),
      note: z.string(),
      model: z.string(),
    })
    .optional(),
  quarantined: z.array(z.object({ text: z.string(), start: z.number(), end: z.number() })),
  wordCount: z.number(),
  parseWarnings: z.array(z.string()),
});
export type IngestFlags = z.infer<typeof IngestFlagsSchema>;

export const EvidenceItemSchema = z.object({
  quote: z.string(),
  role: z.enum(["meets", "partial", "error"]),
  status: z.enum(["verified", "verified_fuzzy", "rejected", "rejected_flagged"]),
});
export type EvidenceItem = z.infer<typeof EvidenceItemSchema>;

export const GraderVoteSchema = z.object({
  grader: z.enum(["A", "B"]),
  model: z.string(),
  promptVersion: z.string(),
  band: BandSchema,
  evidence: z.array(EvidenceItemSchema),
  missing: z.array(z.string()),
  rationale: z.string(),
  confidence: z.enum(["high", "medium", "low"]),
  manipulationNoticed: z.boolean(),
  status: z.enum(["ok", "retried", "unsupported", "error"]),
});
export type GraderVote = z.infer<typeof GraderVoteSchema>;

export const CriterionResultSchema = z.object({
  criterionId: z.string(),
  votes: z.array(GraderVoteSchema),
  arbiter: z
    .object({
      band: BandSchema,
      rationale: z.string(),
      model: z.string(),
    })
    .optional(),
  consensusBand: BandSchema.optional(),
  source: z.enum(["agree", "arbiter", "single", "none"]),
  aiMarks: z.number().optional(),
  teacherMarks: z.number().optional(),
  finalMarks: z.number().optional(),
});
export type CriterionResult = z.infer<typeof CriterionResultSchema>;

export const ReviewReasonCodeSchema = z.enum([
  "HIDDEN_TEXT",
  "HEURISTIC",
  "GUARD",
  "QUARANTINE",
  "CANARY",
  "SPLIT",
  "UNSUPPORTED",
  "LOW_CONFIDENCE",
  "SHORT_TEXT",
  "PARSE_ERROR",
  "COLLUSION",
  "ANCHOR",
  "SPOT_CHECK",
]);
export type ReviewReasonCode = z.infer<typeof ReviewReasonCodeSchema>;

export const ReviewReasonSchema = z.object({
  code: ReviewReasonCodeSchema,
  detail: z.string(),
  criterionId: z.string().optional(),
});
export type ReviewReason = z.infer<typeof ReviewReasonSchema>;

export const FeedbackSchema = z.object({
  language: z.enum(["en", "ur"]),
  strengths: z.array(z.object({ criterionId: z.string(), text: z.string(), quote: z.string().optional() })),
  improvements: z.array(z.object({ criterionId: z.string(), text: z.string(), quote: z.string().optional() })),
  dimensionNotes: z.record(DimensionSchema, z.string().optional()).optional(),
  nextSteps: z.array(z.string()),
  model: z.string(),
  promptVersion: z.string(),
});
export type Feedback = z.infer<typeof FeedbackSchema>;

export const SubmissionStatusSchema = z.enum([
  "queued",
  "processing",
  "graded_clean",
  "needs_review",
  "approved",
  "released",
  "error",
]);
export type SubmissionStatus = z.infer<typeof SubmissionStatusSchema>;

export const SubmissionSchema = z.object({
  id: z.string(),
  assessmentId: z.string(),
  pseudonym: z.string(),
  fileName: z.string(),
  textOriginal: z.string(),
  textForGrading: z.string(),
  flags: IngestFlagsSchema,
  status: SubmissionStatusSchema,
  reviewReasons: z.array(ReviewReasonSchema),
  results: z.array(CriterionResultSchema),
  rubricVersion: z.number(),
  totals: z
    .object({
      ai: z.number(),
      final: z.number(),
      pct: z.number(),
      grade: z.string(),
    })
    .optional(),
  feedback: FeedbackSchema.optional(),
  teacherNotes: z.string().optional(),
  approvedBy: z.string().optional(),
  approvedAt: z.string().optional(),
  releaseToken: z.string().optional(),
  reviewOrder: z.number().optional(),
  reviewStartedAt: z.string().optional(),
  reviewedAt: z.string().optional(),
  error: z.string().optional(),
  updatedAt: z.string(),
});
export type Submission = z.infer<typeof SubmissionSchema>;

export const IdentitySchema = z.object({
  submissionId: z.string(),
  name: z.string(),
  rollNo: z.string().optional(),
});
export type Identity = z.infer<typeof IdentitySchema>;

export const CollusionPairSchema = z.object({
  a: z.string(),
  b: z.string(),
  containment: z.number(),
  jaccard: z.number(),
  cosine: z.number(),
  level: z.enum(["high", "medium"]),
  sharedPassages: z.array(z.object({ textA: z.string(), textB: z.string() })),
});

export type CollusionPair = z.infer<typeof CollusionPairSchema>;

export const AuditEntrySchema = z.object({
  ts: z.string(),
  actor: z.union([z.literal("system"), z.string()]),
  action: z.string(),
  submissionId: z.string().optional(),
  criterionId: z.string().optional(),
  before: z.unknown().optional(),
  after: z.unknown().optional(),
  model: z.string().optional(),
  promptVersion: z.string().optional(),
  detail: z.string().optional(),
});
export type AuditEntry = z.infer<typeof AuditEntrySchema>;

export const AnalyticsReportSchema = z.object({
  assessmentId: z.string(),
  generatedAt: z.string(),
  kpis: z.object({
    n: z.number(),
    mean: z.number(),
    median: z.number(),
    sd: z.number(),
    min: z.number(),
    max: z.number(),
    passRatePct: z.number(),
  }),
  histogram: z.object({
    mean: z.number(),
    median: z.number(),
    bins: z.array(
      z.object({
        binStart: z.number(),
        binEnd: z.number(),
        count: z.number(),
      })
    ),
  }),
  gradeDistribution: z.record(z.string(), z.number()),
  outliers: z.array(
    z.object({
      submissionId: z.string(),
      pseudonym: z.string(),
      pct: z.number(),
      reason: z.string(),
    })
  ),
  topStudents: z.array(
    z.object({
      submissionId: z.string(),
      pseudonym: z.string(),
      pct: z.number(),
      grade: z.string(),
    })
  ),
  needsAttention: z.array(
    z.object({
      submissionId: z.string(),
      pseudonym: z.string(),
      pct: z.number(),
      reasons: z.array(z.string()),
    })
  ),
  criterionDifficulty: z.array(
    z.object({
      criterionId: z.string(),
      title: z.string(),
      meanFraction: z.number(),
    })
  ),
  dimensionProfile: z.record(DimensionSchema, z.number()),
  clos: z.array(
    z.object({
      cloId: z.string(),
      text: z.string(),
      classAttainmentPct: z.number(),
      targetPct: z.number(),
      isAttained: z.boolean(),
    })
  ),
  plos: z
    .array(
      z.object({
        ploId: z.string(),
        text: z.string(),
        attainmentPct: z.number(),
      })
    )
    .optional(),
});
export type AnalyticsReport = z.infer<typeof AnalyticsReportSchema>;

export const TrustReportSchema = z.object({
  assessmentId: z.string(),
  generatedAt: z.string(),
  panelAgreement: z.object({
    exactPct: z.number(),
    adjacentPct: z.number(),
    qwk: z.number(),
    totalVotes: z.number(),
  }),
  arbitrations: z.object({
    count: z.number(),
    reviewCount: z.number(),
  }),
  injectionDefence: z.object({
    hiddenTextFinds: z.number(),
    heuristicHits: z.number(),
    guardFlags: z.number(),
    quarantines: z.number(),
    canaryFlags: z.number(),
  }),
  evidenceIntegrity: z.object({
    verifiedQuotes: z.number(),
    fuzzyQuotes: z.number(),
    rejectedQuotes: z.number(),
    discardedVotes: z.number(),
  }),
  teacherAgreement: z
    .object({
      anchorCount: z.number(),
      mae: z.number(),
      exactBandPct: z.number(),
    })
    .optional(),
  teacherOverrides: z.object({
    count: z.number(),
    meanDelta: z.number(),
    positiveDeltaCount: z.number(),
    negativeDeltaCount: z.number(),
  }),
  lengthSensitivity: z.object({
    pearsonR: z.number(),
    sampleSize: z.number(),
    note: z.string(),
  }),
  teacherDrift: z
    .object({
      olsSlope: z.number().optional(),
      firstThirdMeanDelta: z.number().optional(),
      lastThirdMeanDelta: z.number().optional(),
      warning: z.boolean().optional(),
      isSimulated: z.boolean().default(false),
    })
    .optional(),
  models: z.record(
    z.string(),
    z.object({
      model: z.string(),
      promptVersion: z.string(),
    })
  ),
});
export type TrustReport = z.infer<typeof TrustReportSchema>;

