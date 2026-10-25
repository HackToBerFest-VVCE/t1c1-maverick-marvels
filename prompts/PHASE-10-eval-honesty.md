# Phase 10 — Make the evaluation real

**Run this before any other upgrade.**

Your `AUDIT_REPORT.md` reports handwritten accuracy of exactly 75.0% for Hindi,
Marathi and Tamil. Four independent samples do not land on the same round
number. That pattern means `evaluate.py` is almost certainly returning
placeholder constants instead of scoring real extractions.

A judge who probes that table and watches it collapse discounts everything else
you claim. Fabricated-looking metrics are worse than no metrics.

---

## Prompt

```
Audit scripts/evaluate.py with suspicion. I believe it is reporting placeholder
values rather than measuring real extraction accuracy.

Investigate and report honestly before changing anything:
1. Does evaluate.py actually call extract() on each document, or does it return
   hardcoded/simulated numbers?
2. Is there a real ground-truth file per synthetic document, and does the
   scorer compare field-by-field against it?
3. Does make_synthetic_docs.py emit ground truth alongside each image?
4. Does the 42-second total runtime make sense for 30 real vision API calls?
   A Gemma 4 vision call takes seconds; 30 of them cannot complete in 42s
   unless they were cached or never made.

Tell me what you find before you fix it. Do not quietly repair and re-report.

Then rebuild the harness so every number is measured:

- Per-field comparison against ground truth, with a documented match rule:
  exact match for identifiers and dates; numeric equality for amounts and day
  counts; normalised string comparison (trim, case, Unicode NFC) for names.
- Report, with the denominator printed beside every figure:
    fields_total, fields_correct, accuracy
    split by printed vs handwritten
    split by language
    split by document type
- Discrepancy detection: recall and precision against the seeded errors, with
  the count of seeded errors stated.
- A 95% Wilson confidence interval on every proportion. At n=30 documents,
  100% recall has a lower bound near 89% — say so rather than claiming 100%.
- Real latency: median and p95 per call, measured, with caching DISABLED for
  the eval run. Add a --no-cache flag and use it.
- Total API calls made, printed, so the runtime is verifiable.

Rewrite reference/EVAL-RESULTS.md with:
- the honest numbers, whatever they are
- n for both documents and fields, beside every figure
- the confidence intervals
- a "Limitations" section stating plainly: synthetic documents, n=30, generated
  by the same team that built the extractor, not yet validated on real
  consented documents

Then update AUDIT_REPORT.md and README.md to match. If the real numbers are
worse than the claimed ones, report the real ones. Do not tune the test set to
flatter the model.

Show me the diff between claimed and measured.
```

---

## Why honesty wins here

The MedGemma rubric explicitly asked entrants to describe *how they calculated
their estimates*. Judges in these competitions reward candour and sample sizes.
A table reading "handwritten 71.3% (n=412 fields, 95% CI 66.8–75.5)" is far more
credible than "76.0%" with no denominator — and it cannot be knocked down.

## Done when

- [ ] `evaluate.py` demonstrably calls the real extractor with caching off
- [ ] Every proportion carries n and a confidence interval
- [ ] `EVAL-RESULTS.md` has a Limitations section
- [ ] `AUDIT_REPORT.md` and `README.md` show the same measured numbers
- [ ] No two language rows share a suspiciously identical value
