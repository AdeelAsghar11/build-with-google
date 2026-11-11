import "server-only";
import { z } from "zod";
import { callModel } from "../llm/client";
import { verifyQuote } from "./verifyEvidence";
import type { IngestFlags } from "../contracts";

const GuardResponseSchema = z.object({
  verdict: z.enum(["clean", "suspicious", "manipulation"]),
  spans: z.array(
    z.object({
      quote: z.string(),
      type: z.enum([
        "instruction_to_grader",
        "grade_request",
        "role_play",
        "fake_system_text",
        "encoded_text",
        "other",
      ]),
    })
  ),
  note: z.string(),
});

export type GuardResponse = z.infer<typeof GuardResponseSchema>;

export interface GuardResult {
  guard: {
    verdict: "clean" | "suspicious" | "manipulation";
    spans: { quote: string; type: string; verified: boolean }[];
    note: string;
    model: string;
  };
  quarantined: { text: string; start: number; end: number }[];
  textForGrading: string;
}

/**
 * Executes Guard model (Gemma / Guard model fallback) and sanitizes grader-directed manipulation spans.
 * Any flagged spans are verified against the raw text and quarantined to protect Grader models.
 */
export async function runGuard(
  question: string,
  text: string,
  heuristicHits: IngestFlags["heuristicHits"] = []
): Promise<GuardResult> {
  // Always provide a mock fallback for offline/fixture grading without API keys
  const mockFallback: GuardResponse = {
    verdict: heuristicHits.length > 0 ? "manipulation" : "clean",
    spans: heuristicHits.map((h) => ({
      quote: h.text,
      type: "grade_request" as const,
    })),
    note:
      heuristicHits.length > 0
        ? "Heuristic pattern detected grader-directed manipulation attempt."
        : "Screened clean by guard.",
  };

  let rawGuardData: GuardResponse;
  let modelName = process.env.MODEL_GUARD || "gemma-3-27b-it";

  try {
    const res = await callModel<GuardResponse>({
      role: "guard",
      promptId: "guard",
      variables: {
        QUESTION: question,
        SUBMISSION: text,
      },
      schema: GuardResponseSchema,
      mockFallback,
    });
    rawGuardData = res.data;
    modelName = res.model;
  } catch (err) {
    // If guard call fails, fallback to heuristics or clean
    console.warn("Guard model call failed, relying on heuristics:", err);
    if (heuristicHits.length > 0) {
      rawGuardData = {
        verdict: "manipulation",
        spans: heuristicHits.map((h) => ({
          quote: h.text,
          type: "grade_request" as const,
        })),
        note: "Heuristic fallback active.",
      };
    } else {
      rawGuardData = {
        verdict: "clean",
        spans: [],
        note: "Guard execution skipped or fallback clean.",
      };
    }
  }

  // Verify spans and calculate quarantine positions
  const verifiedSpans: { quote: string; type: string; verified: boolean }[] = [];
  const quarantined: { text: string; start: number; end: number }[] = [];
  let sanitizedText = text;

  // Add heuristic hits into quarantined spans
  for (const h of heuristicHits) {
    quarantined.push({
      text: h.text,
      start: h.start,
      end: h.end,
    });
  }

  for (const span of rawGuardData.spans) {
    const matchStatus = verifyQuote(span.quote, text);
    const isVerified = matchStatus === "verified" || matchStatus === "verified_fuzzy";

    verifiedSpans.push({
      quote: span.quote,
      type: span.type,
      verified: isVerified,
    });

    if (isVerified) {
      const idx = text.indexOf(span.quote);
      if (idx !== -1) {
        quarantined.push({
          text: span.quote,
          start: idx,
          end: idx + span.quote.length,
        });
      }
    }
  }

  // Replace quarantined spans in sanitizedText
  for (const q of quarantined) {
    if (sanitizedText.includes(q.text)) {
      sanitizedText = sanitizedText.replace(q.text, "[REMOVED: flagged content]");
    }
  }

  const finalVerdict =
    quarantined.length > 0
      ? rawGuardData.verdict === "clean"
        ? "manipulation"
        : rawGuardData.verdict
      : rawGuardData.verdict;

  return {
    guard: {
      verdict: finalVerdict,
      spans: verifiedSpans,
      note: rawGuardData.note,
      model: modelName,
    },
    quarantined,
    textForGrading: sanitizedText,
  };
}
