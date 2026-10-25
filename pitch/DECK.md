# SAAKSHI — 10-Slide Pitch Deck

*Social Audit Evidence Assembly for VB-G RAM G Entitlement Verification*

---

## Slide 1 — The Headline Numbers

# ₹935 Crore Flagged.
# 1.34% Recovered.

*Source: Ministry of Rural Development Social Audit MIS Report (FY2017-18 to FY2020-21).*

---

## Slide 2 — Live Reality: October 2026

### 394 Officials. 311 Gram Panchayats. Two Weeks Ago.

- On 12 October 2026, Karnataka's Rural Development Minister ordered show-cause notices to:
  - **308** Panchayat Development Officers
  - **74** Taluk Executive Officers
  - **12** Deputy Secretaries
- Over systemic wage disbursement delays across **311 Gram Panchayats** in 12 districts (Mysuru: 53, Belagavi: 52, Hassan: 47).
- Delay is not a legacy issue; it is actively occurring in rural Karnataka right now.

*Source: ANI News & Karnataka RDPR Department, 12 October 2026.*

---

## Slide 3 — The Paper-vs-Database Gap

| What the Rural Worker Holds | What the State System Holds |
|---|---|
| Physical paper Job Card (smudged, handwritten) | NREGAsoft / VB-G RAM G MIS Portal |
| Physical bank passbook stamp | PFMS electronic fund transfer record |
| Worksite chalk attendance board | Digital mate mobile attendance (NMMS) |

**The Bottleneck:**
- The worker's paper is the primary evidence under Section 5(3) and Schedule I ¶32.
- The state database is where discrepancies originate (uncredited days, proxy entries, ghost records).
- Cross-referencing paper with the database manually takes hours per worker, requiring literacy and administrative access that poor households do not possess.
- Delay compensation legally owed (0.05%/day under Schedule II ¶6) is ₹21.60 per worker — individually too small to fight for, collectively ₹399M in unacknowledged unpaid liabilities.

---

## Slide 4 — The Governing Principle

> ### "The AI reads. The code computes. The human decides."

- **The AI reads:** Gemma 4 converts multimodal document photographs into structured Pydantic schemas. It never totals, compares, or calculates a number.
- **The code computes:** All arithmetic, date intervals, and delay compensation live in unit-tested, deterministic Python (`backend/audit/engine.py`).
- **The human decides:** Zero output is computed until a human confirms or edits the field beside its cropped photo on the verification pane.

---

## Slide 5 — The Technical Architecture

```
[Camera / Android PWA / ESP32 Reader]
        │
        ▼ (Canvas EXIF/GPS Strip + SHA-256 Dual-Hash)
[FastAPI Audit Engine (Port 8000)]
        │
        ├──► backend/gemma/client.py  ──► Gemma 4 (26B Vision / 31B Text)
        ├──► backend/audit/engine.py  ──► Deterministic Arithmetic (Paise)
        ├──► backend/audit/reconciler ──► Collective Muster Cross-Referencing
        ├──► backend/audit/validators ──► Invariant Checks (Math, Dates, Regex)
        └──► backend/evidence/manifest──► Section 63 BSA Tamper-Proof Hash Packet
```

**Zero Gemini Fallbacks:** Strict allowlist enforces `gemma-4-26b-a4b-it` and `gemma-4-31b-it`. Any other model string raises an immediate exception.

---

## Slide 6 — Classical OCR (Tesseract) vs. Multimodal Gemma 4

*Benchmarked on identical 30-document synthetic dataset (n=30 docs, 193 fields):*

| Metric | Tesseract + OpenCV + Heuristics | Gemma 4 26B Multimodal | Delta |
|---|---|---|---|
| **Overall Field Accuracy** | 11.4% [7.7% – 16.5%] | **86.0% [80.4% – 90.2%]** | **+74.6%** |
| **Handwritten Indic Text** | 0.0% (0/87 fields) | **96.6% [90.3% – 98.8%]** | **+96.6%** |
| **Printed Register Text** | 20.8% [14.1% – 29.5%] | **77.4% [68.5% – 84.3%]** | **+56.6%** |
| **Discrepancy Recall** | 0.0% (0/12 flagged) | **66.7% [39.1% – 86.2%]** | **+66.7%** |

### The Failure Gallery:
1. **Numeral Misread:** Tesseract reads handwritten Marathi numeral `६` (6) as `e` or dropped byte. Gemma 4 reads `6` with 0.88 confidence.
2. **Layout Disintegration:** Ruled muster column boundaries confuse Tesseract OCR boxes, shifting dates into wage rate columns. Gemma 4 preserves relational cell bindings.
3. **Confident Hallucination vs. Calibrated Abstention:** Tesseract produces random symbol strings (`***!!#`); Gemma 4 surfaces low confidence or abstains, prompting human review.

---

## Slide 7 — The Climax: Muster-Roll Reconciler

*Collective cross-referencing across Gram Panchayat muster rolls:*

- **Unverified Names:** 2 names on official muster with no paper job card record in the village (₹3,600.00 discrepancy).
- **Inflated Days:** 8 days recorded on muster vs. 4 days on worker's signed paper job card (+4 unearned days concentrated under Mate Dnyandev Shinde).
- **Withheld Wages:** 6 days worked by Kamlabai Jadhav, 0 credited on muster (₹1,800.00 unpaid wages + ₹21.60 delay compensation).
- **Co-Worker Mismatch:** Jaccard distance 1.0 (worker reported completely different worksite mates than muster listing — replicating the 61% mismatch identified by Sandhya & Rajeev, Ideas for India).
- **Coverage Stated:** *"Based on 1 of an estimated 14 muster rolls (7.1% coverage)."*

---

## Slide 8 — Earned Abstention & Confidence Calibration

*Answer to the judge's objection: "How do you know model confidence isn't made up?"*

- **Measured on Eval Dataset (n=30 docs, 193 fields):**
  - **Expected Calibration Error (ECE):** 9.18%
  - **Brier Score:** 0.1253
  - **Calibrated Operating Threshold:** **≥ 0.85**
  - **Measured Accuracy above 0.85:** **97.4% [93.1% – 99.2%]** (n=115 fields)
- **Below 0.85:** System abstains from assumption and prompts human review with cropped image snippet.
- **Independent Deterministic Validators:** Pure Python verifies statutory wage formulas (`days × ₹300 == credited`), date windows, and job card regex, catching errors regardless of model self-confidence.

---

## Slide 9 — Tamper-Evident Evidence Packet (Section 63 BSA)

*From grievance claim to court-ready evidentiary proof under Section 63 of Bharatiya Sakshya Adhiniyam, 2023:*

- **Dual-Hash at Capture:**
  - Original camera bytes SHA-256 (pre-compression)
  - Processed model bytes SHA-256 (post-normalization)
- **Human Confirmation Audit Trail:**
  - Records model proposal vs. human confirmed value, changed status, and UTC timestamp.
- **Part A Custodian Schedule Pre-Fill:**
  - Labeled: *"Court-ready preparation — Part B expert certification still required."*
- **CLI Verifier (`scripts/verify_packet.py`):**
  - Re-checks every image hash and re-runs deterministic engine arithmetic.
  - Passes on clean packets; alters 1 byte of photo and verifier fails loudly with non-zero exit code.

---

## Slide 10 — Deployment Modes: Hosted vs. Air-Gapped

*Open weights mean sovereignty for state institutions:*

| Deployment Mode | Volunteer on Mobile | State Social Audit Unit |
|---|---|---|
| **Engine** | Google Gemini API (Free Tier) | Local Ollama / vLLM / LiteRT |
| **Model** | `gemma-4-26b-a4b-it` | `gemma4:26b` (Quantized GGUF) |
| **Connectivity** | 4G / Wi-Fi | 100% Offline Air-Gapped |
| **Data Privacy** | Standard Google API Terms | Zero bytes leave the physical laptop |
| **Cost** | $0.00 / month | Existing government hardware |

**Live Runtime Toggle:** Flip from `[GEMINI API]` to `[LOCAL OLLAMA]` in under 2 seconds. Same Pydantic schemas, same deterministic audit engine, zero silent fallbacks.
