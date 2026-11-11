import mockDataRaw from "../../fixtures/mock-graded-assessment.json";
import courseRaw from "../../fixtures/course.json";
import type { Assessment, Submission, CollusionPair, AnalyticsReport, TrustReport, Course } from "./contracts";

export const initialCourse = courseRaw as unknown as Course;
export const initialAssessment = mockDataRaw.assessment as unknown as Assessment;
export const initialSubmissions = mockDataRaw.submissions as unknown as Submission[];
export const initialCollusionPairs = (mockDataRaw as unknown as { collusionPairs: CollusionPair[] }).collusionPairs;
export const initialAnalytics = (mockDataRaw as unknown as { analytics: AnalyticsReport }).analytics;
export const initialTrustReport = (mockDataRaw as unknown as { trust: TrustReport }).trust;
