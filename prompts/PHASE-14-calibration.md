# Phase 14 — Earned abstention

**Goal:** answer the judge's best objection with measurement instead of assertion.

The strongest form of the OCR question is not about accuracy. It is:

> "Tesseract fails visibly. An LLM fails confidently. Your confidence score is
> self-reported by the same model that might be hallucinating — so it's made up
> too."

That is a fair point, and "we have a human gate" is only half an answer. This
phase makes the confidence score something you measured rather than something
the model claimed.

---

## Prompt

```
Make our confidence scores earned rather than self-reported.

1. Reliability measurement — scripts/calibration.py:
   - Bucket every extracted field in the eval set by the model's self-reported
     confidence (0.0-0.1, 0.1-0.2, ... 0.9-1.0).
   - For each bucket, compute measured accuracy against ground truth, with n.
   - Produce a reliability diagram: predicted confidence on x, measured
     accuracy on y, with the diagonal drawn.
   - Compute Expected Calibration Error and Brier score.
   - Write reference/CALIBRATION.md with the table, the chart, and the
     operating threshold derived from it.

   Report what you find. If the model turns out to be badly calibrated —
   overconfident, which is the common case — that is a FINDING, not a failure.
   It is precisely why the human gate exists, and saying so is stronger than
   pretending the scores were reliable.

2. Deterministic validators — backend/audit/validators.py, no model involved.
   These catch errors the model's confidence never will:
   - days_worked × notified_rate == amount_claimed (within rounding)
   - every date falls inside the muster period
   - job card number matches the state's format pattern
   - days_worked <= days in the muster period
   - credit_date >= muster_close_date
   - the sum of per-worker days matches any roll total present on the page
   A validator failure forces human review regardless of model confidence.
   This is the key move: arithmetic consistency is independent evidence about
   whether the model read the page correctly.

3. Dual-read agreement:
   - For any field below the calibrated threshold, send the same crop to
     gemma-4-31b-it as well as gemma-4-26b-a4b-it.
   - Agreement raises effective confidence; disagreement forces human review and
     shows the user both readings.
   - Measure on the eval set: does dual-read agreement predict correctness
     better than self-reported confidence? Report the comparison honestly —
     if it does not help, say so and drop it.
   - Cache aggressively; this doubles calls on low-confidence fields only.

4. Abstention as a first-class outcome:
   - A field the system declines to read renders as "could not read — please
     enter" rather than a guess.
   - Track and report abstention rate alongside accuracy. A system that is 95%
     accurate on 80% of fields and abstains on 20% may be more useful than one
     that is 85% accurate on everything — and for a wage calculation it
     certainly is.
   - Add an "abstention rate" row to EVAL-RESULTS.md.

5. UI: on the verify pane, show WHY a field was flagged — low model confidence,
   a failed validator, or a dual-read disagreement. Three different causes
   deserve three different messages, because they tell the user different things
   about what to check.
```

---

## The line this buys you

> "Our confidence isn't the model's opinion of itself. We measured it: at
> confidence above 0.85, fields were right 97% of the time across n=412. Below
> that, we don't guess — we ask. And arithmetic consistency checks run
> independently of the model entirely, so a confidently wrong reading still gets
> caught when the numbers don't reconcile."

That sentence defeats the objection. It is worth the two hours.

## Done when

- [ ] `CALIBRATION.md` has a real reliability diagram with ECE and Brier
- [ ] The operating threshold is derived from measurement, not chosen
- [ ] Validators run independently of the model and force review on failure
- [ ] Dual-read is measured and kept or dropped on the evidence
- [ ] Abstention rate is reported alongside accuracy
- [ ] The verify pane distinguishes the three flag causes
