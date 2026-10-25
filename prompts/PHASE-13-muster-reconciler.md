# Phase 13 — The muster-roll reconciler

**This is the upgrade that wins the hackathon. Everything else is support.**

One worker's grievance is dismissible. A pattern across a muster roll is
evidence. This phase turns Saakshi from a document reader into a social-audit
engine, and it is the demo's climax.

---

## Why this is the right thing to build

The fraud literature says the high-value leakage is **collective, not
individual**:

- Muralidharan, Niehaus and Sukhtankar (AER 2016) found biometric Smartcards cut
  NREGS leakage by 12.7 percentage points — about 41% — mainly by removing
  "quasi-ghosts". The saving was nine times the cost of implementing the scheme.
- A Rajasthan household study found an **84% mismatch** between workers'
  accounts and official records, and specifically **a 43% mismatch in the number
  of co-workers and a 61% mismatch in the names of co-workers and the mate**.
  The researchers did that cross-check by hand. Saakshi makes it automatic.
- Jharkhand's 2021–22 concurrent social audit verified 29,059 schemes across all
  24 districts and found only **25.45% of muster-roll workers actually present**
  at worksites — about 3% in Gumla, 5% in Dhanbad.

The co-worker cross-check is the method that found the fraud. Build that.

---

## Prompt

```
Build the muster-roll reconciler. This is the most important feature in the
project — treat it accordingly and run /plan first.

CONCEPT
A muster roll is free to inspect under Schedule I ¶32. A volunteer photographs
one muster roll plus the job cards of the workers named on it. Gemma 4 extracts
each, a human confirms each, and then DETERMINISTIC code cross-references them
to surface patterns no single worker could see.

1. backend/audit/reconciler.py — pure Python, no model calls, fully tested.

   Input: a confirmed MusterRoll extraction + N confirmed JobCard extractions
          + (optionally) a cached MIS snapshot for that panchayat.

   Checks, each returning a typed Finding with a severity and a clause_id:

   a) GHOST_CANDIDATE
      A name on the muster roll that appears on no worker's job card and has no
      corresponding paper record.
      CRITICAL: name this carefully. Output "unverified name — no paper record
      found" and NEVER "ghost worker" or "fraud" in user-facing text. We detect
      an absence of evidence, not the presence of fraud. A wrongly accused real
      worker is the worst thing this system could do.

   b) DAYS_INFLATED
      MIS/muster days greater than the worker's own job card days, per worker.
      Aggregate by mate and by work code — the pattern is the finding.

   c) OVERLAPPING_ATTENDANCE
      The same worker recorded at two worksites on overlapping dates.

   d) COWORKER_MISMATCH
      The set of co-worker names a worker reports versus the muster roll's set.
      Report Jaccard distance and the specific differences. This is the exact
      check that produced the 61% mismatch finding in the literature — cite it
      in the UI.

   e) WAGE_MISMATCH
      Credited amount != days × notified rate, per worker.

   f) AGGREGATE_DELAY_COMPENSATION
      Sum delay compensation owed across every worker on the roll. This is the
      number that makes the case: individually ₹21.60 is not worth claiming;
      across a roll it is a sum an officer must answer for.

   Every finding carries: severity, affected worker(s), the rupee impact, the
   clause, and the source photo hashes it rests on.

2. GramPanchayatSignal — aggregate findings across all reconciled rolls for a
   panchayat:
   - total unverified names, total inflated days, total rupees at issue
   - per-mate and per-work-code breakdown
   - a coverage statement: "based on 3 of an estimated 14 muster rolls"
   NEVER present a signal without its coverage. A pattern from 3 rolls is a
   lead, not a conclusion, and saying so is what makes it credible.

3. Gemma 4's role here (keep it honest and in its lane):
   - gemma-4-26b-a4b-it extracts the muster roll table — a ruled register with
     20+ rows, mixed handwriting and print. This is the hardest extraction in
     the project and the best demonstration of why a VLM is needed: classical
     OCR loses the row/column binding entirely.
   - gemma-4-31b-it writes the Gram Sabha finding sheet in the local language,
     from the deterministic findings only.
   - Gemma computes NOTHING. Every count and every rupee comes from
     reconciler.py.

4. Name matching across documents is the hard part:
   - Levenshtein plus Indic transliteration, as engine.py already does
   - Handle initials, honorifics (Shri/Smt), patronymics, and spelling variants
   - Any match below a confidence threshold goes to HUMAN REVIEW, never an
     automatic match. A wrong name match here creates a false accusation.
   - Surface ambiguous matches in the UI as "is this the same person?"

5. UI — route /reconcile/[panchayat_id]:
   - A matrix: workers down the side, days across the top, paper vs MIS per
     cell, disagreements marked
   - A findings list ordered by rupee impact
   - The coverage statement, prominent
   - A one-page Gram Sabha finding sheet, printable, with counts, rupee totals
     and a link to each hashed source photo
   - Use --series-other for aggregate categories; cap chart series at 3 per the
     design rules

6. Synthetic demo data: one muster roll of 20 workers, 8 job cards, with
   PLANTED: 2 names on the roll with no job card, 1 worker with 3 inflated days,
   1 wage mismatch, 1 co-worker set disagreement. Ground truth recorded so the
   reconciler's recall on these is measurable. Add it to the eval harness.

7. Tests: every check, with hand-built fixtures and hand-computed expectations,
   including the negative cases — a clean roll must produce zero findings.
```

---

## Language discipline — this matters more than the code

This feature accuses people by implication. Get the wording wrong and it becomes
a liability rather than an asset.

| Never write | Write instead |
|---|---|
| Ghost worker | Name with no paper record found |
| Fraud detected | Discrepancy to raise at the Gram Sabha |
| Corrupt mate | Pattern concentrated under one mate |
| Proof of theft | Evidence requiring explanation |

A judge who hears "our AI detects fraud" will ask what happens when it is wrong.
A judge who hears "we surface discrepancies for a human forum to resolve, and we
state our coverage" hears someone who has thought about the consequences.

## Done when

- [ ] All six checks implemented, deterministic, fully tested
- [ ] The planted errors in the synthetic roll are all found, with recall measured
- [ ] A clean roll produces zero findings
- [ ] Ambiguous name matches go to human review, never auto-match
- [ ] Every signal displays its coverage
- [ ] No user-facing string says "ghost" or "fraud"
- [ ] The Gram Sabha sheet prints on one page with source hashes
