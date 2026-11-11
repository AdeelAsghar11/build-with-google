# Insaaf design system

## 1. Design intent and principles

Insaaf feels like an examination script with a clear, traceable marking record. The teacher sees evidence, uncertainty and the next review action before accepting an AI draft. Warm paper, strong ink and restrained annotations keep long grading sessions readable on laptops and in a lit presentation hall.

Scope: visual and interaction specification for the supplied architecture, not a claim that its planned features are implemented. Light theme only. D-020 supersedes older ownership lanes: Adeel owns implementation. The supplied progress file reports foundation work; a 45-minute styling pass assumes functional shadcn screens already exist. Analytics for HoD/QEC is a teacher-led demo in MVP; separate auditor permissions are production scope.

| Principle | Persona need | Design rule | Named basis |
|---|---|---|---|
| Evidence before verdict | Skeptical lecturer needs to inspect a decision | Put a criterion-linked quote above its proposed mark; do not turn model confidence into a certainty percentage | Cognitive load; recognition rather than recall; mitigation of automation bias |
| Teacher action stays explicit | Lecturer owns the decision; student needs accountability | Exactly one filled primary action in the active screen; distinguish save, approve and release | Nielsen: user control and error prevention |
| Flags describe uncertainty | Anxious student and cautious committee need fair treatment | Name the observation and ask for judgement; separate integrity flags from academic errors | Nielsen: match to real world; ethical framing |
| Attention follows consequence | Tired lecturer must triage 60 scripts | Flagged first, seeded random order within groups; no alphabetical default; show counts and next item | Pre-attentive processing; Hick's law |
| State travels with the mark | Lecturer and judge must distinguish draft from released | Keep status label adjacent to totals, including print and student view | Gestalt proximity; visibility of system status |
| Readable without color | Judge on projector, student on phone, colorblind reviewer | Text, shape and line patterns supplement every hue; all key content remains available at narrow widths | WCAG contrast, use of color and reflow |
| Familiar materials, fewer decisions | Lecturer wants an assessment tool, not a new visual language | Paper-like surfaces, stable typography, existing shadcn behavior, one evidence signature | Nielsen consistency; cognitive load |

### Metaphor and one signature detail

The metaphor is **examination paper with accountable marking ink**. It is familiar to Pakistani lecturers, makes the student's own writing central, and gives committees a legible record without implying a court verdict. Deep green identifies teacher actions; terracotta recalls marking ink but is reserved for links and focus. Error red is never used as the brand's main action color.

The single signature is the **criterion-linked evidence underline**: a pale highlighted quote with a 2px underline and an adjacent `C2 · Verified quote` button. Selecting the button focuses the relevant criterion heading, opens its evidence if collapsed and preserves the reading position; selecting “Show quote” returns focus to the quote's control. One source quote can list multiple criterion links. Multiline marks use `box-decoration-break: clone`; no decorative stamps or thick card borders.

| Candidate | Decision |
|---|---|
| Criterion-linked evidence underline | Chosen: visually expresses the product claim and reduces searching for a lecturer; readable in a screenshot |
| Verified seal | Rejected: risks implying correctness when verification only checks that words occur |
| Live partial-credit table | Keep as ordinary functional disclosure; not an additional signature |
| Trust ledger styling | Keep plain rows; a second branded motif competes with evidence |

A verified quote means “found in the submission,” not “the judgement is correct.” Fuzzy matches say “Approximate text match,” never “Verified verbatim.”

## 2. Personas summary

| Persona | Goals | Context | Pain points | Must see within 5 seconds | Accessibility | Trust cues |
|---|---|---|---|---|---|---|
| Lecturer / TA | Grade consistently; correct drafts; release clear feedback | 1366×768 laptop, 50–60 scripts, after hours, interruptions | Fatigue, repetitive checks, poor extraction, skepticism | Assessment name; remaining reviews; reason for current flag; next teacher action | 16px body; keyboard paths; 44px controls; preserved position and drafts | Exact quote, rubric version, A/B disagreement, override history, approval state |
| Student | Understand mark and next step; know who reviewed it | Phone, mobile data, anxious, possibly Urdu preference | Unexplained deductions, tiny tables, inaccessible language | Released mark with denominator; teacher-reviewed notice; assessment title | One column; semantic headings; 200% zoom; Urdu shaping; no clipped text | Own quoted words, criterion marks, release date, clear limits of AI |
| HoD / QEC / AI committee | Inspect attainment, oversight and recorded decisions | Desktop report or shared screen, limited review time | Unclear denominators, unsupported accuracy claims, missing provenance | CLO target versus result; sample size; pending cases; approval status | Tables accompanying charts; meaningful labels; export-safe ink | Versioned model/rubric, measured metrics, audit edits, honest unavailable states |
| Hackathon judge | Understand problem, differentiator and working flow | Five-minute projector demo in lit hall | Small type, too many panels, ornamental metrics | Teacher decides; evidence linked to criterion; flagged case; release gate | Presentation mode with 18px body and 16px table text; captions on charts | Real measured counts, synthetic-data label, visible teacher action, disclosure link |

## 3. Tokens

### Color inventory

All component colors reference `src/styles/tokens.css`. Complete color values are used (`var(--primary)`), not HSL channel tuples. Never apply global opacity to text, chips or disabled controls. No dark mode for this delivery. Surface contrast can wash out on a projector; control outlines and labels carry structure.

| Token | Hex | Purpose |
|---|---|---|
| `--background` | `#F6F3EB` | Warm examination paper |
| `--foreground` | `#252C28` | Ink text |
| `--card` | `#FCFAF4` | Reading surface |
| `--muted` | `#EAE7DD` | Inset and disabled surface |
| `--muted-foreground` | `#555E56` | Secondary text on neutrals only |
| `--border` | `#727A6F` | Control boundary |
| `--rule` | `#D4D6CC` | Decorative separators only |
| `--primary` | `#254D46` | Teacher action / ledger green |
| `--primary-hover` | `#193D37` | primary hover |
| `--primary-active` | `#12332E` | primary active |
| `--primary-foreground` | `#FCFAF4` | primary foreground |
| `--accent` | `#8A3F27` | Marking ink / underlined links and focus |
| `--accent-hover` | `#6F301E` | accent hover |
| `--accent-foreground` | `#FCFAF4` | accent foreground |
| `--evidence-verified` | `#235A48` | evidence verified |
| `--evidence-verified-bg` | `#E4EEE7` | evidence verified bg |
| `--partial` | `#745016` | partial |
| `--partial-bg` | `#F4EACF` | partial bg |
| `--error` | `#922F35` | error |
| `--error-bg` | `#F8E7E5` | error bg |
| `--flag-integrity` | `#80501B` | flag integrity |
| `--flag-integrity-bg` | `#F2E4CE` | flag integrity bg |
| `--state-needs-review` | `#6C501D` | state needs review |
| `--state-needs-review-bg` | `#F5EDD9` | state needs review bg |
| `--state-approved` | `#235A48` | state approved |
| `--state-approved-bg` | `#E4EEE7` | state approved bg |
| `--state-released` | `#274F5D` | state released |
| `--state-released-bg` | `#E2EDF0` | state released bg |
| `--info` | `#34545B` | info |
| `--info-bg` | `#E7EFF0` | info bg |
| `--band-full` | `#254D46` | band full |
| `--band-mostly` | `#54756D` | band mostly |
| `--band-partial` | `#8CA59A` | band partial |
| `--band-minimal` | `#BACAC0` | band minimal |
| `--band-none` | `#E5EBE3` | band none |
| `--chart-1` | `#254D46` | chart 1 |
| `--chart-2` | `#8A3F27` | chart 2 |
| `--chart-3` | `#775C1C` | chart 3 |
| `--chart-4` | `#395F70` | chart 4 |
| `--chart-5` | `#62673B` | chart 5 |
| `--chart-6` | `#49423B` | chart 6 |

### Allowed contrast pairs

Ratios are computed from sRGB relative luminance using `(Llight + 0.05) / (Ldark + 0.05)` and rounded only for display. These are the only allowed text/background pairings; semantic aliases inherit their source pair. Body text meets 4.5:1; controls and chart marks meet 3:1. Decorative `rule` and skeleton fills are not controls and carry no text. Fills may be subtle because every chip has a dark label and boundary.

| Foreground token | Background token | Ratio | Use |
|---|---|---:|---|
| `foreground` | `background` | 12.89:1 | Body / link / heading |
| `muted-foreground` | `background` | 6.07:1 | Body / link / heading |
| `primary` | `background` | 8.50:1 | Body / link / heading |
| `accent` | `background` | 6.71:1 | Body / link / heading |
| `accent-hover` | `background` | 8.94:1 | Body / link / heading |
| `foreground` | `card` | 13.69:1 | Body / link / heading |
| `muted-foreground` | `card` | 6.45:1 | Body / link / heading |
| `primary` | `card` | 9.03:1 | Body / link / heading |
| `accent` | `card` | 7.13:1 | Body / link / heading |
| `accent-hover` | `card` | 9.50:1 | Body / link / heading |
| `foreground` | `muted` | 11.55:1 | Body / link / heading |
| `muted-foreground` | `muted` | 5.44:1 | Body / link / heading |
| `primary` | `muted` | 7.62:1 | Body / link / heading |
| `accent` | `muted` | 6.02:1 | Body / link / heading |
| `accent-hover` | `muted` | 8.02:1 | Body / link / heading |
| `card` | `primary` | 9.03:1 | Filled button text |
| `card` | `primary-hover` | 11.41:1 | Filled button text |
| `card` | `primary-active` | 13.08:1 | Filled button text |
| `card` | `error` | 7.51:1 | Filled button text |
| `card` | `accent` | 7.13:1 | Filled button text |
| `evidence-verified` | `evidence-verified-bg` | 6.73:1 | Semantic text and icon |
| `foreground` | `evidence-verified-bg` | 12.03:1 | Quote / detail text |
| `partial` | `partial-bg` | 6.04:1 | Semantic text and icon |
| `foreground` | `partial-bg` | 11.92:1 | Quote / detail text |
| `error` | `error-bg` | 6.55:1 | Semantic text and icon |
| `foreground` | `error-bg` | 11.94:1 | Quote / detail text |
| `flag-integrity` | `flag-integrity-bg` | 5.44:1 | Semantic text and icon |
| `foreground` | `flag-integrity-bg` | 11.41:1 | Quote / detail text |
| `state-needs-review` | `state-needs-review-bg` | 6.42:1 | Semantic text and icon |
| `foreground` | `state-needs-review-bg` | 12.25:1 | Quote / detail text |
| `state-approved` | `state-approved-bg` | 6.73:1 | Semantic text and icon |
| `foreground` | `state-approved-bg` | 12.03:1 | Quote / detail text |
| `state-released` | `state-released-bg` | 7.45:1 | Semantic text and icon |
| `foreground` | `state-released-bg` | 11.98:1 | Quote / detail text |
| `info` | `info-bg` | 7.02:1 | Semantic text and icon |
| `foreground` | `info-bg` | 12.25:1 | Quote / detail text |
| `card` | `band-full` | 9.03:1 | Band label |
| `card` | `band-mostly` | 4.86:1 | Band label |
| `foreground` | `band-partial` | 5.42:1 | Band label |
| `foreground` | `band-minimal` | 8.37:1 | Band label |
| `foreground` | `band-none` | 11.79:1 | Band label |
| `border` | `background` | 4.00:1 | Control outline (3:1) |
| `accent` | `background` | 6.71:1 | Focus outline (3:1) |
| `border` | `card` | 4.25:1 | Control outline (3:1) |
| `accent` | `card` | 7.13:1 | Focus outline (3:1) |
| `border` | `muted` | 3.59:1 | Control outline (3:1) |
| `accent` | `muted` | 6.02:1 | Focus outline (3:1) |
| `chart-1` | `card` | 9.03:1 | Chart mark (3:1) |
| `chart-2` | `card` | 7.13:1 | Chart mark (3:1) |
| `chart-3` | `card` | 6.04:1 | Chart mark (3:1) |
| `chart-4` | `card` | 6.61:1 | Chart mark (3:1) |
| `chart-5` | `card` | 5.71:1 | Chart mark (3:1) |
| `chart-6` | `card` | 9.46:1 | Chart mark (3:1) |

### Semantic states and redundant cues

| Meaning | Foreground / fill | Lucide icon or pattern | Exact label |
|---|---|---|---|
| Evidence found | evidence-verified / evidence-verified-bg | Quote; solid underline | Verified quote |
| Partial understanding | partial / partial-bg | CircleDashed; dotted underline | Partial |
| Error / misconception | error / error-bg | CircleAlert; wavy underline | Check this explanation |
| Integrity observation | flag-integrity / flag-integrity-bg | Flag; strikethrough for removed spans only | Needs your judgement |
| Needs review | state-needs-review / state-needs-review-bg | ClipboardList | Needs review |
| Approved | state-approved / state-approved-bg | Check | Teacher approved |
| Released | state-released / state-released-bg | Send | Released |
| Information | info / info-bg | Info | Information |

Use Lucide only, 20px, stroke width 1.75, `aria-hidden=true` beside visible labels. No icons as the only explanation. Loading uses a static skeleton and a text state, not a rotating icon. The preview uses labels and line patterns without adding a second icon set.

### Bands and color-vision checks

| Stored band | Visible label | Ordinal cue | Fill | Text |
|---|---|---|---|---|
| FULL | Full | 4/4 ordinal steps | band-full | card |
| MOSTLY | Mostly | 3/4 ordinal steps | band-mostly | card |
| PARTIAL | Partial | 2/4 ordinal steps | band-partial | foreground |
| MINIMAL | Minimal | 1/4 ordinal steps | band-minimal | foreground |
| NONE | None | 0/4 ordinal steps | band-none | foreground |

The ordinal steps are rubric bands, **not marks**; show “band” beside the ordinal cue and use fraction text only in a legend, never next to a score without explanation. Accessible name: “Mostly, band 3 of 4; marks depend on partial-credit policy.” Every chip has a 1px ink boundary appropriate to its text color; light chips use `border` for their outer edge. Sequential shade means amount of demonstrated evidence, not pass/fail. `None` is an assessed band; an unsupported vote instead reads “No supported judgement,” with no score and no band chip.

A local linear-RGB simulation using Machado severity-1 matrices retained strict luminance ordering Full → None. Protanopia luminances: 0.067, 0.165, 0.358, 0.573, 0.819. Deuteranopia: 0.058, 0.152, 0.342, 0.559, 0.814. Labels and ordinal cues preserve meaning if shade differences are hard to see. This is a palette check, not a clinical or user-test claim. Categorical charts must also use direct labels and distinct markers/patterns; no six-color palette is treated as uniquely distinguishable by hue alone.

### Type

| Role | Family | Size px / rem | Line-height | Weight |
|---|---|---|---|---|
| Wordmark / main display | Source Serif 4 | 40 / 2.5 | 48px / 1.2 | 600 |
| Page title | Source Serif 4 | 32 / 2 | 40px / 1.25 | 600 |
| Section heading | Source Serif 4 | 24 / 1.5 | 32px / 1.333 | 600 |
| Subheading / emphasized status | Source Sans 3 | 20 / 1.25 | 28px / 1.4 | 600 |
| Body, controls, feedback, labels | Source Sans 3 | 16 / 1 | 24px / 1.5 | 400 body; 600 labels |
| Dense desktop table only | Source Sans 3 | 14 / .875 | 20px / 1.429 | 400 / 600 |
| Marks / statistics | Source Sans 3 | 20 / 1.25, or inherited table size | 28px or 20px | 600; tabular numerals |
| Aligned IDs / audit hashes | IBM Plex Mono | 16 / 1; 14 / .875 in dense tables | 24px / 20px | 400 |
| Urdu feedback | Noto Nastaliq Urdu | 20 / 1.25 | 48px / 2.4 | 400 / 600 |

No text below 14px is specified; 12px is a hard minimum, not a target. Feedback max-width 65ch; rubric prose 70ch. Use `font-variant-numeric: tabular-nums lining-nums` for marks and all statistics; never use monospace headings. Presentation mode: body 18px/28px, table 16px/24px, main title 36px/44px; collapse the queue before shrinking text.

Set `lang="ur" dir="rtl"` on an Urdu region, not on mixed English labels. Use logical properties (`padding-inline`, `margin-inline-start`, `text-align:start`), `<bdi dir="ltr">S-07</bdi>` for IDs and fractions, and no tracking on Urdu. Do not reverse chart values or mathematical notation. Stack mixed-language feedback rather than squeezing it into columns. Language controls appear only when a real translated response exists; preserve an English option and never silently translate student quotes. Student pages load the Urdu font only when Urdu content is present; the standalone reference embeds the specimen fonts.

### Layout, space, shape and motion

| Token / role | Exact value | Reason |
|---|---|---|
| Base unit / spacing | 4px; 4, 8, 12, 16, 20, 24, 32, 40, 48px | Predictable groups, with more space at task boundaries (Gestalt proximity) |
| App shell | 64px top bar; max-width 1440px; 24px horizontal padding at ≥1024px, 16px below | A sidebar would consume evidence width on 1366px laptops |
| Workflow nav | 48px high; labeled Setup, Submissions, Review, Analytics, Trust; overflow scroll when needed | Stable navigation reduces recall; no icon-only rail |
| Title / content | 24px above title; 16px title-to-toolbar; 32px between sections | Hierarchy without cards around every block |
| Forms / tables / reading | Form section padding 24px; table cells 12px block × 16px inline; reading pane 32px; compact status row 12px | Vary space with reading effort |
| Review ≥1280px | 236px queue + 20px gap + remaining detail; detail 58% text / 42% votes with 20px gap using fractional grid tracks | Compare evidence without losing queue |
| Review 1024–1279px | Queue in 320px Sheet; detail `minmax(0,1.2fr) minmax(0,1fr)` | Preserve a usable text measure |
| Review <1024px | One column: reason, text, votes, mark editor; “Open review queue” Sheet | Essential review controls stay present |
| Analytics ≥1024px | 12-column grid, 24px gaps; histogram 8 columns / grade distribution 4; CLO 7 / attention 5 | Visual area follows information density |
| Below 768px | Single column; no nested scroll regions; 16px page padding | Phone and zoom reflow |
| Inputs / buttons | Radius 4px; min-height 44px | Clear boundaries and easy acquisition (Fitts) |
| Reading surface / charts | Radius 6px when a container is necessary | Paper-like, not pill-shaped |
| Chips / dialog | Radius 999px / 10px | Compact status versus temporary decision context |
| Elevation 1 | `0 1px 3px rgb(37 44 40 / .10)` | Reading surface only |
| Elevation 2 | `0 4px 10px rgb(37 44 40 / .16)` | Sheet / popover only |
| Routine motion | 120ms, `cubic-bezier(.2,0,0,1)` | Brief transform/opacity changes; colors switch immediately |
| Panel motion | 240ms, same easing; translateX 12px → 0 | Orientation without bouncing |
| Strictness moment | Updated mark text appears with a single 120ms opacity transition | Shows recomputation without counting through invented marks |

No animated width, height, margin or chart geometry. Sliders update values instantly; disable Recharts entrance animations. No shimmer, looping pulse, animated spinner, scroll reveal or automatic carousel. Reduced-motion disables transitions and smooth scrolling entirely. Keep focus outlines out of clipped containers. Sticky actions use an opaque paper background and leave bottom padding equal to their height; switch to normal flow at zoom/narrow widths to avoid obscuring content.

## 4. Components and states

### Shared interaction contract

Every interactive component follows this matrix. Static evidence and informational chips are not buttons and have no fake hover states; a separate labeled control performs navigation.

| State | Visual | Behavior / accessibility |
|---|---|---|
| Default | Full-opacity text; 1px `border` where an outline defines the control | Visible label; native semantics |
| Hover | Secondary/ghost/input surfaces use `muted`; primary uses primary-hover; link uses accent-hover | Never reveals essential information only on hover |
| Focus-visible | 3px `ring`, 3px paper gap; no default outline suppression | Keyboard, focus and tap reveal the same supporting details |
| Active / selected | Primary-active; selected tab has 2px primary underline and `aria-selected`; checkbox has check shape; button translates 1px only while pressed | Selection remains apparent in grayscale |
| Disabled | Muted fill, muted-foreground text, border, opacity 1; no transform | Native disabled for unavailable controls; persistent adjacent reason; no tooltip dependency |
| Loading / saving | Preserve dimensions, `aria-busy`; static skeleton in data areas; action label “Saving marks…” | Block duplicate actions; status announced politely once; keep focus; use `aria-disabled` with a click/keyboard guard if focus must remain |
| Invalid / failed | Error text + icon, 2px error border, inline cause and recovery | `aria-invalid`, `aria-describedby`; announce failure; retain user input |

Do not use Tailwind default `disabled:opacity-50`, `animate-pulse` or shadcn stock accent classes on pale text. Here `accent` is terracotta ink; neutral selected surfaces use `muted`, not `accent/50`.

### Base shadcn components

| Component | Specification | Variants and state details |
|---|---|---|
| Button | `insaaf-button`, 44px high, 16px/600, 16px horizontal padding | Exactly primary, secondary, ghost, destructive. Primary green; secondary outlined paper; ghost underlined accent; destructive error fill. Destructive hover adds an outer outline without changing text contrast. All active states translate 1px; disabled and busy do not |
| Input / Textarea | `insaaf-input`; 44px min; textarea 160px min; permanent label and help | Hover muted; focus ring; disabled muted; invalid cause beneath; compiling keeps input visible. Required fields say “Required,” not only an asterisk |
| Select | shadcn Select for simple sets, or native select; same input treatment | Arrow keys choose, Enter confirms, Escape closes; selected item check; loading options show “Loading courses…”; disabled explains why |
| Slider | shadcn Slider, five discrete stops 1–5; 6px muted track with border, 24px primary thumb inside 44px hit area | Label “Partial-credit policy”; visible Lenient / Balanced / Strict; arrow/Home/End; `aria-valuetext="3, Balanced"`. Optional 1–5 select alongside. Hover thumb gets 2px outline, focus ring; active primary-active; disabled explains pending save |
| Tabs | shadcn Tabs; 44px targets; text labels; selected 2px bottom rule | Arrow keys within tab list; Tab enters panel; manual activation with Enter/Space if panel loads. Loading panel skeleton; disabled tab has visible explanation |
| Table | Native table, caption, scoped headers, rules between rows; no boxed cell grid | Numeric cells right aligned; sort button with `aria-sort`; selected row has “Current” label. Hover on actionable row uses muted. Row click never replaces an explicit “Review script” link |
| Badge / chip | 16px label; inline icon or pattern; 4×10px padding | Informational badges are noninteractive. Filter chips are toggle buttons ≥44px, `aria-pressed`; selected check; shared focus/disabled behavior |
| Toast | Restyle existing toast, paper fill, foreground, 1px border, max-width 420px, 16px | Success status lasts 6s but important state stays inline; failures remain until dismissed. No animation except 120ms opacity. Do not put the only recovery action in a disappearing toast |
| Dialog | Existing shadcn AlertDialog, 480px max-width, radius 10px, 24px padding | Only release or genuinely irreversible deletion warrants a blocking dialog; focus least destructive action first; Escape closes if safe. Do not use a modal to edit marks |
| Drawer / Sheet | Existing shadcn Sheet styled as side drawer, 420px desktop / full-width mobile | Queue, audit detail and supplementary rubric content; close button 44px; trapped focus only while modal; Escape and focus return. Use Sheet already installed; no added drawer library |
| Skeleton | Static muted lines and rows matching final layout; heading remains readable | `aria-hidden` placeholders; one “Loading review details…” status per region. A failed request replaces skeleton with cause + retry |
| Empty / error region | Heading, one sentence, next action; plain section with top rule | No decorative illustration. Exactly one primary action for the page, even when empty states coexist |

Only one primary button is visible in an active screen. In setup, “Compile rubric” becomes secondary once the draft exists and “Approve rubric” becomes primary. In review detail, “Approve script” is primary and bulk approval is secondary. While saving edits, “Save marks” takes the primary role and approval is unavailable. In a modal, the inert underlying primary is visually demoted until it closes. The HTML reference shows one primary specimen at a time using a state selector.

### Domain components

| Component | Content and state contract | Interaction |
|---|---|---|
| Band chip | Five named bands from §3; pending = “Awaiting judgement”; discarded = “No supported judgement,” no numeric zero | Legend explains ordinal bands; never editable directly unless a supported app contract allows it |
| Review reason | All codes in next table; reason text, neutral observation, optional criterion ID | “Inspect reason” opens inline evidence; acknowledged reason remains in audit. Approval does not erase it |
| Evidence highlight | Verified solid underline; fuzzy dotted; academic error wavy; hidden/quarantined struck through and explicitly labeled | Original hidden text starts collapsed behind “Show removed text”; preserve as plain escaped text, never execute uploaded HTML. Fuzzy displays proposed quote and actual matched span. Reject nonexistent quotes; no highlight for a rejected match |
| Grader comparison | Criterion heading and descriptors; quote first; A evidence-first, B deficit-first columns; band, missing elements, rationale, textual confidence | Arbiter appears as a full-width third row below, labeled “Arbiter draft.” It is not an authority badge. On mobile stack A, B, arbiter. Unsupported/error vote explains unavailable judgement and retries only if supported by route |
| Progress row | Pseudonym, file type, state text, retry control if failed | Queued → Processing → Draft ready or Needs review; Error → Retry grading. Show completed/total, not fabricated percentages or pipeline stages absent from API |
| Mark editor | Criterion max beside labeled numeric input, 0 ≤ mark ≤ max, step .5; AI draft and teacher mark separately; teacher note | Validate finite input, range and complete criteria. “Save marks” then “Approve script”; saving approved work returns it to review. Show feedback refresh pending/failed inline; no silent stale feedback release |
| CLO bar | CLO ID and text; student attainment threshold, class target and actual count/n | Bar displays percent of students attaining CLO; reference line is class target, not student threshold. Direct label; table alternative; no value for zero denominator |
| Similarity comparison | A and B pseudonyms, measured containment/cosine labels, shared passages, rubric context | Side by side desktop, stacked labeled extracts mobile; “Inspect pair” anchors to matching passages. State “Within this assessment”; flag is not an accusation |
| Student card | Released total + denominator, approved notice, criterion scores, quotes, dimension notes, CLO results, next steps, release date | Mobile-first, no omitted criteria. Invalid/unreleased token gives a neutral unavailable message. No other students, private notes, model votes or identity mapping |
| Trust metric | Name, value, numerator/denominator, scope, timestamp, explanation | “Not measured” instead of zero for unavailable metrics. Agreement is agreement, not accuracy. Audit/model detail is a secondary link |

If feedback is unavailable after a mark edit, show “Marks saved. Feedback could not refresh. Retry feedback before release.” The existing API may need a release validation guard; styling cannot supply that logic. Flag this as an implementation dependency, not a claim of completion. Changing policy after approvals similarly requires review of affected approvals before release; preserve teacher overrides, show changed draft marks, and do not silently alter already released results. Coordinate this unresolved workflow with the backend rather than pretending a token change enforces it.

### Every review-reason code

| Code | Visible label | Token family / icon | Expanded explanation |
|---|---|---|---|
| HIDDEN_TEXT | Hidden text found | flag-integrity / EyeOff | Text hidden by document formatting was excluded. Inspect the extracted text |
| HEURISTIC | Grading request found | flag-integrity / Flag | A phrase may address the grader. Review its context |
| GUARD | Possible grading instruction | flag-integrity / Flag | The screening model flagged text for your judgement |
| QUARANTINE | Text excluded from grading | flag-integrity / ShieldAlert | A verified flagged span was removed from the grading input |
| CANARY | Grader noticed an instruction | flag-integrity / Flag | A grader reported possible manipulation; inspect the text |
| SPLIT | Graders disagree | state-needs-review / Split | The proposed bands differ enough to require review |
| UNSUPPORTED | Evidence not verified | state-needs-review / Quote | A proposed judgement lacked a supported quote |
| LOW_CONFIDENCE | Uncertain judgement | state-needs-review / CircleHelp | At least one judgement has low confidence |
| SHORT_TEXT | Little text extracted | state-needs-review / FileText | Fewer than 30 words were extracted; check for missing content |
| PARSE_ERROR | File could not be read | error / FileWarning | Check the file and upload a readable TXT, DOCX or text PDF |
| COLLUSION | High similarity | flag-integrity / Files | Similarity with another script needs your judgement |
| ANCHOR | Blind calibration script | info / Scale | Enter your marks before viewing the AI draft; stretch feature |
| SPOT_CHECK | Blind spot-check | info / ClipboardCheck | Review independently before viewing the AI draft; stretch feature |

“Draft ready” is the visible label for `graded_clean`, not “correct.” Approved and released use their own labels. No academic pass/fail meaning is assigned to process states.

## 5. Screen blueprints

These spatial tables are the text wireframes. DOM reading order follows the numbered rows; column positions describe desktop layout. They avoid ASCII boxes and remain readable by coding agents. At 1366×768 reserve 112px for top bar plus workflow nav; the review's main content fits in the remaining viewport with independently labeled scroll regions on desktop only. At 200% zoom use the narrow layout and document scrolling.

### Assessment setup and rubric approval

| Order / region | Left / main (8 columns) | Right / support (4 columns) |
|---|---|---|
| 1. Header | Course / assessment title, Draft status | Saved state |
| 2. Form | Type, question, optional reference, total marks, rubric text | CLO mapping summary; partial-credit policy, help text |
| 3. Compile result | Editable criterion table: title, max, CLO, dimension, expandable descriptors | Warnings: sum mismatch, unmapped CLO; text list, no alarming decoration |
| 4. Footer | Rubric version and total check | Primary “Compile rubric,” then “Approve rubric” when valid |

Below 1024px stack form, policy and rubric table. Keep each criterion in a labeled section if the table would require page-level scrolling. Approval unavailable while draft warnings violate required checks; show the precise fix. No grading navigation action until approved; explain prerequisite inline.

### Upload and grading progress

| Order | Main content | Supporting content |
|---|---|---|
| 1 | Assessment and approved rubric version | Current policy |
| 2 | File input/drop zone; “Choose scripts”; accepted types and 10 MB/file, 100/batch | Roster file input; explain pseudonyms |
| 3 | Upload validation list with file-specific cause | Retry only failed files; preserve successful uploads |
| 4 | Rows: pseudonym, file type, queued/processing/draft ready/needs review/error | “Retry grading” on errors |
| 5 | Completed `{n}` of `{total}`; static row skeletons during processing | Primary “Grade {n} scripts”; then “Open review queue” |

Do not expose original filename if it contains identity in blind review; upload management remains teacher-only. Browser-driven grading: “Keep this tab open while grading. Completed scripts are saved.” Failed finalize: “Grading finished, but batch checks failed. Retry batch checks before release.” No pretend background completion after tab closure.

### Review queue and detail

| Order | Queue 236px | Detail text, 58% | Judgement, 42% |
|---|---|---|---|
| 1 | Needs review / Draft ready counts | Assessment title, current pseudonym and state | Primary “Approve script” |
| 2 | Flagged first; seeded random order; each item has reason | Current reason and selected criterion | Teacher mark / maximum, draft label |
| 3 | Current item labeled; Next / Previous | Original extracted text with linked quote annotations | Criterion descriptors; A and B evidence / missing / band |
| 4 | Secondary “Approve {n} clean scripts” | Expandable removed text | Arbiter row if present; “Edit marks” |
| 5 | Break nudge after 20 reviews / 30 min | “Show quote” return point | Save state, teacher note, audit link |

Keep primary action aligned with the teacher's judgement panel, not the AI columns. Bulk approval opens an inline confirmation; its confirmation becomes the only primary action. On mobile: queue Sheet → reason → text → comparisons → editor → approval. When navigating away with unsaved edits, use an inline “Save changes” / “Discard changes” barrier; never lose them silently. Shortcuts are scoped and opt-in (§8).

### Analytics dashboard

| Order | Larger region | Smaller region |
|---|---|---|
| 1 | Assessment, included submission count, exclusions, last recomputation | “Open review queue” action if pending |
| 2 | One plain statistics strip: mean, median, SD, pass rate, n; labels first | No separate equal metric cards |
| 3 | 8 columns: histogram, 320px high, mean/median lines | 4 columns: grade counts as horizontal bars, 320px |
| 4 | 7 columns: CLO attainment with targets and counts | 5 columns: students needing attention with reasons |
| 5 | Criterion difficulty table, dimension summary | Top 5 table with context |
| 6 | Full-width within-class similarity pairs and inspect action | Not an external plagiarism score |

Default includes submissions with complete computed final marks, including teacher overrides; label “Current marks, including unapproved drafts.” Exclude queued, errored and incomplete/unscorable submissions; show excluded count. Offer “Approved only” only if the API can filter consistently. Recompute charts and text together; `n=0` shows empty state. A dashboard is not an approval control.

### Trust Report

| Order | Content | Hierarchy |
|---|---|---|
| 1 | “How these drafts were checked”; assessment, measured sample and time | Clear purpose, not a giant trust score |
| 2 | Panel exact and adjacent agreement with valid-pair denominator; arbitration count | Plain ledger rows with numeric alignment |
| 3 | Quote verification and discarded votes; integrity observations by type | Separate counts because one script can trigger several flags |
| 4 | Teacher overrides and anchor/spot-check error if measured | “Not measured” when no independent teacher sample |
| 5 | Length correlation, red-team passed/total, failed cases, model/prompt versions | Explain correlation is not causation; show raw scope |
| 6 | Drift chart only when implemented and enough reviews; sample count | Label “Simulated” directly in plot title if seeded; never substitute fake values |

Expose limitations beside each metric, not only in a footnote. Kappa is “Not available: insufficient variation” when undefined. Trust has no composite percentage or approval seal.

### Student feedback card — mobile first

| Order | 320–767px single-column content |
|---|---|
| 1 | Insaaf wordmark; assessment title; “Released” with date |
| 2 | “Your mark” followed by `{final} / {total}`; teacher-reviewed notice directly below |
| 3 | Language selector only if translated feedback exists |
| 4 | Criterion heading, mark / maximum, strength quote, improvement quote; repeat without hiding critical content |
| 5 | Concept / application / explanation / presentation notes for dimensions actually present |
| 6 | CLO labels and attained / not yet attained; thresholds explained |
| 7 | Three concrete next steps, numbered; no invented advice if feedback missing |
| 8 | AI assistance disclosure link; review questions directed to lecturer without inventing an appeal route |

Max content width 720px at desktop, 16px mobile margin, feedback measure 65ch. Read without scripts where possible; no charts required. No horizontal scrolling, collapsed marks, teacher notes or peer data. Unknown token: “This feedback link is not available. Check the link with your lecturer.” Do not reveal whether a different student's token exists.

### Disclosure

| Order | Content |
|---|---|
| 1 | “How Insaaf assists your teacher” and exact intro in §7 |
| 2 | Role → model → prompt version table populated with actual configuration |
| 3 | What is sent to models; identity redaction; teacher-only original text; raw files not stored in MVP |
| 4 | How marks are calculated; band table; teacher approval and release |
| 5 | Limits: typed text, undetected PDF white text, uncertain judgements, similarity scope, small calibration sample |
| 6 | Audit and Trust links for authorized teachers; student-safe public explanation |

Keep public explanation separate from private assessment audit. Do not publish speculative model IDs, claim training exclusions or claim all PII is guaranteed removed. Say redaction is performed and may miss identifying content.

## 6. Charts — Recharts theme

| Property | Specification |
|---|---|
| Surface | card; transparent chart background over that surface |
| Categorical palette, maximum 6 | chart-1 green, chart-2 terracotta, chart-3 ochre, chart-4 slate, chart-5 olive, chart-6 charcoal |
| Sequential palette | band-none → band-minimal → band-partial → band-mostly → band-full; dark means more evidence, label all categories |
| Axes | foreground, Source Sans 3 16px; tabular values; 1px border axis; unit in title or tick label |
| Grid | rule, horizontal only, `strokeDasharray="3 4"`; not necessary for understanding values |
| Marks | ≥2px lines / ≥12px bars; dark categorical fills have ≥3:1 against card; light sequential fills get a 1px border outline |
| Categorical redundancy | Direct series labels; circle, square, triangle, diamond, cross, plus markers; solid/dashed/dotted lines where appropriate |
| Threshold | 2px accent, dashed `6 4`, label “Class target {x}%”; mean = primary solid, median = accent dashed; label overlapping lines outside plot |
| Tooltip | card + foreground, 1px border, radius 4px, 12px padding, shadow-paper; series name, value, denominator, unit |
| Chart geometry | 320px desktop, 280px mobile minimum; ResponsiveContainer; 12/16/24/8 margins (top/right/bottom/left); prevent label clipping |
| Interaction | Focusable legend controls if toggling series; data table always available; tap can inspect values; no essential tooltip-only fact |
| Animation | `isAnimationActive={false}` for bars, areas and lines; no decorative sparklines |

Do not use the six colors as six unlabeled slices. Grade distribution uses bars, not a donut. Chart color is never the only route to the numbers. Keep percentile bins and grade thresholds sourced from the scorer; tooltips use recomputed values, not rounded labels as inputs.

```tsx
const chartTheme = {
  colors: Array.from({ length: 6 }, (_, i) => `var(--chart-${i + 1})`),
  tick: { fill: "var(--foreground)", fontSize: 16, fontFamily: "var(--font-ui)" },
  grid: { stroke: "var(--rule)", strokeDasharray: "3 4", vertical: false },
  tooltip: { background: "var(--card)", color: "var(--foreground)",
    border: "1px solid var(--border)", borderRadius: 4, padding: 12,
    boxShadow: "var(--shadow-paper)", fontSize: 16 },
};
// On the chart's sibling: <table> with caption, scoped headers and the same data.
// Recharts: <Bar dataKey="count" fill={chartTheme.colors[0]} isAnimationActive={false} />
```

## 7. Voice and exact microcopy

Plain, respectful, specific. The teacher is the expert. Use sentence case; keep stored enum names in code only. Buttons use verb + object. Avoid unsupported certainty, marketing superlatives, generic “Submit,” “OK,” or “Click here.” Use “AI draft” before approval and “Teacher approved” only after persisted approval. Error templates include the observed cause, not a guessed diagnosis.

| Situation | Exact copy | Action |
|---|---|---|
| No courses | “Add a course to start preparing an assessment.” | Add course |
| No assessments | “Create an assessment with a question and marking criteria.” | Create assessment |
| No rubric | “Describe what a good answer should include. You can edit the compiled criteria before approving them.” | Compile rubric |
| No scripts | “Upload typed scripts as TXT, PDF or DOCX. Each file can be up to 10 MB.” | Choose scripts |
| No review selection | “Choose a script to inspect its evidence and draft marks.” | Review next script |
| No pending review | “There are no scripts waiting for review. Check approved results before release.” | View approved results |
| No analytics | “Charts appear when scripts have complete marks.” | Open submissions |
| No measured trust data | “No grading checks have been recorded for this assessment yet.” | Open submissions |
| No similarity pairs | “No pairs met the current similarity thresholds. This does not prove that every script is original.” | View thresholds |
| Student AI notice | “AI helped draft this feedback. Your teacher reviewed and approved your marks before release.” | Read how Insaaf works |
| Injection flag | “Possible instruction to the grader. This text needs your judgement.” | Inspect flagged text |
| Verified quarantine detail | “The highlighted text was excluded from the grading input.” | Show removed text |
| Collusion flag | “High similarity with {pseudonym}. Compare the shared passages; similarity alone does not establish misconduct.” | Compare scripts |
| Break nudge | “You have reviewed {count} scripts over {minutes} minutes. Would a short break help? Your saved reviews are safe.” | Pause review / Continue review |
| Bulk approval confirmation | “Approve {count} clean scripts? They have no recorded review flags, but AI judgements can still be wrong. Approval records your decision. Students will see marks only after you release them.” | Approve {count} clean scripts / Keep reviewing |
| Disclosure introduction | “Insaaf helps teachers review written work against an approved rubric. AI proposes judgements and quoted evidence; code calculates marks. Your teacher can change the draft and must approve marks before they are released.” | No primary action needed |
| Rubric mismatch | “Criterion marks total {sum}, but this assessment is worth {total}. Adjust the criterion marks before approving.” | Review criterion marks |
| File exceeds limit | “{filename} is larger than 10 MB. Upload a smaller file.” | Choose another file |
| Extraction failed | “We could not extract readable text from {filename}. Upload a text-based PDF, DOCX or TXT file.” | Replace file |
| Grading request failed | “Grading could not finish for {pseudonym}. Your uploaded text is saved. Retry grading.” | Retry grading |
| Network save failure | “Your changes were not saved because the connection failed. Keep this page open and retry when connected.” | Retry saving |
| Mark outside range | “Enter a mark from 0 to {max}, in steps of 0.5.” | Focus mark field |
| Saved | “Marks saved. Review the updated feedback before approving.” | Review feedback |
| Release confirmation | “Release {count} approved results? Each private link will show the approved marks and feedback.” | Release {count} results / Keep results private |

Use dynamic counts from data. A fixture label must say “Synthetic demonstration” beside any invented sample; the brand sheet contains one illustrative review, not performance statistics. Do not add sample agreement rates or fabricated timestamps.

## 8. Accessibility and review keyboard paths

Target WCAG 2.2 AA; this document and palette are not a certification of an unimplemented application. Relevant checks include text contrast (1.4.3), non-text contrast (1.4.11), no color-only meaning (1.4.1), reflow (1.4.10), keyboard operation (2.1.1), character shortcuts (2.1.4), visible/unobscured focus (2.4.7/2.4.11), target size (2.5.8), input errors and labels (3.3.1/3.3.2), and status messages (4.1.3). A 44px target is this design's stronger default; it is not presented as the AA minimum.

- Add “Skip to main content,” `header`, labeled `nav` and one `main`. One h1; sections use h2/h3 without jumps.
- Review shortcuts are **off by default** with a visible “Enable review shortcuts” toggle; settings persist per teacher. They work only while focus is inside the review workspace and never in input, textarea, select, contenteditable, dialog or with modifier keys.
- `j`: select next queue item; `k`: previous; preserve scroll and announce pseudonym/state once. At boundaries stay put and announce boundary.
- `e`: open inline mark editor and focus the first mark. Escape closes without losing changes; prompt inline if unsaved.
- `a`: move focus to the current script's approval confirmation, **never approve immediately**. Enter on the explicitly labeled confirmation commits approval. Disable when incomplete marks, save/feedback pending or blocked state exists. Do not bind single-key release or bulk approval.
- Arrow keys navigate tabs/selects/slider according to their native patterns. Tab order: queue controls → current item → reasons → quote links → vote details → mark editor → approval. Never positive tabindex.
- Focus returns to the trigger after Sheet/Dialog closure. Use `scroll-margin-top:128px` on target headings; show focus without smooth scrolling under reduced motion.
- Errors connect via `aria-describedby`; error summary links focus invalid fields. Async failures preserve entered text. Successful saves are polite status messages; do not announce each token or animation frame.
- Test at 320px, 375px, 768px and 1366×768, 200% zoom, keyboard-only, reduced motion and forced colors. Student content must reflow without horizontal scrolling. Tables may have labeled scroll containers on teacher screens, never whole-page overflow.
- Under forced colors, permit user-agent colors and add text/underline patterns; do not set `forced-color-adjust:none` globally. Use a visible outline instead of a shadow-only focus indicator.
- Form labels stay visible after entry. Passwordless Google sign-in follows provider accessible UI; do not introduce cognitive puzzles.
- Font fallback cannot hide content: `display:swap`; body remains readable offline. Urdu glyphs require a shaping-capable fallback if the embedded font fails.
- Verify with an actual assistive-technology pass during application implementation; automated contrast and browser checks do not establish full conformance.

## 9. Anti-slop audit

“Pass” means this delivered specification and brand reference satisfy the rule; it does not assert that the application already does. Textual Pass/Fail replaces emoji checkmarks to honor the final no-emoji instruction. Re-run the checks on implemented screens.

| Check | Status | Evidence / enforcement |
|---|---|---|
| No purple/blue-purple gradients, default diagonal gradients or gradient text | Pass | Solid token fills only |
| No emoji icons, headings or UI copy | Pass | Text labels; app icons use Lucide |
| No rounded card with thick colored left border | Pass | Rules and underlines only |
| No GitHub-dark background, cyber neon or cyan on black | Pass | Light paper palette |
| No single generic font for heading and body | Pass | Source Serif 4 + Source Sans 3 |
| No AI-drawn objects, people, blobs or floating shapes | Pass | No decorative illustrations |
| No glass, glow or neon text | Pass | Opaque surfaces and two restrained shadows |
| No pure black/white; no gray text on colored surfaces | Pass | Token inventory; semantic dark labels on matching fills |
| No filler names, fake brands, lorem ipsum or fabricated metrics | Pass | Insaaf name; labeled synthetic review only |
| No three equal cards or identical icon-heading-text grids | Pass | Asymmetric charts; plain rows |
| No large context-free metric | Pass | Labels, denominators and draft/release state |
| No universal centering or uniform padding | Pass | Left/start alignment; variable reading density |
| No universal radius, nested cards or card around every block | Pass | Role-based radius; sections separated by space/rule |
| No competing primary actions | Pass | One primary per active screen; reference state selector |
| No mixed icon styles | Pass | Lucide 1.75 stroke only; reference uses text cues |
| No stock chart or toast styling | Pass | Explicit chart and toast specifications |
| No bare spinners | Pass | Static skeleton with status text |
| No unnecessary modals | Pass | Inline editing and existing Sheet; only consequential confirmation dialogs |
| No decorative sparklines or unreadable mini charts | Pass | Data charts ≥280px; table alternatives |
| No missing focus states or hover-only content | Pass | 3px ring; visible labels and focus/tap paths |
| No width/height/margin animation, bouncing, long routines or loops | Pass | Transform/opacity only; 120/240ms; no shimmer |
| No critical student features hidden on mobile | Pass | Full criterion content and next steps stacked |
| Exactly one signature detail | Pass | Criterion-linked evidence underline |
| No ad-hoc component colors | Pass | CSS variables; token definitions hold all hex values |
| Links use accent with thin underline | Pass | Shared global rule |
| Restrained shadows; academic paper rather than landing-page effects | Pass | Two shadow tokens, blur ≤10px |

## 10. Implement in 45 minutes

This is a bounded **styling and composition pass over existing functional components**, not an estimate for building the application described in the roadmap. If screens are missing, first apply the tokens and review/student compositions; leave the remaining blueprints as implementation requirements. No new UI libraries, backend changes, library upgrades or multi-agent work are required.

| Time | Work | Acceptance |
|---|---|---|
| 0–5 min | Check installed Tailwind version; import tokens after stock variables; remove stock dark overrides; add next/font variables | Paper/ink app shell, no HSL wrapper mismatch |
| 5–12 min | Restyle existing Button/Input/Select/Sheet/Badge/Tabs/Toast with shared state rules | One primary, visible keyboard focus, readable disabled/loading |
| 12–22 min | Apply review grid, band/reason mappings, evidence underline and existing mark editor | Quote-to-criterion navigation, flags understandable without color |
| 22–29 min | Apply setup/upload blueprints and explicit progress states | Approve rubric prerequisite and retriable row failures visible |
| 29–35 min | Apply chart theme and Trust rows using current real data | Labels/denominators, no fabricated data, no chart animation |
| 35–40 min | Style student feedback and disclosure; Urdu logical properties | All criteria visible at 375px; state next to total |
| 40–45 min | Verify contrast, 1366×768/375px layouts, keyboard, disabled/loading and reduced motion; run existing relevant checks | No overflow, clipped focus or unreachable actions; record remaining app dependencies |

### Tailwind v3 theme extension

Merge into the existing config; do not replace content paths or plugins. Complete-color variables mean `var(...)`, never `hsl(var(...))`. Avoid opacity suffixes on these classes; use named soft tokens.

```ts
// tailwind.config.ts — v3 only
import type { Config } from "tailwindcss";
const color = (name: string) => `var(--${name})`;
export const insaafTheme = {
  colors: {
    background: color("background"), foreground: color("foreground"),
    card: { DEFAULT: color("card"), foreground: color("card-foreground") },
    popover: { DEFAULT: color("popover"), foreground: color("popover-foreground") },
    primary: { DEFAULT: color("primary"), foreground: color("primary-foreground"),
      hover: color("primary-hover"), active: color("primary-active") },
    secondary: { DEFAULT: color("secondary"), foreground: color("secondary-foreground") },
    muted: { DEFAULT: color("muted"), foreground: color("muted-foreground") },
    accent: { DEFAULT: color("accent"), foreground: color("accent-foreground") },
    destructive: { DEFAULT: color("destructive"), foreground: color("destructive-foreground") },
    border: color("border"), input: color("input"), ring: color("ring"), rule: color("rule"),
    band: Object.fromEntries(["full","mostly","partial","minimal","none"].map(n => [n,color(`band-${n}`)])),
    evidence: { verified: color("evidence-verified"), soft: color("evidence-verified-bg"),
      fuzzy: color("evidence-fuzzy"), error: color("evidence-error") },
    integrity: { DEFAULT: color("flag-integrity"), soft: color("flag-integrity-bg") },
    review: { DEFAULT: color("state-needs-review"), soft: color("state-needs-review-bg") },
    approved: { DEFAULT: color("state-approved"), soft: color("state-approved-bg") },
    released: { DEFAULT: color("state-released"), soft: color("state-released-bg") },
    info: { DEFAULT: color("info"), soft: color("info-bg") },
    partial: { DEFAULT: color("partial"), soft: color("partial-bg") },
    error: { DEFAULT: color("error"), soft: color("error-bg") },
    chart: Object.fromEntries([1,2,3,4,5,6].map(n => [n,color(`chart-${n}`)])),
  },
  fontFamily: {
    sans: ["var(--font-ui)", "sans-serif"], display: ["var(--font-display)", "serif"],
    mono: ["var(--font-data)", "monospace"], urdu: ["var(--font-urdu-next)", "serif"],
  },
  borderRadius: { input: "4px", card: "6px", chip: "999px", dialog: "10px" },
  boxShadow: { paper: "var(--shadow-paper)", overlay: "var(--shadow-overlay)" },
  transitionDuration: { routine: "120ms", panel: "240ms" },
  transitionTimingFunction: { decelerate: "cubic-bezier(.2,0,0,1)" },
} satisfies NonNullable<Config["theme"]>;
// Existing config: theme: { extend: insaafTheme }
```

### Tailwind v4 bridge

The repo version was not supplied. If it uses v4, retain its CSS-first setup and merge the mappings below into its existing `@theme inline`; do not install v3. Import `tokens.css` after the existing shadcn `:root` declarations. Delete conflicting `.dark` overrides because this package defines light only. Leave `tokens.css` as ordinary CSS so it also renders outside Tailwind.

```css
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-border: var(--border);
  --color-rule: var(--rule);
  --color-primary: var(--primary);
  --color-primary-hover: var(--primary-hover);
  --color-primary-active: var(--primary-active);
  --color-primary-foreground: var(--primary-foreground);
  --color-accent: var(--accent);
  --color-accent-hover: var(--accent-hover);
  --color-accent-foreground: var(--accent-foreground);
  --color-evidence-verified: var(--evidence-verified);
  --color-evidence-verified-bg: var(--evidence-verified-bg);
  --color-partial: var(--partial);
  --color-partial-bg: var(--partial-bg);
  --color-error: var(--error);
  --color-error-bg: var(--error-bg);
  --color-flag-integrity: var(--flag-integrity);
  --color-flag-integrity-bg: var(--flag-integrity-bg);
  --color-state-needs-review: var(--state-needs-review);
  --color-state-needs-review-bg: var(--state-needs-review-bg);
  --color-state-approved: var(--state-approved);
  --color-state-approved-bg: var(--state-approved-bg);
  --color-state-released: var(--state-released);
  --color-state-released-bg: var(--state-released-bg);
  --color-info: var(--info);
  --color-info-bg: var(--info-bg);
  --color-band-full: var(--band-full);
  --color-band-mostly: var(--band-mostly);
  --color-band-partial: var(--band-partial);
  --color-band-minimal: var(--band-minimal);
  --color-band-none: var(--band-none);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-chart-6: var(--chart-6);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --font-sans: var(--font-ui);
  --font-display: var(--font-heading-loaded);
  --font-mono: var(--font-data);
  --font-urdu: var(--font-urdu-next);
  --radius-input: 4px; --radius-card: 6px; --radius-chip: 999px; --radius-dialog: 10px;
  --shadow-paper: 0 1px 3px rgb(37 44 40 / .10);
  --shadow-overlay: 0 4px 10px rgb(37 44 40 / .16);
}
/* next/font's heading-loaded variable is also aliased to font-display below.
   v4 examples: bg-evidence-verified-bg, text-flag-integrity, bg-state-needs-review-bg.
   v3 examples: bg-evidence-soft, text-integrity, bg-review-soft. */
```

### next/font setup

```tsx
// src/app/fonts.ts
import { Source_Serif_4, Source_Sans_3, IBM_Plex_Mono, Noto_Nastaliq_Urdu } from "next/font/google";
export const heading = Source_Serif_4({
  subsets: ["latin"], weight: ["600"], display: "swap", variable: "--font-heading-loaded",
});
export const body = Source_Sans_3({
  subsets: ["latin"], weight: ["400", "600"], display: "swap", variable: "--font-ui",
});
export const data = IBM_Plex_Mono({
  subsets: ["latin"], weight: ["400"], display: "swap", variable: "--font-data",
});
// Use this variable on the Urdu-capable student layout; avoid preloading it in teacher routes.
export const urdu = Noto_Nastaliq_Urdu({
  subsets: ["arabic"], weight: ["400", "600"], display: "swap",
  variable: "--font-urdu-next", preload: false,
});
// Root layout: <html lang="en" className={`${heading.variable} ${body.variable} ${data.variable}`}>
// Student layout wrapper for Urdu: <div className={urdu.variable}>...</div>
```

```css
/* After next/font variables are attached to html. Shared heading hook for v3 and v4: */
html { --font-display: var(--font-heading-loaded, var(--font-heading)); }
```

Confirm font export/subset names against the installed Next.js types before integrating; the project package.json was not provided. Fonts are Google Fonts families; next/font downloads at build time and serves files locally. The reference HTML embeds Google Fonts font bytes so its visual specimen has no font-network dependency. Preserve the bundled font license file with distributed font specimens.

### shadcn override wiring

Bind `insaaf-button` and `data-variant` in the existing Button's variant function; map `default` → `primary`, `outline` → `secondary`, `ghost` → `ghost`, `destructive` → `destructive`. Remove conflicting stock background, radius, focus, disabled opacity and `transition-all` classes. Keep Radix/shadcn behavior and accessible names intact. Apply `insaaf-input` to Input/Textarea and the Select trigger. Replace stock selected/hover `bg-accent` with `bg-muted text-foreground`; keep `accent` for links/focus. In Slider, Tab and Sheet overrides, use the state matrix in §4 and do not introduce a new component dependency.

Use existing formatters for half marks and grade thresholds. Evidence navigation requires actual text ranges from verification; do not search by arbitrary first occurrence when quotes repeat. If offsets are absent, show a quoted excerpt with a criterion link until the pipeline supplies unambiguous ranges. Render all submission content as text, never `dangerouslySetInnerHTML`.

### Design references and validation scope

The supplied project, architecture, roadmap, progress and decision files define product behavior. External sources support accessibility and framework wiring; the design recommendations are applications of those principles, not measured results from Insaaf users.

- [W3C WCAG 2.2 quick reference](https://www.w3.org/WAI/WCAG22/quickref/): contrast, keyboard, reflow and target checks. Use the criteria, not this document, for a conformance review.
- [Nielsen's usability heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/): visibility, recognition, consistency and recoverable errors.
- [Next.js font documentation](https://nextjs.org/docs/app/api-reference/components/font): font variables and build-time font loading.
- [shadcn theming](https://ui.shadcn.com/docs/theming): semantic foreground/background token pairs.
- [Tailwind theme variables](https://tailwindcss.com/docs/theme): v4 CSS-first bridge; v3 snippet supplied separately for compatibility.
- [Source Serif 4](https://fonts.google.com/specimen/Source+Serif+4), [Source Sans 3](https://fonts.google.com/specimen/Source+Sans+3), [IBM Plex Mono](https://fonts.google.com/specimen/IBM+Plex+Mono), [Noto Nastaliq Urdu](https://fonts.google.com/noto/specimen/Noto+Nastaliq+Urdu): selected Google Fonts families.
- [Machado color-vision model](https://www.inf.ufrgs.br/~oliveira/pubs_files/CVD_Simulation/CVD_Simulation.html): basis of the local severity-1 matrix check; source page could not be fetched during this run. Simulation is a limited technical check, not a user study.
- [Supplied anti-slop reference](https://deepwiki.com/alchaincyf/huashu-md-html/4.2-anti-ai-slop-design-constraints): inspected as background. The explicit ban list in the user's brief is authoritative.
- The supplied [ux-skill wiki](https://github.com/Laith0003/ux-skill/wiki/Anti-AI-slop-ban-list) and [agent-kit reference](https://cdn.jsdelivr.net/npm/@wystack/agent-kit@0.12.0/wystack-agent-kit/references/anti-patterns.md) were inaccessible; no additional requirements are attributed to those pages.

Checks performed on this package: calculated contrast for all 53 listed pairs; monotonic band luminance under two simulations; HTML structure, CSS and JavaScript checked statically; an offline print render inspected. Browser-based responsive and interactive checks were blocked by the environment, so those remain unverified. These checks do not validate application backend behavior, every screen, actual projector conditions or full screen-reader support. No repository was changed or deployed.
