---
trigger: always_on
---

# Evidence integrity rules

Saakshi produces evidence that implicates people. These rules bind all code and
all user-facing text.

## The three guarantees

Every output must be:

1. **Traceable** — every figure traces to a confirmed field, to a crop, to a
   SHA-256 hash taken at capture.
2. **Reproducible** — every figure can be recomputed by hand from the shown
   inputs. Always render the worked-arithmetic line.
3. **Bounded** — every claim states its coverage and uncertainty. No percentage
   without its denominator.

A feature that cannot satisfy all three does not ship.

## Language — binding on all user-facing strings

| Never | Always |
|---|---|
| Ghost worker | A name with no paper record found |
| Fraud / fraud detected | A discrepancy to raise |
| Proof of theft | Evidence requiring explanation |
| Scan / OCR / extract (in UI copy) | Read / record / reconcile |
| The AI found | The system surfaced, for a human to check |

We detect an **absence of corroborating evidence**, never the presence of a
crime. A wrongly implicated real worker is the worst outcome this system can
produce. Write every string as though that risk is live.

## Aggregates

Any panchayat-level or cross-worker signal must display its coverage
("based on 3 of an estimated 14 muster rolls"). An aggregate without coverage is
a false conclusion wearing the clothes of a finding.

## Name matching

Any cross-document name match below the confidence threshold goes to human
review. Never auto-match. Surface ambiguous matches as a question — "is this the
same person?" — not as a decision.

## Metrics

Every proportion reported anywhere — README, UI, audit report, deck — carries
its n and a confidence interval. Never report a metric produced by anything
other than a real measurement against ground truth. If a harness returns a
placeholder, that is a bug of the most serious kind: it makes the project
dishonest.

## Legal claims

We pre-fill Part A of the Section 63 (Bharatiya Sakshya Adhiniyam) certificate.
We cannot supply the Part B expert signature. The only permitted phrasing is
"court-ready preparation". Never "court-admissible", never "legally valid
evidence".

## Do not build

- Benford's law screens on wage amounts — wages are ₹300 × days, so the digit
  distribution is a formula artefact and Benford's assumptions fail.
- Thumbprint or signature matching from phone photos — unreliable, and a false
  match accuses a real person.
