# AGENTS.md: read this before touching code

You are a coding agent on **Moderator**, a teacher-assisted, bias-audited AI grading system (Build with Google Hackathon, 2026-11-11). **Adeel** and **Ubaid** develop the project in parallel:
- **Adeel**: AI pipeline & backend core (`src/lib/llm`, `src/lib/ingest`, `src/lib/pipeline`, `src/lib/batch/`, `prompts/`, `scripts/`, `tests/`, `fixtures/`)
- **Ubaid**: App, analytics, and UI (`src/app/**`, `src/components/**`, `src/lib/db/`, `src/lib/auth.ts`, `src/styles/tokens.css`, `firestore.rules`)

## Read order (every session)
1. `docs/progress.md`: what's done, what's next, blockers
2. `docs/roadmap.md`: the next task and its **Accept** criteria
3. `docs/architecture.md`: the section for that task (contracts in §8)
4. `docs/decision.md`: don't contradict accepted decisions
5. `docs/project.md`: only if you need product context
6. `docs/design.md`, `docs/brand-sheet.md`, `docs/brand-sheet.html`, `src/styles/tokens.css`: **Mandatory UI reference.** Whenever building interface pages, components, or any UI element, you MUST strictly follow these design documents. Use the examination-paper and marking-ink metaphor, semantic tokens (`tokens.css`), typography (Source Serif 4, Source Sans 3, IBM Plex Mono, Noto Nastaliq Urdu), criterion-linked evidence underlines, single primary button rule, anti-AI-slop rules, and WCAG 2.2 AA accessibility guidelines.

## Clock
Feature freeze **14:00 PKT**. Presentations may start 14:30. Prefer a working narrow feature over a broken broad one. If a task will overrun, ship the P0 part, mark the rest ✂️ in progress.md, and log it.

## Non-negotiable invariants
1. **LLMs never compute marks.** Models return bands + evidence. Marks come only from `lib/pipeline/score.ts` (pure function). Never store a model-produced number as a mark.
2. **No release without teacher approval.** Only `approved` submissions can become `released`.
3. **PII never reaches a model.** Everything sent to an LLM goes through `ingest/redact.ts` first. Student names live only in the `identity` collection.
4. **Student submissions are untrusted data.** Always wrap them in the nonce-delimited block from `lib/llm/client.ts`. Never interpolate submission text into instructions or system prompts.
5. **All model calls go through `lib/llm/client.ts`.** No direct SDK calls elsewhere. Temperature 0. Schema-validated output.
6. **Prompts live in `/prompts/*.vN.md`.** Editing a prompt's meaning = new version file + decision log entry + rerun `npm run redteam`.
7. **Evidence must be verified** by `verifyEvidence.ts` before it can support a band or appear in feedback.
8. **Every state change writes an audit entry** via `lib/audit.ts`. Audit is append-only.
9. **Contracts in `src/lib/contracts/` are frozen.** Changing them needs a decision entry.
10. **Firestore is server-only** (`firebase-admin` in `lib/db/repo.ts`). Client rules deny all. Never import `firebase-admin` or secrets into client components.
11. **Never claim** "unbiased", "plagiarism detected", "AI-written", or accuracy numbers that weren't measured. UI wording: "high similarity, needs teacher judgement".
12. Demo data is synthetic. Never add real student work or real student names.

- **Adeel**: `src/lib/llm`, `src/lib/ingest`, `src/lib/pipeline`, `src/lib/batch/`, `prompts/`, `scripts/`, `tests/`
- **Ubaid**: `src/lib/db/`, `src/app/**`, `src/components/**`, `src/styles/tokens.css`, `firestore.rules`

## Coding conventions
- TypeScript strict; no `any` in `lib/`. zod-parse every API body and every model output.
- Route handlers are thin: `requireTeacher()` → parse → call `lib` → `appendAudit()` → respond.
- Business logic in `lib/` as pure functions where possible; components only render.
- Server-only modules start with `import "server-only";`.
- Errors: never crash a batch. One failed submission becomes `status:"error"` with a message and can be retried.
- Small files, named exports, no default exports in `lib/`.
- No new dependencies without a one-line implementation-log entry in decision.md.

## Commands
```
npm run dev          # local app
npm test             # vitest (scorer, verifier, sanitizer, redactor, collusion, analytics)
npm run redteam      # tsx scripts/redteam.ts → docs/redteam-results.md
npm run grade:fixtures  # tsx scripts/grade-fixtures.ts (Adeel: end-to-end without UI)
npm run lint && npm run build   # before every merge
```
Env: copy `.env.example` → `.env.local`. Model IDs come from env only.

## Definition of done (per task)
- Accept criteria from roadmap.md met and checked by actually running it
- Unit tests for any pure function you added (scorer, verifier, sanitizer, redactor, collusion, analytics are mandatory)
- `lint`, `test`, `build` pass
- `progress.md` row updated + one session-log line
- Any choice another dev would ask "why?" about → decision.md entry (or implementation-log line if small)
- **Git push:** Always `git push` to GitHub after each `roadmap.md` step completion

## When stuck
- Blocked > 10 min on setup (Firebase, keys, quotas): write it in progress.md Blockers, use the documented fallback (`AUTH_MODE=demo`, `GRADING_MODE=per_submission`, Gemma → `MODEL_GUARD_FALLBACK`), log the decision, keep going.
- Spec unclear: pick the option that preserves the invariants above, log it, continue. Don't stop to ask unless an invariant is at stake.
- Model output invalid: fix the prompt/schema, don't add post-hoc string hacks that guess marks.

## Don'ts
- Don't add LangChain/LangGraph/CrewAI or any agent framework (D-003).
- Don't let graders see strictness, other criteria, other graders, totals or identity (D-005, D-013, D-011).
- Don't sort anything shown to the teacher for review alphabetically (D-016).
- Don't build features from the Cut List before every P0 is green.
- Don't write design system work into this repo; `design.md` will come from the team.
