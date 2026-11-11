import { describe, it, expect } from "vitest";
import { z } from "zod";
import { loadPrompt, renderPrompt } from "../src/lib/llm/prompts";
import { callModel } from "../src/lib/llm/client";

describe("Prompts Wiring (M1.2)", () => {
  const promptIds = [
    "arbiter.v1",
    "feedback.v1",
    "grader_a.v1",
    "grader_b.v1",
    "guard.v1",
    "rubric_compiler.v1",
  ];

  it("loads all 6 prompt files with system and user sections and 8-char version hash", () => {
    for (const id of promptIds) {
      const loaded = loadPrompt(id);
      expect(loaded.promptId).toBe(id);
      expect(loaded.promptVersion).toMatch(/@[a-f0-9]{8}$/);
      expect(loaded.userTemplate.length).toBeGreaterThan(10);
    }
  });

  it("renders prompt with unique nonce and substituted variables", () => {
    const rendered1 = renderPrompt("guard.v1", {
      QUESTION: "Explain overfitting",
      SUBMISSION: "My answer text",
    });
    const rendered2 = renderPrompt("guard.v1", {
      QUESTION: "Explain overfitting",
      SUBMISSION: "My answer text",
    });

    // Each call generates a fresh, unique nonce
    expect(rendered1.nonce).toBeDefined();
    expect(rendered2.nonce).toBeDefined();
    expect(rendered1.nonce).not.toBe(rendered2.nonce);

    // Placeholder substitution verified
    expect(rendered1.user).toContain("Explain overfitting");
    expect(rendered1.user).toContain("My answer text");
    expect(rendered1.user).toContain(`<student_submission_${rendered1.nonce}>`);
    expect(rendered1.user).not.toContain("{{QUESTION}}");
  });
});

describe("LLM Client (M1.1)", () => {
  const DummySchema = z.object({
    verdict: z.string(),
    score: z.number(),
  });

  it("returns validated data using mockFallback when API key is not present", async () => {
    const mock = { verdict: "clean", score: 100 };
    const res = await callModel({
      role: "test_role",
      promptId: "guard.v1",
      variables: {
        QUESTION: "What is ML?",
        SUBMISSION: "Sample answer",
      },
      schema: DummySchema,
      mockFallback: mock,
    });

    expect(res.data.verdict).toBe("clean");
    expect(res.data.score).toBe(100);
    expect(res.promptVersion).toContain("guard.v1@");
  });

  it("caches successful output on subsequent identical calls", async () => {
    const mock = { verdict: "cached_test", score: 99 };
    const res1 = await callModel({
      role: "cache_role",
      promptId: "guard.v1",
      variables: {
        QUESTION: "Static Question",
        SUBMISSION: "Static Answer",
      },
      schema: DummySchema,
      mockFallback: mock,
    });
    expect(res1.data.verdict).toBe("cached_test");

    // Second call should hit cache
    const res2 = await callModel({
      role: "cache_role",
      promptId: "guard.v1",
      variables: {
        QUESTION: "Static Question",
        SUBMISSION: "Static Answer",
      },
      schema: DummySchema,
      mockFallback: mock,
    });

    expect(res2.cached).toBe(true);
    expect(res2.latencyMs).toBe(0);
    expect(res2.data.verdict).toBe("cached_test");
  });
});
