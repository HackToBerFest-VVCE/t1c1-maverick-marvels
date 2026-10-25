# Citable statistics

Every figure here has a source. Say the number, then say where it came from —
that habit is worth more than any extra figure.

---

## The headline pair (open with these)

**₹935 crore flagged. 1.34% recovered.**
Social Audit Units flagged ₹935 crore of MGNREGA misappropriation from FY2017-18
to FY2020-21; approximately ₹12.5 crore was recovered.
*Source: Rural Development Ministry MIS data, reported in The Indian Express.
The Union Rural Development Secretary wrote to state chief secretaries asking
why states had made only "little recoveries."*

**394 officials, 311 panchayats, two weeks ago.**
On 12 October 2026 Karnataka's Rural Development Minister ordered show-cause
notices to 308 Panchayat Development Officers, 74 Taluk Executive Officers and
12 Deputy Secretaries over VB-G RAM G wage delays across 311 Gram Panchayats in
12 districts — most in Mysuru (53), Belagavi (52) and Hassan (47).
*Source: ANI, 12 October 2026.*

The second one matters because it is current and local. If judges are in
Karnataka, this is happening in their state this month.

---

## Recovery stays negligible, year after year

| Year | Flagged | Recovered | Rate |
|---|---|---|---|
| FY2017-18 – FY2020-21 | ₹935 cr | ₹12.5 cr | 1.34% |
| 2021-22 | ₹171 cr | ₹26 cr | 15% |
| 2022-23 | ₹86.2 cr | ₹18 cr | 20.8% |
| 2023-24 | ₹27.5 cr | ₹1.31 cr | 4.8% |
| Maharashtra 2024-25 | ₹7.11 cr | ₹16.31 lakh | 2.29% |

Tamil Nadu alone flagged ₹245 crore and recovered 0.85%.

---

## Delay compensation is owed and not paid

**71% of MGNREGA payments were delayed by the Union government**, and 44% of
transactions exceeded 15 days, April–September 2021.
*Source: LibTech India, "Heavy Wait".*

**₹399 million in compensation**, owed for Union-caused delays in that sample
alone, was "neither acknowledged nor paid."
*Source: Bheemarasetti, De, Narayanan, Saboo & Tamang, The Indian Journal of
Labour Economics.*

This is the statistic that justifies the product. The money is legally owed, the
arithmetic is defined in the statute, and it still does not reach anyone.

---

## The records do not match reality

**84% mismatch** between workers' accounts of their most recent work spell and
the official record — 15% even allowing a ±10-day tolerance. Specifically:
**a 43% mismatch in the number of co-workers and a 61% mismatch in the names of
co-workers and the mate.**
*Source: Sandhya & Rajeev, "Estimating wage corruption in MNREGA", Ideas for
India. 272 households, Dudu and Bhim blocks, Rajasthan.*

**Use this one when you demo the reconciler.** The researchers did that
co-worker cross-check by hand. Your system does it automatically.

**Only 25.45% of muster-roll workers were actually present** at worksites —
40,629 of 1,59,608 — about 10% in Dumka and Godda, 3% in Gumla, 5% in Dhanbad.
*Source: Jharkhand Concurrent Social Audit Report 2021-22, covering 29,059
schemes across 1,118 panchayat areas in all 24 districts, via PTI.*

---

## Digitisation moved the fraud, it did not end it

A **₹1,200 crore Rajasthan scam** used fake photographs and biometric entries;
disciplinary action followed against more than 5,000 officials.

Biometric Smartcards cut NREGS leakage by **12.7 percentage points (about 41%)**,
mainly by removing "quasi-ghosts" — a saving of $38.7 million a year, nine times
the cost of implementation.
*Source: Muralidharan, Niehaus & Sukhtankar, "Building State Capacity",
American Economic Review 2016.*

Use the second to show leakage is addressable; use the first to show digital
attendance alone does not address it.

---

## Social audit capacity is the bottleneck

**Only six of 34 states and UTs had audited more than 50% of Gram Panchayats**
as of November 2023.
*Source: Ministry of Rural Development social audit MIS.*

Andhra Pradesh ran its social audits at **0.5–1% of annual MGNREGA spending**.
Cheaper evidence assembly means more audits — this is the scaling argument.

---

## The 2026 transition is causing live harm

- VB-G RAM G received assent 21 December 2025 and took effect 1 July 2026, but
  draft rules appeared only in late May 2026.
- The 2026-27 allocation of ₹95,692 crore funds far fewer than the promised 125
  days, per Down To Earth.
- Chittoor, Andhra Pradesh: roughly ₹30 crore in wages pending about four weeks
  for work done since 1 September.
- Punjab: workers reported five months without wages; the BDPO said bills were
  uploaded but payment was "pending at government level."

---

## The OCR comparison figures

- Tesseract 5 on IAM handwriting: **49.58% CER, 91.1% WER, 0% of lines exact.**
  Gemini 3 Flash on the same lines: 1.42% CER. *(okraPDF benchmark — vendor
  source, but consistent with peer-reviewed results putting GPT-4o-mini at 1.71%
  CER on IAM, arXiv 2503.15195.)*
- Real printed Devanagari scans: EasyOCR falls from chrF++ 93.6 (synthetic) to
  **58.3 (real)**, median CER ~2% → 17%. Gemini 2.5 Flash holds at 86.3 with
  median CER 0.0. **69 of EasyOCR's 197 errors were numerals.**
  *(arXiv 2606.29213, "Can OCR-VLMs Read Devanagari?", 300 real scans.)*
- Purpose-trained Devanagari handwriting models still reach only **26.22% WER /
  8.64% CER** without a lexicon on IIIT-HW-Dev — on pre-cropped single words.
  *(Dutta, Krishnan, Mathew, Jawahar, DAS 2018.)*
- At full-page level on Indic handwriting, the best word recognition rate falls
  to **43.67%**. Tesseract as a word *detector* scores F1 4.45 at IoU 0.75
  against 99.70 for a fine-tuned detector. *(IIT Bombay PLATTER, arXiv 2502.06172.)*
- Gemma 4's own OmniDocBench 1.5 edit distance: **0.149 for 26B A4B** against
  0.365 for Gemma 3 27B — a 2.4× error reduction in one generation.
  *(Gemma 4 model card.)*

---

## Numbers to avoid

**Do not cite Benford's law** as a detection method. Wages here are ₹300 × days,
so the digit distribution is an artefact of the formula.

**Do not quote "1 in 20 muster rolls falsified"** — it traces to a 2007 EPW
commentary seen only through a secondary summary.

**Do not state ₹399 million as a national figure.** It is the compensation owed
within one study's sample, for Union-caused delays only. Said precisely it is
powerful; said loosely it is wrong and a judge may know the source.
