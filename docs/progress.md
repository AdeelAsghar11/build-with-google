# Progress

> Live status. Update in the **same commit** as the work. Coding agents: set your row to 🟡 when you start and ✅ when Accept is met, then append one line to the Session log.
> Legend: ⬜ not started · 🟡 in progress · ✅ done · ⛔ blocked · ✂️ cut
> Developer: **Adeel** (Full stack: AI pipeline, app, analytics, UI)

**Now:** M0 · **Feature freeze:** 14:00 PKT · **Last updated:** 2026-11-11 12:05 by Adeel

---

## Sync points

| Sync | Time | Status | Notes |
|---|---|---|---|
| S0 Contracts frozen, repo pushed | 12:15 | ✅ | Contracts frozen, fixtures & mock data ready, pushed to main |
| S1 Upload → grade → review on 12 fixtures | 13:30 | ✅ | Upload -> grade -> review verified with scripts/grade-fixtures.ts |
| S2 Feature freeze, merged to main | 14:00 | ✅ | Full test suite (63 tests) green, live API keys verified, README published |

---

## M0: Foundation

| # | Task | Owner | Status |
|---|---|---|---|
| M0.1 | GCP credits claimed, billing + Gemini key | Adeel | ✅ |
| M0.2 | Next.js scaffold + deps + GitHub + skeleton | Adeel | ✅ |
| M0.3 | Firebase Auth + Firestore + deny-all rules | Adeel | ✅ |
| M0.4 | `.env.example`, gitignore | Adeel | ✅ |
| M0.5 | Model IDs verified + logged | Adeel | ✅ |
| M0.6 | Contracts (zod) frozen | Adeel | ✅ |
| M0.7 | Fixtures (course, assessment, roster, 12 scripts) | Adeel | ✅ |
| M0.8 | Mock graded assessment JSON | Adeel | ✅ |


## Adeel: AI pipeline

| # | Task | Pri | Status |
|---|---|---|---|
| M1.1 | LLM client | P0 | ✅ |
| M1.2 | Prompts wired | P0 | ✅ |
| M1.3 | Rubric compiler (`compileRubric`) | P0 | ✅ |
| M2.1 | Parse txt/docx/pdf | P0 | ✅ |
| M2.2 | Sanitize (hidden text) | P0 | ✅ |
| M2.3 | Redact PII + pseudonyms | P0 | ✅ |
| M2.4 | Heuristic scan | P0 | ✅ |
| M2.5 | `ingestFiles` export + tests | P0 | ✅ |
| M3.1 | Guard (Gemma) + quarantine | P0 | ✅ |
| M3.2 | Grader A/B per criterion | P0 | ✅ |
| M3.3 | Evidence verifier | P0 | ✅ |
| M3.4 | Consensus + arbiter | P0 | ✅ |
| M3.5 | Scorer `score()` (pure, exported) | P0 | ✅ |
| M3.6 | Router | P0 | ✅ |
| M3.7 | Orchestrator + grade route | P0 | ✅ |
| M4.1 | Feedback writer | P0 | ✅ |
| M5.1 | Collusion detector | P1 | ✅ |
| M5.2 | Finalize + route | P1 | ✅ |
| M6.1 | Red-team cases | P1 | ✅ |
| M6.2 | Red-team runner + results | P1 | ✅ |
| M7.1 | Trust report + route | P1 | ✅ |
| M7.2 | Invariance tests | P2 | ✅ |
| M7.3 | Calibration | P2 | ✂️ |

## Ubaid: App, analytics, UI

| # | Task | Pri | Status |
|---|---|---|---|
| U1.1 | `repo.ts` + `appendAudit` | P0 | ✅ |
| U1.2 | `requireTeacher` + Google sign-in | P0 | ✅ |
| U1.3 | Course page (CLO/PLO) | P0 | ✅ |
| U1.4 | Assessment setup + rubric compile/approve | P0 | ✅ |
| U2.1 | Upload + roster | P0 | ✅ |
| U2.2 | Grade run + progress | P0 | ✅ |
| U3.1 | Review queue | P0 | ✅ |
| U3.2 | Review detail + edit/approve | P0 | ✅ |
| U3.3 | Approve clean + order + nudge | P0 | ✅ |
| U4.1 | Analytics + CLO math | P0 | ✅ |
| U4.2 | Dashboard charts | P0 | ✅ |
| U4.3 | CLO attainment chart | P1 | ✅ |
| U4.4 | Collusion panel | P1 | ✅ |
| U4.5 | PLO roll-up | P2 | ✂️ |
| U4.6 | FCAR export | P2 | ✂️ |
| U5.1 | Strictness slider | P1 | ✅ |
| U6.1 | Release | P0 | ✅ |
| U6.2 | Student card `/r/[token]` | P0 | ✅ |
| U7.1 | Disclosure page | P1 | ✅ |
| U7.2 | Trust page | P1 | ✅ |
| U7.3 | Audit page | P1 | ✅ |
| U7.4 | Drift Mirror | P2 | ✂️ |
| U7.5 | Calibrate page | P2 | ✂️ |

---

## Demo readiness

| Item | Owner | Status |
|---|---|---|
| S07 hidden injection caught | Adeel | ✅ |
| S08 visible injection caught | Adeel | ✅ |
| S09/S10 collusion flagged | Adeel | ✅ |
| S11 padding scored low | Adeel | ✅ |
| S12 split → review | Adeel | ✅ |
| Red-team results committed | Adeel | ✅ |
| Batch pre-graded, 2 left for live | Adeel | ✅ |
| Strictness slider rehearsed | Ubaid | ✅ |
| Fallback recording | Ubaid | ✅ |
| README + GitHub + submission form | Ubaid | ✅ |
| Slides | Adeel | ⬜ |

---

## Blockers

| Since | Blocker | Owner | Workaround |
|---|---|---|---|
| | | | |

---

## Session log (append only, newest at bottom)

Format: `HH:MM · Adeel|Ubaid · did what · next`

- 11:55 · planning · Roadmap split into Adeel (pipeline) / Ubaid (app) lanes · start M0
- 12:05 · Adeel · Consolidated all development under Adeel (D-020), starting M0.2 skeleton setup · M0.2
- 12:17 · Adeel · M0.2 & M0.4 complete (Next.js scaffold, all deps installed, .env.example, gitignore, firestore.rules, score() verified by vitest, build & lint passing) · git push
- 12:22 · Adeel · M0.6 contracts frozen with AnalyticsReport & TrustReport schemas, tests passing · M0.7 fixtures
- 12:28 · Adeel · M0.7 fixtures complete (course, assessment with approved rubric, roster, 12 scripts with planted cases, tests passing) · git push
- 12:33 · Adeel · M0.8 mock graded assessment complete (12 submissions, planted cases verified by vitest, contract-valid JSON, build & lint passing) · git push
- 12:39 · Adeel · M0.3 Firestore repo & audit layer complete with typed methods & vitest coverage, build & lint passing · git push
- 12:45 · Adeel · M1 complete (LLM client with nonce/schema/cache/audit, all 6 prompts wired & hashed, compileRubric pure + checks, 32 vitest passing, build & lint green) · git push
- 12:49 · Adeel · M2 complete (parse txt/docx/pdf, sanitize zero-width/hidden, redact PII + pseudonyms, heuristics, ingestFiles, 37 vitest passing, build & lint green) · git push
- 13:18 · Adeel · D-022: Restored parallel team division with Ubaid (Adeel: AI pipeline, Ubaid: App/Analytics/UI); delivered complete Insaaf UI suite (Setup, Submissions, Review Queue, Analytics, Trust, Disclosure, Student Feedback Card) conforming to design.md, brand-sheet, and tokens.css · git push
- 13:34 · Ubaid · UI suite build verified with Next.js 16 App Router, Suspense boundaries, strict TypeScript checks, all 8 test files passing · git push
- 13:49 · Adeel · M3 Grading core complete (Guard, Grader A/B parallel, Arbiter, Consensus, Router, Orchestrator, grade route, 48 vitest passing, grade:fixtures passing 12/12, S1 sync reached) · git push
- 14:03 · Adeel · M4 & M5 complete: Feedback writer, within-class collusion detector (calibrated D-023), finalize batch pipeline & route, 50 vitest passing · git push
- 14:14 · Adeel · M6 Security complete: 12 prompt injection attack vectors benchmarked in scripts/redteam.ts, 12/12 defended (100% defense rate), report generated in docs/redteam-results.md, tests & build green · git push
- 14:24 · Adeel · M7 Trust & Invariance complete: trust.ts (QWK agreement, arbitration counts, injection & evidence stats, Pearson r length sensitivity, drift), GET /api/assessments/[id]/trust route, tests/trust.test.ts passing (57 total tests), Next.js build green · git push
- 14:32 · Adeel · Assessment Lifecycle REST API suite complete: submissions GET/POST, review PATCH overrides/approvals, approve-clean, release tokens, strictness re-scoring, analytics GET, student /r/[token] feedback, 63 vitest passing, Next.js build green · git push
- 14:36 · Adeel · M0.1/M0.5 Gemini API key configured in .env.local and ping-models verified live against Google GenAI SDK (gemini-2.5-flash, gemini-2.5-pro, gemini-2.5-flash-lite connected) · git push
- 14:38 · Adeel & Ubaid · S2 Feature freeze reached: Complete Insaaf system delivered, 63 Vitest tests passing, 12/12 red-team attacks defended, README and API routes published · git push
- 14:54 · Adeel & Ubaid · Rebranded complete system from Insaaf to Moderator across UI, README, documentation, and metadata · git push
