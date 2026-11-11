# Prompts

Each file has two sections, split by `client.ts` on the exact headers `## SYSTEM` and `## USER`.
- `## SYSTEM` → `systemInstruction` (rules only, never student text).
- `## USER` → user content template. Placeholders `{{LIKE_THIS}}` are filled by code. `{{NONCE}}` is a fresh random hex string per call.
- Models without system-instruction support (Gemma guard): client prepends SYSTEM text to the user turn, then the USER template.

Versioning: `promptVersion = <filename-without-.md>@<sha256(file)[0:8]>`. Changing meaning → new file `*.v2.md`, decision-log entry, `npm run redteam`.

| File | Agent | Model env |
|---|---|---|
| rubric_compiler.v1.md | Rubric Compiler | MODEL_COMPILER |
| guard.v1.md | Guard | MODEL_GUARD |
| grader_a.v1.md | Grader A (evidence-first) | MODEL_GRADER_A |
| grader_b.v1.md | Grader B (deficit-first) | MODEL_GRADER_B |
| arbiter.v1.md | Arbiter | MODEL_ARBITER |
| feedback.v1.md | Feedback Writer | MODEL_FEEDBACK |
