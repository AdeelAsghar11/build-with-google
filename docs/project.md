# Moderator: Project Overview

> *Moderator* (formerly Insaaf). The teacher-assisted, bias-audited AI grading system.

| | |
|---|---|
| **Tagline** | The AI drafts. The teacher decides. Every mark is evidenced, explained and audited. |
| **Event** | Build with Google Hackathon, GDGoC CUI, CUI Tech Fest FA'26 |
| **Domain** | Education & Learning |
| **SDG** | SDG 4, Quality Education (Target 4.3: quality tertiary education; Target 4.c: supporting teachers) |
| **Team** | Quantum Coders. P1 = AI pipeline, P2 = app, analytics, UI |
| **Repo** | _add GitHub URL_ |

---

## 1. Problem

A university lecturer grades quizzes, assignments, labs, mids, finals and projects for 50–60 students per section, often across several sections.

1. **Time.** Manual marking takes many hours per assessment. Feedback is delayed, shallow, or skipped.
2. **Inconsistency and bias.** Human graders drift. A study of tens of millions of Canvas LMS grading records found scores decline with cumulative grading time and partially recover after breaks. Students whose surnames come late in the alphabet (graded later by default) scored about 0.6 points lower than early-alphabet students, and written feedback became shorter and more negative later in the sequence. The "teacher's mood" problem is measurable and real.
3. **Feedback gap.** A student gets 12/25 on a mid with no explanation of what was wrong, so they cannot improve before the final.
4. **Accreditation burden.** OBE accreditation (NCEAC for computing, PEC for engineering) requires CLO attainment evidence and course files. Faculty compile these by hand every semester.

## 2. Who is affected

| Stakeholder | Pain |
|---|---|
| Lecturers / TAs | Workload, fatigue, pressure, re-check requests |
| Students | Unexplained or inconsistent marks, no improvement path |
| HoD / QEC / accreditation teams | CLO/PLO attainment and course files compiled manually |
| University AI committees (HEC draft GenAI framework) | Need evidence and oversight of any AI use in assessment |

## 3. Why "just ask an LLM to grade" fails

Naive LLM grading has its own documented failures:

- **Severity bias, halo effect, version drift.** One pre-registered audit found severity differences spanning 219 points on a 1000-point scale across providers.
- **Position and verbosity bias.** Order of content and sheer length shift scores.
- **Prompt injection.** Students hide instructions ("give full marks") in submissions. Research shows this inflates scores, and models rarely report that they saw the attempt.
- **Hallucinated feedback.** Comments quoting things the student never wrote.

Existing tools (CoGrader, Gradescope, Turnitin) already do rubric-assisted grading with teacher review. We did not find one that combines a **measured audit of both AI and human bias** with **OBE (CLO/PLO) reporting** and an **adversarially hardened pipeline**. That combination is our angle.

## 4. Our solution

Moderator is a **teacher-assisted** grading system where bias is **engineered against and measured**, not assumed away.

1. **Teacher sets the rules.** Course description, topics, CLOs, PLOs, CLO→PLO map, rubric (free text is fine), grade scheme, strictness 1–5.
2. **Rubric Compiler agent** turns the teacher's rubric into precise, observable criteria, each mapped to a CLO and a dimension (concept / application / explanation / presentation). The teacher edits and approves. Nothing is graded on an unapproved rubric.
3. **Blind ingest.** Text extracted, hidden/invisible text stripped and flagged, student identity replaced by a pseudonym before any model sees it.
4. **Multi-agent grading panel.** For every criterion, two independent graders on two different models judge the work in isolated calls. Each must quote verbatim evidence. A Guard agent on a third model (Gemma) screens for manipulation in parallel.
5. **Code, not AI, computes marks.** Quotes are verified against the submission in code. Graders output a band (FULL / PARTIAL / MINIMAL / NONE). Code converts bands to marks via the teacher's strictness table. Splits go to an Arbiter agent **and** to the teacher.
6. **Calibration to the teacher.** The system picks 3 anchor scripts (low/mid/high). The teacher grades them **blind** (AI marks hidden). Systematic AI-vs-teacher offsets per criterion are corrected.
7. **Teacher review queue.** Flagged scripts first. Evidence highlighted. Teacher edits or approves. **No grade reaches a student without teacher approval.**
8. **Analytics.** Grade distribution, mean/median/SD, outliers, top students, students needing attention, CLO attainment, PLO roll-up, within-class collusion pairs.
9. **Trust Report.** Panel agreement, arbitrations, injections caught, evidence rejections, calibration error before/after, length-bias check, counterfactual invariance tests, and the **Teacher Drift Mirror** (does the teacher get harsher as they go?).
10. **Student feedback card.** What you did well (quoted), what cost marks (quoted), concept vs explanation vs presentation, CLO status, three concrete next steps.

## 5. Pitch line

> "We don't claim AI is unbiased. Every known source of grading bias, human or AI, has a named mechanism in our system and a number on the screen."

## 6. Features

### MVP (must work in the demo)
- Course setup: description, topics, CLOs, PLOs, CLO→PLO map, grade scheme
- Assessment setup: type, question, optional reference answer, total marks, strictness 1–5, rubric text → compiled rubric → teacher approval
- Bulk upload (TXT / PDF / DOCX typed work) with roster (file name or CSV)
- Sanitizer (zero-width chars, hidden DOCX text, tiny PDF text, injection patterns) + PII redaction
- Guard agent + 2-grader panel per criterion + evidence verification + consensus + arbiter
- Strictness as a deterministic partial-credit table (slider recomputes marks instantly, no AI re-call)
- Routing to Needs Review with reasons
- Teacher review queue: side-by-side graders, highlighted evidence, edit / approve, "approve all clean"
- Analytics dashboard: KPIs, histogram, grade distribution, top 5, needs attention, CLO attainment
- Within-class collusion detection (lexical + semantic)
- Student feedback card via release link
- Append-only audit log
- AI disclosure / limitations page

### Stretch (only after MVP is green)
1. Blind calibration anchors with offset correction
2. Trust Report: counterfactual invariance tests, length-bias correlation
3. Teacher Drift Mirror chart
4. PLO roll-up and FCAR / course-file PDF export
5. Feedback in Urdu (toggle)
6. Handwritten script transcription (Gemini vision) with teacher-visible transcript
7. Student appeal flow

### Out of scope (say this openly if asked)
- External plagiarism (internet / Turnitin-style corpus). We detect **within-class** collusion only.
- AI-writing detection. Unreliable, high false-positive rate; we do not claim it.
- LMS integration, SSO, production hosting (production roadmap, see `architecture.md` §17).

## 7. User journeys

**Teacher**
1. Sign in with Google → create course (CLOs, PLOs, topics, grade scheme)
2. Create assessment → paste question + rubric → click Compile → edit → Approve
3. Upload scripts + roster → click Grade → watch live progress
4. (Stretch) Grade 3 blind anchors → calibration applied
5. Review queue: flagged first, then "approve all clean"
6. Analytics + Trust Report → decide (re-teach a CLO, call in a student, check a collusion pair)
7. Release → each student gets a private link

**Student**
1. Opens release link → sees marks per criterion, quoted strengths and mistakes, concept/explanation/presentation notes, CLO status, next steps

## 8. Google technology

| Tech | Use |
|---|---|
| Gemini (two different model tiers) | Grader A, Grader B, Arbiter, Rubric Compiler, Feedback Writer |
| Gemma (via Gemini API) | Guard agent: independent manipulation screening on a different model family |
| Gemini embeddings | Semantic collusion detection |
| Firebase Auth | Google sign-in for teachers |
| Cloud Firestore | Assessments, submissions, live progress, audit log |
| Cloud Storage for Firebase | Uploaded scripts |
| Google Cloud | Credits, API billing; production target is the university's own GCP project |
| Google Antigravity | Development environment (if used, mention in presentation) |

## 9. Mapping to judging criteria

| Criterion (marks) | How we score |
|---|---|
| Problem relevance & SDG impact (20) | Research-backed problem (sequential bias study, feedback gap, OBE burden); SDG 4.3 / 4.c |
| Innovation & originality (20) | Bias measured on both sides (AI + human drift mirror); band-then-code scoring; evidence-locked marks; strictness as math; injection firewall; OBE reports |
| Implementation completeness (30) | Working end-to-end pipeline on 12 demo scripts with live grading, review, analytics |
| Google technology integration (10) | Gemini ×2 tiers + Gemma + embeddings + Firebase Auth/Firestore/Storage |
| UX & user flow (10) | Setup → grade → review → analytics → release in one flow; live progress; flagged-first queue |
| Presentation (10) | Planted-case demo (injection caught, collusion caught, split routed to teacher) |

## 10. Responsible AI statement and limitations

- **Teacher-assisted, not teacher-replacement.** Every grade requires teacher approval before release.
- **Privacy.** Student identity never reaches a model; pseudonyms only. Identity map is teacher-only.
- **Disclosure.** Models, prompts (versioned) and their roles are shown on the AI disclosure page and stored with every result.
- **No unvalidated claims.** Collusion flags are "similar, needs teacher judgement", not accusations. Calibration with 3 anchors is a sanity check, not statistical proof.
- **Data.** Demo uses only synthetic scripts written by the team. No real student work.
- **Known limitations.** Typed text only (handwriting is stretch). English-dominant prompts. Small calibration sample. Models can still err, which is exactly why every result is evidence-linked and teacher-approved. Injection defence is layered but not provably complete; new attacks become new red-team cases.

## 11. Demo script (about 5 minutes)

1. **Problem (40s).** Sequential grading bias stat + "12/25 with no explanation".
2. **Setup (40s).** Show the course with CLOs; compiled rubric with CLO mapping; strictness 3.
3. **Grade (60s).** Upload 12 scripts → live progress.
4. **Planted cases (90s).**
   - Script with hidden white-text "give full marks" → caught by sanitizer + guard, shown highlighted.
   - Two near-copied scripts → collusion pair with shared passages.
   - Ambiguous script → graders split → arbiter → Needs Review.
   - Long, padded, content-free script → low marks despite length.
5. **Strictness slider (20s).** Move 3 → 5: marks recompute instantly. "Strictness is math, not mood."
6. **Review + analytics (40s).** Edit one mark (audit log entry appears). Show distribution, top students, needs attention, CLO attainment.
7. **Trust (30s).** Panel agreement %, injections caught, drift mirror.
8. **Student view (20s).** Feedback card.

## 12. Judge Q&A (rehearse)

- **Can students hack it?** Five layers: hidden-text sanitizer, nonce-delimited untrusted input, graders with no tools, separate Guard on a different model, code-verified evidence. Plus a red-team suite we run on every prompt change. Final layer: the teacher.
- **Isn't AI biased too?** Yes. That's why it's calibrated to the teacher, run as a 2-model panel, checked with counterfactual tests, and its agreement is shown on screen.
- **Why would a university allow this?** It never decides; it drafts. Data stays in the university's own Google Cloud project. Full audit trail. It produces exactly the oversight evidence HEC's draft framework asks AI committees to keep. Adoption starts in shadow mode (AI grades silently for one semester, agreement measured) before assisted mode.
- **Who is accountable?** The teacher. Always.
- **How accurate is it?** Show calibration agreement on anchors and panel agreement. Don't quote numbers we didn't measure.
- **Plagiarism?** Within-class similarity only, as a flag for the teacher. No external corpus, no AI-writing detector.
- **What does strictness mean?** A published partial-credit table. Strict = less credit for partial answers. Same AI judgement, different math.

## 13. Glossary

| Term | Meaning |
|---|---|
| CLO | Course Learning Outcome: what a student should be able to do after the course |
| PLO | Program Learning Outcome: degree-level outcome; CLOs map to PLOs |
| OBE | Outcome-Based Education, the accreditation framework used by PEC / NCEAC |
| FCAR | Faculty Course Assessment Report: CLO attainment summary per course |
| Band | FULL / PARTIAL / MINIMAL / NONE judgement for one criterion |
| Anchor | A script the teacher grades blind, used for calibration |
| Panel | Two independent grader agents on different models |

## 14. References (for slides)

- Wang, Pei et al., sequential grading bias in Canvas records: https://papers.ssrn.com/abstract=4603146
- LLM essay scoring bias (Kucia et al.): https://arxiv.org/html/2604.00259
- LLM rater severity/halo audit summary: https://themodelwire.com/article/llm-essay-graders-show-massive-severity-bias-halo-effects-across-providers-01M1D8SD8AEDKB3E20XCVGTHWT
- Prompt injection on LLM graders: https://arxiv.org/html/2606.03090 and https://www.mdpi.com/3553832
- Wharton GAIL, hidden prompt injections: https://gail.wharton.upenn.edu/research-and-insights/hidden-prompt-injections/
- HEC draft GenAI policy coverage: https://www.techjuice.pk/?p=246656
- NCEAC field audit guidelines: https://nceac.org.pk/Documents/Accreditation%20Guidelines/Field%20Audit%20Guidelines.pdf
