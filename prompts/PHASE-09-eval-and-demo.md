# Phase 9 — Measurement, README and demo

**Goal:** the things that actually win this challenge. Past winners of the Gemma
challenges won on published numbers and a clean integration story, not on the
longest feature list.

**Do not skip this phase to add a feature.** A measured, well-documented project
beats a bigger undocumented one in front of these judges.

---

## Prompt

```
Build the evaluation harness, the README, and the demo safety net.

1. scripts/make_synthetic_docs.py — 30 synthetic documents across Hindi,
   Marathi, Tamil and English: job cards with handwritten entries, passbook
   pages, worksite boards, muster roll printouts. Mix handwriting with print.
   Seed known errors: missing muster entries, wrong day counts, late credit
   dates, name spelling variants.
   SYNTHETIC ONLY. Never a real worker's document, in the repo or in a test.
   Write the ground truth to a JSON file alongside each image.

2. scripts/evaluate.py — runs extraction over the test set and reports:
   - field-level accuracy, split by printed vs handwritten
   - accuracy per language
   - discrepancy-detection recall against the seeded errors
   - false-positive rate on clean documents
   - median and p95 latency per call
   - total API calls, and cache hit rate
   Write results to reference/EVAL-RESULTS.md as a table with a timestamp.
   Report the numbers you get. Do not tune the test set to flatter the model —
   a judge who finds a cherry-picked benchmark discounts the whole entry.

3. README.md — the FIRST section, above everything including the project
   description, must be:

   ## Model
   This project uses **Google Gemma 4** via the **Gemini API**
   (`google-genai` SDK).

   | Where | Model ID | Modality | What it does |
   |---|---|---|---|
   | `backend/gemma/extract.py` | `gemma-4-26b-a4b-it` | image + text → JSON | reads document photos |
   | `backend/gemma/orchestrator.py` | `gemma-4-31b-it` | text + tools | proposes which audit checks to run |
   | `backend/gemma/draft.py` | `gemma-4-31b-it` | text | drafts the grievance documents |

   Every call goes through `backend/gemma/client.py`, which enforces a model
   allowlist — no other model can be called. No other LLM is used.

   Then: the problem, the "AI reads, code computes, human decides" principle,
   the architecture diagram, the accuracy table from EVAL-RESULTS.md, setup
   instructions, and the API-key policy.

   Include a 20-second GIF of the trace panel filling up during a live
   extraction. That single asset answers "is Gemma really integrated" faster
   than any paragraph.

4. Demo safety net:
   - Record a full 3-minute run as video, NOW, while everything works.
   - Pre-warm the extraction cache for every demo image so the live run makes
     the minimum number of API calls.
   - A seeded demo account with one completed audit, so nothing depends on a
     live extraction succeeding on stage.
   - Verify free-tier quota in AI Studio and note the limits in the README.

5. Final security sweep:
   - git log -p | grep -iE "AIza[0-9A-Za-z_-]{35}"  → must be empty
   - grep -rn "google.genai" backend/ | grep -v client.py  → must be empty
   - grep -rn "gemini-" backend/ frontend/  → must be empty
   - Confirm no NEXT_PUBLIC_ variable holds a secret
   - Confirm no real worker data anywhere in the repo or its history
```

---

## The 3-minute demo script

1. Show a Hindi job card photo with handwritten entries, beside a muster roll
   printout. Say what each one is.
2. Capture both. Extracted fields appear beside the image crops. **Correct one
   low-confidence digit live** — this is the moment that shows a human is in
   control, and judges remember it.
3. Run the audit. The trace panel fills: model ID, latency, tokens.
4. Read the result aloud: "6 days worked but absent from the muster roll,
   ₹1,800 unpaid. Wages credited 40 days after the muster closed, so ₹21.60
   delay compensation is owed under Schedule II ¶6."
5. Switch to Hindi, press read-aloud, show the grievance PDF.
6. Close on one slide: the accuracy table, and "Gemma 4 via the Gemini API,
   Apache 2.0, so a State Social Audit Unit can self-host the same weights."

Optional, only if everything above is solid: tap the NFC card on the reader.

## Done when

- [ ] `reference/EVAL-RESULTS.md` has real, untuned numbers
- [ ] The README's first section is the model table
- [ ] The trace-panel GIF is in the README
- [ ] The backup video exists
- [ ] All five security greps come back clean
- [ ] A dry run of the 3-minute script finishes inside 3 minutes
