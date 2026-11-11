import "server-only";
import { GoogleGenAI } from "@google/genai";
import pLimit from "p-limit";
import crypto from "crypto";
import type { z } from "zod";
import { renderPrompt } from "./prompts";
import { getLlmCache, saveLlmCache } from "../db/repo";
import { appendAudit } from "../audit";

const concurrencyLimit = parseInt(process.env.LLM_CONCURRENCY || "6", 10);
const limit = pLimit(concurrencyLimit);

export interface CallModelOptions<T> {
  role: string;
  model?: string;
  promptId: string;
  variables: Record<string, string>;
  schema?: z.ZodSchema<T>;
  timeoutMs?: number;
  mockFallback?: T;
}

export interface CallModelResult<T> {
  data: T;
  model: string;
  promptVersion: string;
  cached: boolean;
  latencyMs: number;
}

function cleanJsonString(str: string): string {
  let cleaned = str.trim();
  // Strip markdown code fences if present
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

/**
 * Universal model call wrapper adhering to Moderator architecture:
 * - Isolated prompt loading & version hashing
 * - Nonce-delimited untrusted student inputs
 * - Structured JSON schema enforcement with Zod
 * - Automatic exponential backoff for 429/5xx errors
 * - Global concurrency limiting via p-limit
 * - Persistent caching in Firestore/Memory
 * - Append-only audit logging
 */
export async function callModel<T = unknown>(
  options: CallModelOptions<T>
): Promise<CallModelResult<T>> {
  const { role, promptId, variables, schema, mockFallback } = options;

  const defaultModels: Record<string, string> = {
    grader_a: process.env.MODEL_GRADER_A || "gemini-2.5-flash",
    grader_b: process.env.MODEL_GRADER_B || "gemini-2.5-flash-lite",
    arbiter: process.env.MODEL_ARBITER || "gemini-2.5-pro",
    rubric_compiler: process.env.MODEL_COMPILER || "gemini-2.5-pro",
    feedback: process.env.MODEL_FEEDBACK || "gemini-2.5-flash",
    guard: process.env.MODEL_GUARD || "gemma-3-27b-it",
  };

  const model = options.model || defaultModels[promptId] || "gemini-2.5-flash";
  const rendered = renderPrompt(promptId, variables);
  const promptVersion = rendered.promptVersion;

  // Compute cache key excluding random nonce so repeated submissions with identical content hit cache
  const stableInput = JSON.stringify({ model, promptVersion, variables });
  const cacheKey = crypto.createHash("sha256").update(stableInput).digest("hex");

  const useCache = process.env.LLM_CACHE !== "off";
  if (useCache) {
    const cached = await getLlmCache<T>(cacheKey);
    if (cached !== null) {
      if (schema) {
        const validated = schema.safeParse(cached);
        if (validated.success) {
          return {
            data: validated.data,
            model,
            promptVersion,
            cached: true,
            latencyMs: 0,
          };
        }
      } else {
        return {
          data: cached,
          model,
          promptVersion,
          cached: true,
          latencyMs: 0,
        };
      }
    }
  }

  const apiKey = process.env.GEMINI_API_KEY;

  // If no API key is provided and mock fallback exists, return mock (and cache if enabled)
  if (!apiKey) {
    if (mockFallback !== undefined) {
      if (schema) schema.parse(mockFallback);
      if (useCache) {
        await saveLlmCache(cacheKey, mockFallback);
      }
      return {
        data: mockFallback,
        model,
        promptVersion,
        cached: false,
        latencyMs: 1,
      };
    }
    throw new Error(
      `GEMINI_API_KEY is not configured and no mock fallback provided for role: ${role}`
    );
  }

  const ai = new GoogleGenAI({ apiKey });

  return limit(async () => {
    const startTime = Date.now();
    let attempt = 0;
    const maxAttempts = 3;
    let lastError: Error | null = null;

    while (attempt < maxAttempts) {
      attempt++;
      try {
        const isGemma = model.toLowerCase().includes("gemma");

        // Gemma compatibility: put system instructions in user turn
        const contents = isGemma
          ? `${rendered.system}\n\n${rendered.user}`
          : rendered.user;

        const config: Record<string, unknown> = {
          temperature: 0,
        };

        if (!isGemma && rendered.system) {
          config.systemInstruction = rendered.system;
        }

        const response = await ai.models.generateContent({
          model,
          contents,
          config,
        });

        const rawText = response.text || "";
        const cleaned = cleanJsonString(rawText);
        const parsed = JSON.parse(cleaned);

        let validatedData = parsed;
        if (schema) {
          const result = schema.safeParse(parsed);
          if (!result.success) {
            throw new Error(`Output schema validation failed: ${result.error.message}`);
          }
          validatedData = result.data;
        }

        const latencyMs = Date.now() - startTime;

        if (useCache) {
          await saveLlmCache(cacheKey, validatedData);
        }

        // Record append-only audit
        await appendAudit({
          ts: new Date().toISOString(),
          actor: "system",
          action: "llm_call",
          model,
          promptVersion,
          detail: `Role: ${role}, Latency: ${latencyMs}ms`,
        });

        return {
          data: validatedData,
          model,
          promptVersion,
          cached: false,
          latencyMs,
        };
      } catch (err: unknown) {
        lastError = err instanceof Error ? err : new Error(String(err));
        // Exponential backoff with jitter on retry
        if (attempt < maxAttempts) {
          const delay = Math.pow(2, attempt - 1) * 1000 + Math.random() * 500;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    // Fallback if provided before throwing
    if (mockFallback !== undefined) {
      return {
        data: mockFallback,
        model,
        promptVersion,
        cached: false,
        latencyMs: Date.now() - startTime,
      };
    }

    throw new Error(
      `Model call failed after ${maxAttempts} attempts for role ${role}: ${lastError?.message}`
    );
  });
}
