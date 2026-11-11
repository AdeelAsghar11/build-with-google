# Decision Log

Every meaningful decision goes here: architecture, library choice, threshold, model ID, scope cut, prompt change, workaround.
**Rules for humans and coding agents:**
1. Append only. Never edit or delete an old entry. To change a decision, add a new entry that says `Supersedes D-0xx`, and set the old entry's status line to `Superseded by D-0yy` (the only allowed edit).
2. Number sequentially. Use the next free `D-` number; if two people collide, the later merge renumbers.
3. Keep entries short: context → decision → why → consequences.
4. Small implementation choices go in the **Implementation log** at the bottom (one line each).

Template:
```
### D-0xx: <title>
- Date/time: YYYY-MM-DD HH:MM PKT · Author: Adeel|Ubaid|agent-name · Status: Accepted
- Context: <what forced the decision>
- Decision: <what we chose>
- Alternatives: <what we rejected and why>
- Consequences: <what this means for code/demo>
```

---

## Architecture decisions

### D-001: Product framing: teacher-assisted, not autonomous grading
- Date/time: 2026-11-11 11:30 PKT · Author: planning · Status: Accepted
- Context: Judges will ask how an institute could allow AI grading. Fully automatic grading invites accountability, appeal and policy objections.
- Decision: AI produces drafts only. No grade reaches a student without teacher approval. The teacher is accountable.
- Alternatives: Auto-release with teacher override (rejected: fails institutional trust test).
- Consequences: Review queue and approval state machine are MVP, not polish.

### D-002: Claim "measured and engineered against bias", never "unbiased"
- Date/time: 2026-11-11 11:30 PKT · Author: planning · Status: Accepted
- Context: Published audits show LLM graders have severity bias, halo effects and version drift. Claiming "unbiased" is false and the hackathon disqualifies false/misleading claims.
- Decision: Each known bias source (human or AI) gets a named mechanism and a visible metric (Trust Report).
- Consequences: Trust metrics are part of the product, not slides.

### D-003: Fixed, code-orchestrated multi-agent workflow (not autonomous agents)
- Date/time: 2026-11-11 11:30 PKT · Author: planning · Status: Accepted
- Context: Need reliability, auditability and injection resistance under a 3-hour build.
- Decision: Deterministic pipeline (state machine) calling specialised agents: Rubric Compiler, Guard, Grader A, Grader B, Arbiter, Feedback Writer. Agents have no tools, can't see each other, return schema-validated JSON.
- Alternatives: LangGraph/CrewAI-style autonomous agents with tool use (rejected: non-deterministic control flow, larger injection surface, slower to debug, extra dependency).
- Consequences: Orchestration is plain TypeScript; every step is unit-testable.

### D-004: LLMs output bands + evidence; code computes marks
- Date/time: 2026-11-11 11:30 PKT · Author: planning · Status: Accepted
- Context: Direct numeric scores from LLMs are poorly calibrated and drift between runs/models.
- Decision: 5 ordinal bands (FULL/MOSTLY/PARTIAL/MINIMAL/NONE) with rubric-specific descriptors. A pure `score()` function maps bands → marks.
- Consequences: Marks are reproducible and recomputable without AI calls.

### D-005: Strictness = deterministic partial-credit table, not a prompt instruction
- Date/time: 2026-11-11 11:30 PKT · Author: planning · Status: Accepted
- Context: "Be strict (4/5)" in a prompt has no stable meaning across runs or models.
- Decision: Graders never see strictness. Strictness selects a column in the band→fraction table (architecture §6.7). FULL=1 and NONE=0 at all levels.
- Consequences: Slider recomputes instantly; demo moment "strictness is math, not mood".

### D-006: Plagiarism scope = within-class collusion only
- Date/time: 2026-11-11 11:26 PKT · Author: team (Majid) · Status: Accepted
- Context: No external corpus; AI-writing detectors are unreliable.
- Decision: Lexical shingles + Gemini embeddings across the uploaded batch only. UI says "high similarity, needs teacher judgement".
- Consequences: Must not claim Turnitin-like or AI-text detection anywhere.

### D-007: Two graders on different models with different stances
- Date/time: 2026-11-11 11:30 PKT · Author: planning · Status: Accepted
- Context: Two calls to the same model with the same prompt give correlated errors; agreement would mean little.
- Decision: Grader A = evidence-first on `MODEL_GRADER_A`; Grader B = deficit-first on a different `MODEL_GRADER_B`. Splits → Arbiter (bounded to the graders' range) → teacher.
- Consequences: ~2× grader calls; agreement rate becomes a meaningful trust metric.

### D-008: Browser-driven batch, one submission per request
- Date/time: 2026-11-11 11:30 PKT · Author: planning · Status: Accepted
- Context: Long background jobs are fragile in Next.js/serverless; we need live progress.
- Decision: Client calls `POST …/submissions/[sid]/grade` per submission (concurrency 3), then `POST …/finalize`.
- Alternatives: Cloud Tasks / Functions queue (rejected for hackathon time; listed for production).
- Consequences: Progress UI needs no realtime listener; per-submission retry is trivial.

### D-009: Firestore accessed only from the server
- Date/time: 2026-11-11 11:30 PKT · Author: planning · Status: Accepted
- Context: Security rules for multi-collection ownership take time to get right; student data is sensitive.
- Decision: Client Firestore rules deny all. All access via route handlers using `firebase-admin` + `requireTeacher()`.
- Consequences: Simple, strong security story; no client-side realtime (fine per D-008).

### D-010: Don't store raw uploaded files in MVP
- Date/time: 2026-11-11 11:30 PKT · Author: planning · Status: Accepted
- Context: Cloud Storage for Firebase setup/billing is extra risk; we only need text.
- Decision: Parse uploads in memory; store original text (for teacher view) and grading text in Firestore.
- Consequences: Cloud Storage moves to stretch / production.

### D-011: PII never reaches a model
- Date/time: 2026-11-11 11:30 PKT · Author: planning · Status: Accepted
- Decision: Roster names, roll numbers, emails, phones redacted before Guard/Graders. Random pseudonyms (shuffled, not alphabetical). Identity map teacher-only.
- Consequences: Identity-based bias can't enter through the model; also covers privacy guideline.

### D-012: Prompt-injection defence in depth (9 layers)
- Date/time: 2026-11-11 11:30 PKT · Author: planning · Status: Accepted
- Context: Research shows hidden-instruction attacks raise LLM grader scores and models rarely report them.
- Decision: Sanitizer → heuristics → Gemma Guard + quarantine → nonce delimiting + sandwich prompt → no tools + enum schema → evidence lock → canary field → human gate → red-team suite (architecture §7).
- Consequences: Red-team suite must exist before demo; any flag forces review.

### D-013: Per-criterion isolated grading by default
- Date/time: 2026-11-11 11:30 PKT · Author: planning · Status: Accepted
- Context: Halo effect: one strong section inflates others when judged together.
- Decision: One call per (grader, criterion). Fallback `GRADING_MODE=per_submission` with randomized criteria order only if rate-limited.
- Consequences: More calls; mitigated by cache + pre-graded demo batch.

### D-014: Calibration via blind anchors with shrinkage + LOO error
- Date/time: 2026-11-11 11:30 PKT · Author: planning · Status: Accepted (stretch)
- Decision: 3 anchors (20/50/80th percentile), teacher grades blind, per-criterion offset shrunk by n/(n+2), report leave-one-out MAE before/after.
- Consequences: Honest small-sample framing in UI and pitch.

### D-015: Guard on Gemma (different model family)
- Date/time: 2026-11-11 11:30 PKT · Author: planning · Status: Accepted
- Context: A detector from the same family as the graders shares blind spots; Gemma also adds Google-tech coverage.
- Decision: `MODEL_GUARD` = Gemma via Gemini API; instructions in user turn; lenient JSON parse; fallback to Flash-Lite after 2 failures (logged).

### D-016: Randomized review order + break nudge
- Date/time: 2026-11-11 11:30 PKT · Author: planning · Status: Accepted
- Context: Canvas study: alphabetical order turns grader fatigue into surname disparity; breaks partially reset it.
- Decision: Review queue = flagged first, then seeded random order. Nudge after 20 reviews / 30 min.

### D-017: Feedback Writer never states numbers
- Date/time: 2026-11-11 11:30 PKT · Author: planning · Status: Accepted
- Decision: UI renders marks from scorer; writer produces qualitative text tied to verified quotes. Regenerated if teacher changes marks.
- Consequences: No mismatch between feedback text and marks.

### D-018: Stack
- Date/time: 2026-11-11 11:30 PKT · Author: planning · Status: Accepted
- Decision: Next.js App Router + TS, Tailwind + shadcn/ui + Recharts, zod, `@google/genai`, Firebase Auth + Firestore (admin SDK), vitest, p-limit.
- Alternatives: Flutter (rejected: web dashboard + charts faster in Next.js for this team), Python FastAPI backend (rejected: two runtimes in 3 hours).

### D-019: Demo data is synthetic and team-written
- Date/time: 2026-11-11 11:30 PKT · Author: planning · Status: Accepted
- Context: Responsible AI rules forbid unauthorized datasets.
- Decision: 12 synthetic scripts (with planted cases) written by the team with AI assistance, disclosed as such. No real student work.

### D-020: Consolidated solo development by Adeel
- Date/time: 2026-11-11 12:03 PKT · Author: Adeel · Status: Accepted
- Context: Team structure updated. All development work (AI pipeline, app, analytics, and UI) is consolidated under a single developer (Adeel) and single agent.
- Decision: Remove separate lanes for Ubaid. Adeel owns the end-to-end stack. Sequential execution top-down prioritizing P0 features before 14:00 PKT freeze.
- Consequences: All files are in Adeel's scope. Merge protocol simplified to direct commits on main with mandatory git push after each completed roadmap step.

---

## Pending decisions (fill in during build)

- [ ] D-0xx Verified model IDs from `models.list` (M0)
- [ ] D-0xx Final collusion thresholds after fixture tuning (M6)
- [ ] D-0xx Whether `GRADING_MODE` stayed `per_criterion` (M4)
- [ ] D-0xx Course/topic used for the demo assessment (M0)

---

## Implementation log (one line each, newest at bottom)

Format: `YYYY-MM-DD HH:MM · who · what · why`

- 2026-11-11 11:30 · planning · docs created (project, architecture, decision, progress, roadmap, AGENTS) · kickoff
- 2026-11-11 12:03 · Adeel · D-020: consolidated all development to Adeel; mandatory git push after each roadmap step · workflow alignment
