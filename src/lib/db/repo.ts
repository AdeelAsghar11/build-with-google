import "server-only";
import { getDb } from "./firestore";
import {
  type Course,
  type Assessment,
  type Submission,
  type Identity,
  type CollusionPair,
  type AuditEntry,
  CourseSchema,
  AssessmentSchema,
  SubmissionSchema,
  IdentitySchema,
  CollusionPairSchema,
  AuditEntrySchema,
} from "../contracts";
import { initialCourse, initialAssessment, initialSubmissions } from "../demo-data";

// Collection names
const COLLECTIONS = {
  COURSES: "courses",
  ASSESSMENTS: "assessments",
  SUBMISSIONS: "submissions",
  IDENTITY: "identity",
  COLLUSION: "collusion",
  AUDIT: "audit",
  LLM_CACHE: "llmCache",
} as const;

// In-memory store fallback for offline / demo mode
const inMemoryStore = {
  courses: new Map<string, Course>([[initialCourse.id, initialCourse]]),
  assessments: new Map<string, Assessment>([[initialAssessment.id, initialAssessment]]),
  submissions: new Map<string, Submission>(initialSubmissions.map((s) => [s.id, s])),
  identities: new Map<string, Identity>(),
  collusionPairs: new Map<string, CollusionPair[]>(),
  audit: [] as AuditEntry[],
  llmCache: new Map<string, unknown>(),
};

function isOfflineDemo(): boolean {
  return !process.env.FIREBASE_PROJECT_ID || process.env.AUTH_MODE === "demo";
}

// ----------------- Courses -----------------

export async function saveCourse(course: Course): Promise<void> {
  const validated = CourseSchema.parse(course);
  if (isOfflineDemo()) {
    inMemoryStore.courses.set(validated.id, validated);
    return;
  }
  const db = getDb();
  await db.collection(COLLECTIONS.COURSES).doc(validated.id).set(validated);
}

export async function getCourse(courseId: string): Promise<Course | null> {
  if (isOfflineDemo()) {
    return inMemoryStore.courses.get(courseId) ?? null;
  }
  const db = getDb();
  const snap = await db.collection(COLLECTIONS.COURSES).doc(courseId).get();
  if (!snap.exists) return null;
  return CourseSchema.parse(snap.data());
}

export async function getCourses(ownerUid: string): Promise<Course[]> {
  if (isOfflineDemo()) {
    return Array.from(inMemoryStore.courses.values()).filter((c) => c.ownerUid === ownerUid);
  }
  const db = getDb();
  const snap = await db.collection(COLLECTIONS.COURSES).where("ownerUid", "==", ownerUid).get();
  return snap.docs.map((doc) => CourseSchema.parse(doc.data()));
}

// ----------------- Assessments -----------------

export async function saveAssessment(assessment: Assessment): Promise<void> {
  const validated = AssessmentSchema.parse(assessment);
  if (isOfflineDemo()) {
    inMemoryStore.assessments.set(validated.id, validated);
    return;
  }
  const db = getDb();
  await db.collection(COLLECTIONS.ASSESSMENTS).doc(validated.id).set(validated);
}

export async function getAssessment(assessmentId: string): Promise<Assessment | null> {
  if (isOfflineDemo()) {
    return inMemoryStore.assessments.get(assessmentId) ?? null;
  }
  const db = getDb();
  const snap = await db.collection(COLLECTIONS.ASSESSMENTS).doc(assessmentId).get();
  if (!snap.exists) return null;
  return AssessmentSchema.parse(snap.data());
}

// ----------------- Submissions -----------------

export async function saveSubmission(submission: Submission): Promise<void> {
  const validated = SubmissionSchema.parse(submission);
  if (isOfflineDemo()) {
    inMemoryStore.submissions.set(validated.id, validated);
    return;
  }
  const db = getDb();
  await db.collection(COLLECTIONS.SUBMISSIONS).doc(validated.id).set(validated);
}

export async function getSubmission(submissionId: string): Promise<Submission | null> {
  if (isOfflineDemo()) {
    return inMemoryStore.submissions.get(submissionId) ?? null;
  }
  const db = getDb();
  const snap = await db.collection(COLLECTIONS.SUBMISSIONS).doc(submissionId).get();
  if (!snap.exists) return null;
  return SubmissionSchema.parse(snap.data());
}

export async function getSubmissions(assessmentId: string): Promise<Submission[]> {
  if (isOfflineDemo()) {
    return Array.from(inMemoryStore.submissions.values()).filter((s) => s.assessmentId === assessmentId);
  }
  const db = getDb();
  const snap = await db.collection(COLLECTIONS.SUBMISSIONS).where("assessmentId", "==", assessmentId).get();
  return snap.docs.map((doc) => SubmissionSchema.parse(doc.data()));
}

// ----------------- Identity (Teacher Only) -----------------

export async function saveIdentity(identity: Identity): Promise<void> {
  const validated = IdentitySchema.parse(identity);
  if (isOfflineDemo()) {
    inMemoryStore.identities.set(validated.submissionId, validated);
    return;
  }
  const db = getDb();
  await db.collection(COLLECTIONS.IDENTITY).doc(validated.submissionId).set(validated);
}

export async function getIdentity(submissionId: string): Promise<Identity | null> {
  if (isOfflineDemo()) {
    return inMemoryStore.identities.get(submissionId) ?? null;
  }
  const db = getDb();
  const snap = await db.collection(COLLECTIONS.IDENTITY).doc(submissionId).get();
  if (!snap.exists) return null;
  return IdentitySchema.parse(snap.data());
}

// ----------------- Collusion Pairs -----------------

export async function saveCollusionPairs(assessmentId: string, pairs: CollusionPair[]): Promise<void> {
  const validated = pairs.map((p) => CollusionPairSchema.parse(p));
  if (isOfflineDemo()) {
    inMemoryStore.collusionPairs.set(assessmentId, validated);
    return;
  }
  const db = getDb();
  await db.collection(COLLECTIONS.COLLUSION).doc(assessmentId).set({ pairs: validated });
}

export async function getCollusionPairs(assessmentId: string): Promise<CollusionPair[]> {
  if (isOfflineDemo()) {
    return inMemoryStore.collusionPairs.get(assessmentId) ?? [];
  }
  const db = getDb();
  const snap = await db.collection(COLLECTIONS.COLLUSION).doc(assessmentId).get();
  if (!snap.exists) return [];
  const data = snap.data();
  return (data?.pairs ?? []).map((p: unknown) => CollusionPairSchema.parse(p));
}

// ----------------- Audit (Append-Only) -----------------

export async function appendAuditLog(entry: AuditEntry): Promise<void> {
  const validated = AuditEntrySchema.parse(entry);
  if (isOfflineDemo()) {
    inMemoryStore.audit.push(validated);
    return;
  }
  const db = getDb();
  await db.collection(COLLECTIONS.AUDIT).add(validated);
}

export async function getAuditLogs(submissionId?: string): Promise<AuditEntry[]> {
  if (isOfflineDemo()) {
    if (submissionId) {
      return inMemoryStore.audit.filter((a) => a.submissionId === submissionId);
    }
    return [...inMemoryStore.audit];
  }
  const db = getDb();
  let query: FirebaseFirestore.Query = db.collection(COLLECTIONS.AUDIT).orderBy("ts", "desc");
  if (submissionId) {
    query = query.where("submissionId", "==", submissionId);
  }
  const snap = await query.get();
  return snap.docs.map((doc) => AuditEntrySchema.parse(doc.data()));
}

// ----------------- LLM Cache -----------------

export async function saveLlmCache(key: string, value: unknown): Promise<void> {
  if (isOfflineDemo()) {
    inMemoryStore.llmCache.set(key, value);
    return;
  }
  const db = getDb();
  await db.collection(COLLECTIONS.LLM_CACHE).doc(key).set({
    key,
    value,
    savedAt: new Date().toISOString(),
  });
}

export async function getLlmCache<T = unknown>(key: string): Promise<T | null> {
  if (isOfflineDemo()) {
    return (inMemoryStore.llmCache.get(key) as T) ?? null;
  }
  const db = getDb();
  const snap = await db.collection(COLLECTIONS.LLM_CACHE).doc(key).get();
  if (!snap.exists) return null;
  return (snap.data()?.value as T) ?? null;
}
