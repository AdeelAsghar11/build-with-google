# Insaaf

**Tagline:** The AI drafts. The teacher decides.

## Brand story

Insaaf means justice. Its visual language takes the teacher's red pen and makes its judgement inspectable: each annotation points back to the student's words, each mark has a stated basis, and the teacher remains responsible for release. Warm examination paper and deep green ink make reading feel familiar; a restrained terracotta accent recalls marking ink without turning every screen into a warning. The product does not promise perfect fairness. It gives teachers and students a clearer record of how a judgement was reached.

## Wordmark

Use only the word **Insaaf** in Source Serif 4 Semibold, 40px/48px, primary ink, normal tracking. Minimum digital size 24px/32px; clear space 16px on all sides. Optional Urdu name “انصاف” appears as separate supporting text in Noto Nastaliq Urdu, never as a forced Latin/Urdu ligature. No scales icon, gavel, shield, sparkle or AI symbol. Wordmark links home with accessible name “Insaaf home.”

## Color swatches

| Name | Token | Hex | Use |
|---|---|---|---|
| Examination paper | `background` | `#F6F3EB` | Page |
| Reading paper | `card` | `#FCFAF4` | Text surface |
| Ink | `foreground` | `#252C28` | Text |
| Ledger green | `primary` | `#254D46` | Teacher action |
| Marking terracotta | `accent` | `#8A3F27` | Links and focus |
| Verified ink | `evidence-verified` | `#235A48` | Evidence label |
| Partial ochre | `partial` | `#745016` | Partial understanding |
| Correction ink | `error` | `#922F35` | Academic error |
| Review amber | `flag-integrity` | `#80501B` | Integrity observation |
| Review ochre | `state-needs-review` | `#6C501D` | Review queue |
| Approval ink | `state-approved` | `#235A48` | Teacher approval |
| Release slate | `state-released` | `#274F5D` | Released state |
| Information slate | `info` | `#34545B` | Information |

Use semantic foregrounds with the matching `-bg` tokens from design.md. No arbitrary tint or alpha replacement. Every semantic label has text and a line/icon cue. Color alone never states correctness.

## Type specimen

| Role | Family and treatment | Specimen |
|---|---|---|
| Display | Source Serif 4, 600, 40px/48px | Every mark has a reason. |
| Section | Source Serif 4, 600, 24px/32px | Evidence before judgement |
| Body | Source Sans 3, 400, 16px/24px | Review the quoted evidence before approving this script. |
| Action | Source Sans 3, 600, 16px/22px | Approve script |
| Aligned identifier | IBM Plex Mono, 400, 16px/24px | S-07 · C2 |
| Urdu | Noto Nastaliq Urdu, 400, 20px/48px, RTL | ہر نمبر کی ایک وجہ ہے۔ |

Use tabular numerals for marks. Feedback measure: 65ch. Minimum body 16px; dense tables only 14px. The visual HTML includes the five-band scale and the single signature detail: criterion-linked evidence underlines.

## Voice

| Do | Don't |
|---|---|
| Say what was observed | Treat a flag as proof of misconduct |
| “High similarity with S-09” | “Plagiarism detected” |
| “Your teacher reviewed these marks” after approval | Claim AI made the final decision |
| “No grading checks recorded yet” | Display a fabricated score to fill the space |
| Use verb + object action labels | Use generic “Submit” or “OK” |
| Explain uncertainty and next action | Sell certainty or use inflated marketing language |

Three example UI phrases:

1. “Review the evidence for C2.”
2. “Approve 9 clean scripts.” (Only when the actual eligible count is nine.)
3. “AI helped draft this feedback. Your teacher reviewed and approved your marks before release.”

## Pitch deck guidance

| Slide | Composition | Typography / data rule |
|---|---|---|
| Title | Wordmark upper-left, tagline beneath, one plain sentence about the problem; no decorative hero | Source Serif 4 44px, Source Sans 3 24px; paper background |
| Section | One left-aligned question such as “What supports this mark?”; a large real review excerpt below | Title 40px; excerpt ≥24px; keep synthetic-demo label if applicable |
| Data | Chart occupies two-thirds, one specific takeaway the remaining third; title names measured outcome and sample | Axis ≥22px, exact denominators, date/version, short source; no generic accuracy claim |

Keep slide margins 48px and safe text inside the projector frame. Show the evidence underline, a teacher action and the approval state in one screenshot. Use real recorded Trust metrics, or show “Not measured”; never backfill a demo with invented percentages. The band scale is ordinal, not a score conversion. Do not claim calibration, drift analysis or Urdu translation is available until implemented.

## Reference package

- `design.md`: full components, screen blueprints, accessibility, contrast, implementation snippets.
- `../src/styles/tokens.css`: light-theme variables and shared hooks.
- `brand-sheet.html`: standalone visual reference with embedded Google Fonts, state selector and synthetic review example.
- `font-licenses.txt`: licenses for the embedded font specimens.
- `decision.md`: existing decision log with D-021 appended, preserving earlier content.
