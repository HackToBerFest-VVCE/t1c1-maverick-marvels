# Saakshi Upgrade Kit

Seven phases that take the existing build from "a good document reader" to
"accountability infrastructure". Run them in order against your current repo.

---

## The one-line reframe

**Stop saying scanner. Start saying evidence.**

Your current demo proves one worker is owed ₹21.60. A judge hears a document
scanner. The upgrade makes the demo end on *twenty* workers from one muster
roll, where the system surfaces two names on the government record that appear
on nobody's paper. That is not a scanner. That is a social-audit engine, and it
is the difference between placing and winning.

The evidence for why this matters: social audits flagged **₹935 crore** of
MGNREGA misappropriation over four years and recovered **1.34%** of it. Only
**six of 34 states** had audited more than half their Gram Panchayats as of
November 2023. The bottleneck is not detection law — it is evidence assembly.
That is exactly the gap Saakshi fills, once it aggregates.

---

## Phase order — and why this order

| Phase | File | Hours | Why here |
|---|---|---|---|
| **10** | `PHASE-10-eval-honesty.md` | 1–2 | **Do this first.** Your eval table is probably fabricated. See below. |
| **11** | `PHASE-11-tesseract-baseline.md` | 1–2 | Turns your riskiest judge question into your best slide |
| **12** | `PHASE-12-evidence-packet.md` | 2–3 | Cheap, legally grounded, makes "chain of custody" real |
| **13** | `PHASE-13-muster-reconciler.md` | 4–6 | **The big one.** The demo climax. Do not skip. |
| **14** | `PHASE-14-calibration.md` | 2–3 | Answers "LLM confidence is made up" with measurement |
| **15** | `PHASE-15-selfhost-toggle.md` | 2 | Local deployment dominated past Gemma prize lists |
| **16** | `PHASE-16-pitch-assets.md` | 2 | Judging is 40% impact, and primarily on the video |

If time runs out, the minimum viable set is **10, 11, 13, 16**. Phases 12, 14
and 15 are high-value but survivable losses.

---

## Read this before Phase 10

Your `AUDIT_REPORT.md` reports handwritten accuracy as exactly **75.0%** for
Hindi, Marathi *and* Tamil, with an overall of 76.0%. Four independent language
samples landing on the same round number does not happen. Almost certainly
`evaluate.py` is returning placeholder constants rather than scoring real
extractions against ground truth.

This is the single largest risk to your entry. A judge who probes that table and
watches it collapse will discount everything else you claim, including the parts
that are true. Fabricated-looking metrics are worse than no metrics.

Phase 10 fixes it. Run it before anything else.

---

## What the research changed about your positioning

**On "why not OpenCV/Tesseract" — the premise of the question is wrong and the
evidence is on your side.** Gemma 4 is listed free on the Gemini API, so "expensive
API" is false. On handwriting, Tesseract 5 scores a **49.58% character error
rate** on the standard IAM benchmark against ~1.4% for a modern vision model. On
*real printed* Devanagari scans, classical EasyOCR drops from chrF++ 93.6 to
58.3 — and **69 of its 197 errors were numerals**, which is the entire audit.
Full citations in `reference/ocr-vs-vlm-evidence.md`.

**But the strongest version of the objection is not about accuracy.** It is:
*"Tesseract fails visibly; an LLM fails confidently."* That is a real and fair
point, and your architecture already answers it — human gate, no LLM arithmetic.
Phase 14 makes the answer measured rather than asserted.

**On what wins.** Gemma 4 Good scored Impact & Vision at 40/100 and Technical
Depth at 30/100, and the organisers said communication "is what will set the
winners apart". Winning projects were praised for exactly your design: Project
Rosie won on "deterministic templates… disciplined, non-hallucinatory design".
Gem-Care won by publishing a measured 19.0% WER against a 32.7% baseline. The
pattern is clear — **measured, deterministic, well-narrated beats feature count.**

**Two things not to build.** Benford's law does not apply to formula-bound wages
(₹300 × days) — pre-empt the question, don't build the feature. Thumbprint or
signature matching from phone photos is unreliable and raises real privacy
problems. Both are addressed in `pitch/JUDGE-QA.md`.

---

## Contents

```
CONTEXT-UPDATE.md                  append to your CONTEXT.md
.agents/rules/40-evidence-integrity.md   new always-on rule
prompts/PHASE-10..16                the seven upgrade prompts
pitch/NARRATIVE.md                  the 3-minute script, restructured
pitch/JUDGE-QA.md                   12 anticipated questions, with answers
pitch/STATISTICS.md                 citable opening statistics
reference/ocr-vs-vlm-evidence.md    the OCR defense, with sources
```
