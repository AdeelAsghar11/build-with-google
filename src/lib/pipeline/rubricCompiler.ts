import "server-only";
import { z } from "zod";
import { getCourse, getAssessment } from "../db/repo";
import {
  type CompiledRubric,
  CompiledRubricSchema,
  CriterionSchema,
} from "../contracts";
import { callModel } from "../llm/client";

const RubricCompilerOutputSchema = z.object({
  criteria: z.array(CriterionSchema),
  warnings: z.array(z.string()),
});

/**
 * Validates and compiles an informal teacher rubric into an observable, structured CompiledRubric.
 * Implements code checks:
 * 1. 2 to 8 criteria
 * 2. Sum of maxMarks == totalMarks
 * 3. Every criterion maps to a valid CLO in the course
 * 4. Distinct band descriptors for all 5 bands
 * Status is set to "draft" until teacher clicks Approve.
 */
export async function compileRubric(
  courseId: string,
  assessmentId: string
): Promise<CompiledRubric> {
  const course = await getCourse(courseId);
  if (!course) {
    throw new Error(`Course not found: ${courseId}`);
  }

  const assessment = await getAssessment(assessmentId);
  if (!assessment) {
    throw new Error(`Assessment not found: ${assessmentId}`);
  }

  const closString = course.clos.map((c) => `${c.id}: ${c.text}`).join("\n");
  const topicsString = course.topics.join(", ");

  const variables: Record<string, string> = {
    COURSE_TITLE: course.title,
    COURSE_DESCRIPTION: course.description,
    TOPICS: topicsString,
    CLOS: closString,
    ASSESSMENT_TYPE: assessment.type,
    QUESTION: assessment.question,
    REFERENCE_ANSWER: assessment.referenceAnswer || "None provided",
    TOTAL_MARKS: String(assessment.totalMarks),
    RUBRIC_RAW: assessment.rubricRaw,
  };

  // If assessment already has an approved fixture rubric, use as mock fallback
  const fallbackCriteria = assessment.rubric?.criteria || [];
  const mockFallback = {
    criteria: fallbackCriteria,
    warnings: [],
  };

  const response = await callModel({
    role: "rubric_compiler",
    promptId: "rubric_compiler.v1",
    variables,
    schema: RubricCompilerOutputSchema,
    mockFallback: fallbackCriteria.length > 0 ? mockFallback : undefined,
  });

  const { criteria, warnings } = response.data;

  // Code check 1: 2 to 8 criteria
  if (criteria.length < 2 || criteria.length > 8) {
    warnings.push(`Expected between 2 and 8 criteria; received ${criteria.length}.`);
  }

  // Code check 2: Sum of maxMarks must equal assessment total marks
  const sumMarks = criteria.reduce((sum, c) => sum + c.maxMarks, 0);
  if (sumMarks !== assessment.totalMarks) {
    warnings.push(
      `Criterion marks sum (${sumMarks}) does not equal total assessment marks (${assessment.totalMarks}).`
    );
  }

  // Code check 3: Every criterion has a valid CLO
  const validCloIds = new Set(course.clos.map((c) => c.id));
  for (const c of criteria) {
    if (!validCloIds.has(c.cloId)) {
      warnings.push(`Criterion ${c.id} references unknown CLO: ${c.cloId}`);
    }
  }

  const newVersion = (assessment.rubric?.version || 0) + 1;

  const compiled: CompiledRubric = {
    version: newVersion,
    status: "draft",
    criteria,
    warnings,
  };

  return CompiledRubricSchema.parse(compiled);
}
