# CONTEXT update — append to CONTEXT.md

Add this to the existing `CONTEXT.md`. It does not replace anything; it changes
what the project *is for*, which changes how the agent builds.

---

## 10. The reframe: from document reader to accountability infrastructure

Saakshi's first version answered: *what is this one worker owed?*

That question has a ceiling. One worker's grievance is dismissible, the sums are
individually small (₹3,000 paid 30 days late earns about ₹45), and the effort of
claiming exceeds the value — which is precisely why the money is never claimed.

The second version answers: **what does this muster roll show when twenty
workers' paper is compared against the government's record?**

That is a different question with a different ceiling. It is the question social
audits exist to answer and mostly cannot, because assembling the evidence is
manual. Researchers in Rajasthan did exactly this co-worker cross-check by hand
and found a 61% mismatch in co-worker and mate names. Saakshi makes it a
by-product of a worker checking their own wages.

**The product is not a scanner. It is evidence assembly.** Every design
decision follows from that, and so does every word in the interface.

---

## 11. Language discipline — binding on all user-facing text

This system creates evidence that implicates people. Wording is not cosmetic.

| Never | Always |
|---|---|
| Ghost worker | A name with no paper record found |
| Fraud detected | A discrepancy to raise |
| Proof of theft | Evidence requiring explanation |
| Scan / OCR / extract (in UI copy) | Read / record / reconcile |
| The AI found | The system surfaced, for a human to check |

Saakshi detects **an absence of corroborating evidence**, never the presence of
a crime. A wrongly implicated real worker is the worst outcome this system can
produce, and the interface must be written as though that risk is live — because
it is.

Any aggregate signal must display its **coverage**. "Based on 3 of an estimated
14 muster rolls" is the difference between a lead and a false conclusion.

---

## 12. The three evidence guarantees

Everything the system outputs must satisfy all three:

1. **Traceable.** Every figure traces to a confirmed field, which traces to a
   crop of a source photo, which traces to a SHA-256 hash taken at capture.
2. **Reproducible.** Every figure can be recomputed by hand from the shown
   inputs. The worked-arithmetic line is not a nicety — it is what lets a Gram
   Sabha verify the claim without trusting us.
3. **Bounded.** Every claim states its coverage and its uncertainty. No
   percentage appears without its denominator.

A feature that cannot satisfy all three does not ship.

---

## 13. What we deliberately do not build

Recorded so nobody re-proposes them mid-build:

- **Benford's law screens.** Wages are ₹300 × days — rule-generated, so the
  digit distribution is a formula artefact. Benford's assumptions do not hold.
  Possibly valid for material bills and measurement-book quantities; roadmap
  only.
- **Thumbprint or signature matching.** Phone-photo biometrics are unreliable,
  and a false match accuses a real worker. At most, flag visually similar marks
  for a human — and that is a social audit unit's decision, not ours.
- **Automatic name matching below the confidence threshold.** Ambiguous matches
  go to human review. Always.
- **Any claim of court admissibility.** We pre-fill Part A of the Section 63
  certificate. We cannot supply the Part B expert signature. The phrase is
  "court-ready preparation".

---

## 14. Why this had to be Gemma

Keep this answer sharp; it is 20% of the MedGemma rubric and a certain question.

A State Social Audit Unit handling citizen entitlement data cannot send it to a
third-party API. Gemma 4 is Apache 2.0, so the identical weights run on the
unit's own hardware — same prompts, same code path, data never leaving the
state. A closed model makes this product undeployable for its actual
institutional user.

That is a deployment constraint, not a preference, and it is the honest answer
to "why not Gemini or GPT".
