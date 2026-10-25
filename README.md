# Saakshi — Social Audit Evidence Assembly for VB-G RAM G

## Model Architecture & Call Sites
This project runs exclusively on **Google Gemma 4** open-weights models via the **Gemini API** (`google-genai` SDK) with local self-host support via **Ollama**.

| Where | Model ID | Modality | What it does |
|---|---|---|---|
| `backend/gemma/extract.py` | `gemma-4-26b-a4b-it` | Image + Text → JSON | Reads document photographs (job cards, passbooks, muster rolls) into structured schemas |
| `backend/gemma/orchestrator.py` | `gemma-4-31b-it` | Text + Tools | Proposes which deterministic audit checks to run using Python tool loops |
| `backend/gemma/draft.py` | `gemma-4-31b-it` | Text → Prose | Drafts court-ready Section 63 BSA evidence dossiers and Gram Sabha finding sheets in 7 languages |

*Every API call is routed through `backend/gemma/client.py`, which hard-enforces this allowlist before any request leaves the process. No Gemini fallbacks exist anywhere in this codebase.*

---

## What Saakshi Does
**Saakshi turns physical paper records held by rural employment guarantee workers into tamper-evident, court-ready evidence to reconcile wage discrepancies against official government databases.**

---

## The Headline Reality

### ₹935 Crore Flagged. 1.34% Recovered.
Between FY2017-18 and FY2020-21, Social Audit Units across India flagged **₹935 crore** in rural employment guarantee misappropriations; only **₹12.5 crore (1.34%)** was ever recovered (*Ministry of Rural Development MIS*). 

**Karnataka, October 2026:** Just two weeks ago, Karnataka's Rural Development Minister issued show-cause notices to **394 officials** (308 Panchayat Development Officers, 74 Taluk Executive Officers, 12 Deputy Secretaries) over systemic wage delays across **311 Gram Panchayats**. The law promises wages within 15 days plus 0.05%/day in statutory delay compensation; in practice, workers hold physical paper, the state holds a database, and cross-referencing them has historically required hours of manual labour per worker.

---

## Classical Baseline vs. Multimodal Gemma 4

We benchmarked classical OCR (Tesseract 5.3 + OpenCV bilateral filtering, deskewing, Otsu adaptive thresholding, and regex heuristics) against multimodal `gemma-4-26b-a4b-it` on an identical 30-document ground-truth evaluation dataset:

| Benchmark Metric | Classical Baseline (Tesseract + OpenCV) | Multimodal Gemma 4 26B | Delta |
|---|---|---|---|
| **Overall Field Accuracy** | 11.4% [7.7% – 16.5%] (22/193) | **86.0% [80.4% – 90.2%]** (166/193) | **+74.6%** |
| **Handwritten Indic Text** | 0.0% (0/87 fields) | **96.6% [90.3% – 98.8%]** (84/87) | **+96.6%** |
| **Printed Register Text** | 20.8% [14.1% – 29.5%] (22/106) | **77.4% [68.5% – 84.3%]** (82/106) | **+56.6%** |
| **Discrepancy Recall** | 0.0% (0/12 flagged) | **66.7% [39.1% – 86.2%]** (8/12) | **+66.7%** |
| **Discrepancy Precision** | N/A (0 detections) | **100.0% [67.6% – 100.0%]** (8/8) | **100.0%** |
| **Execution Latency** | 0.42s / doc (CPU) | 45.4s / doc median (Gemini API) | Trade-off for fidelity |

*Full methodology, field-by-field breakdown, and 95% Wilson score confidence intervals are documented in [`reference/BASELINE-COMPARISON.md`](reference/BASELINE-COMPARISON.md) and [`reference/EVAL-RESULTS.md`](reference/EVAL-RESULTS.md).*

---

## The Failure Gallery: Why Classical OCR Fails on Paper Records

```
Case 1: Numeral Misread in Handwritten Regional Script
Paper Crop:         Handwritten Marathi numeral '६' (6 days worked)
Tesseract 5.3:      Read as 'e' or dropped character entirely (0% on handwriting)
Gemma 4 26B:        Read as '6' with 0.88 confidence; matched ground truth

Case 2: Ruled Table Layout Disintegration
Paper Crop:         Ruled tabular muster roll register with stamps & gridlines
Tesseract 5.3:      Column bounding boxes collapsed; dates blended into wage rate cells
Gemma 4 26B:        Preserved relational cell bindings across all 20 rows and columns

Case 3: Hallucination vs. Calibrated Abstention
Paper Crop:         Water-damaged, smudged ink stamp across Job Card ID
Tesseract 5.3:      Emitted confident random punctuation noise ("***!!#")
Gemma 4 26B:        Reported low confidence (0.68 < 0.85), prompting human verification
```

---

## The Muster-Roll Reconciler

One worker's discrepancy can be dismissed as a clerical error; a collective pattern across a muster roll is evidence. The reconciler cross-references confirmed paper job cards against official muster rolls and surfaces collective patterns for Borgaon Gram Panchayat:

- **Unverified Names:** 2 names on official muster with no physical job card found in the village register (₹3,600.00 discrepancy).
- **Inflated Attendance Days:** 8 days recorded on muster vs. 4 days on worker's signed paper job card (+4 unearned days concentrated under Mate Dnyandev Shinde).
- **Withheld Wages:** 6 days worked by Kamlabai Jadhav, 0 credited on muster (₹1,800.00 unpaid wages + ₹21.60 delay compensation).
- **Worksite Co-Worker Mismatch:** Jaccard distance 1.0 (worker reported completely different worksite mates than muster listing — replicating the 61% mismatch identified by Sandhya & Rajeev, Ideas for India).
- **Mandatory Coverage Banner:** *"Coverage: based on 1 of an estimated 14 muster rolls (7.1% coverage)."*

---

## Earned Abstention & Confidence Calibration

Rather than trusting self-reported model confidence, we calibrated it empirically across 193 fields in our evaluation dataset:

- **Expected Calibration Error (ECE):** 9.18%
- **Brier Score:** 0.1253
- **Calibrated Operating Threshold:** **≥ 0.85** (Accuracy above threshold: **97.4% [93.1% – 99.2%]**, n=115)
- **Earned Abstention Policy:** Fields with confidence < 0.85 abstain from automated assumption and require human review.
- **Deterministic Validators:** Pure Python verifies statutory wage formulas (`days × ₹300 == credited`), date windows, and job card regex, catching errors regardless of model self-confidence.

*See [`reference/CALIBRATION.md`](reference/CALIBRATION.md) for full reliability diagrams and bucket metrics.*

---

## Technical Architecture & Evidentiary Chain of Custody

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

### The Three Evidentiary Guarantees
1. **Traceable:** Original camera bytes and processed model bytes are dual-hashed with SHA-256 at capture client-side.
2. **Reproducible:** All arithmetic runs in deterministic Python (`engine.py`). Zero numbers are generated by LLMs.
3. **Bounded:** Every collective aggregate states its coverage (*"based on 1 of an estimated 14 muster rolls"*).

### Section 63 Bharatiya Sakshya Adhiniyam (BSA), 2023
Generates court-ready electronic evidence packets including Part A Custodian Declarations with cryptographic hashes, human confirmation audit trails, and deterministic worked arithmetic. The CLI verifier (`scripts/verify_packet.py`) independently confirms hash integrity and mathematical consistency.

---

## Deployment Modes: Hosted vs. Air-Gapped Local

Gemma 4's Apache 2.0 open weights enable two distinct deployment environments:

1. **Hosted API Mode (Google Gemini API):** Fast inference, zero local hardware requirements, $0 API cost for volunteers in the field.
2. **Self-Hosted Air-Gapped Mode (Local Ollama / vLLM):** For State Social Audit Units that cannot transmit citizen entitlement data to external APIs. Runs on local hardware with identical models (`gemma4:26b`), identical prompts, and identical Pydantic validation.
   - **Live Runtime Toggle:** Switch between `[GEMINI API]` and `[LOCAL OLLAMA]` in under two seconds via the topbar or `/settings`. If local Ollama is unreachable, the system fails loudly with zero silent fallback.

*See [`reference/LOCAL-BENCHMARK.md`](reference/LOCAL-BENCHMARK.md) for local latency and RAM measurements.*

---

## How to Run the Project

### Prerequisites
- Python 3.11+
- Node.js 18+

### Step 1: Clone and Configure Environment
```bash
git clone https://github.com/HackToBerFest-VVCE/t1c1-maverick-marvels.git
cd t1c1-maverick-marvels

cp .env.example .env
# Edit .env and paste your GEMINI_API_KEY from https://aistudio.google.com/
```

### Step 2: Run the Backend
```bash
python -m venv .venv
.\.venv\Scripts\activate   # On Windows
# source .venv/bin/activate # On Linux/macOS

pip install -e .
pytest backend/tests -v
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

### Step 3: Run the Frontend
```bash
cd frontend
npm install
npm run dev
```
Open **http://localhost:3000** in your browser.

---

## Project Routes
- `/dashboard` — Social Audit Resource Person (SARP) Overview with stat tiles, charts, ruled ledger table, and live Gemma 4 call log.
- `/audit/new` — Document capture, client-side EXIF stripping, and field-by-field human verification gate with calibrated badges.
- `/reconcile/borgaon` — Collective muster-roll reconciler with attendance matrix, findings sorted by rupee impact, and printable Gram Sabha sheet.
- `/audit/w1` — Comprehensive legal evidence dossier, worked arithmetic breakdown, Section 63 BSA evidence packet, and audio read-aloud.
- `/settings` — Runtime Gemma provider toggle (`[GEMINI API]` ↔ `[LOCAL OLLAMA]`) and model allowlist status.
- `/demo/reader` — Physical ESP32 reader TFT simulation and Android Web NFC tap test.
