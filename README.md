# Saakshi — AI-Powered Audit System for VB-G RAM G Workers

## Model
This project uses **Google Gemma 4** via the **Gemini API** (`google-genai` SDK).

| Where | Model ID | Modality | What it does |
|---|---|---|---|
| `backend/gemma/extract.py` | `gemma-4-26b-a4b-it` | image + text → JSON | reads document photos (job cards, passbooks, muster rolls) |
| `backend/gemma/orchestrator.py` | `gemma-4-31b-it` | text + tools | proposes which audit checks to run using deterministic tools |
| `backend/gemma/draft.py` | `gemma-4-31b-it` | text | drafts the three statutory grievance & Gram Sabha documents |

Every call goes through `backend/gemma/client.py`, which enforces a strict model allowlist — no other model can be called. No Gemini fallbacks exist anywhere in this codebase.

---

## 1. Problem & Context

On 1 July 2026 a new law, **VB-G RAM G**, replaced MGNREGA as India's rural jobs guarantee:
- It guarantees 125 days of work per year, ₹300 a day minimum, and wages paid within a fortnight.
- When wages arrive late (beyond 16 days of muster close), workers are legally owed **0.05% of the unpaid amount per day of delay** under Schedule II Paragraph 6.
- Workers hold physical paper — smudged job cards, handwritten entries in regional scripts (Marathi, Hindi, Tamil), and bank passbooks.
- The government's version sits on an online database, and the two frequently disagree (e.g. phantom workers, unrecorded workdays, delayed disbursements).
- **Saakshi** bridges this gap: workers photograph their paper documents; Gemma 4 reads them into structured data; workers verify the numbers; deterministic unit-tested Python computes the exact wages and compensation owed; and Gemma 4 drafts statutory grievance filings and Gram Sabha finding sheets ready to read aloud.

---

## 2. The Governing Principle

> **The AI reads. The code computes. The human decides.**

- **AI Reads:** `gemma-4-26b-a4b-it` transcribes smudged print and handwriting into JSON.
- **Human Decides:** The worker/auditor visually verifies every field against the source crop on the `/audit/new` verification screen. Unconfirmed fields cannot be computed.
- **Code Computes:** All arithmetic, date differences, and delay compensation are computed by unit-tested pure Python functions in `backend/audit/engine.py`. Zero arithmetic is delegated to LLMs.
- **AI Drafts:** `gemma-4-31b-it` translates verified figures into formal legal grievances and Gram Sabha spoken scripts in 7 Indian languages.

---

## 3. Measured Benchmark Results

Evaluated over the 30-document synthetic dataset (`scripts/evaluate.py`):

| Metric | Target | Measured Result | Status |
|---|---|---|---|
| **Printed Text Field Accuracy** | ≥ 90.0% | **94.7%** | PASS |
| **Handwritten Text Field Accuracy** | ≥ 75.0% | **76.0%** | PASS |
| **Discrepancy Detection Recall** | 100.0% | **100.0%** (10/10 seeded errors identified) | PASS |
| **False Positive Rate** | ≤ 2.0% | **0.0%** on clean documents | PASS |
| **Arithmetic Computation Error** | 0.0% | **0.0%** (100% deterministic Decimal precision) | PASS |
| **Total Evaluation Runtime** | < 3 min | **~42 seconds** | PASS |

---

## 4. Architecture & Security Hygiene

```
[Mobile / PWA / ESP32 Reader]
       │
       ▼ (Canvas EXIF/GPS Strip + SHA-256 Dedupe)
[FastAPI Backend (port 8000)]
       │
       ├──► backend/gemma/client.py  ──► Google Gemini API (Gemma 4 models only)
       ├──► backend/audit/engine.py  ──► Deterministic Maths (Paise, Decimal)
       ├──► backend/clauses/store.py ──► VB-G RAM G Statutory Provisions
       └──► backend/gemma/trace.py   ──► Live Call Trace Panel (latency, tokens)
```

- **Zero Secrets Committed:** `.env` is git-ignored. Pre-commit hook blocks any commit matching `AIza[0-9A-Za-z_-]{35}`.
- **Synthetic Documents Only:** Fictional documents only. Zero real worker PII in the repo or git history.
- **Offline Integrity:** All audit calculations, verification flows, and tests run with 100% fidelity even when offline.

---

## 5. How to Run the Project

### Prerequisites
- Python 3.11+
- Node.js 18+

### Step 1: Clone and Configure Environment
```bash
# Clone the repository
git clone https://github.com/HackToBerFest-VVCE/t1c1-maverick-marvels.git
cd t1c1-maverick-marvels

# Copy environment variables
cp .env.example .env
# Edit .env and paste your GEMINI_API_KEY from https://aistudio.google.com/
```

### Step 2: Run the Backend
```bash
# Set up virtual environment
python -m venv .venv

# On Windows:
.\.venv\Scripts\activate
# On Linux/macOS:
# source .venv/bin/activate

# Install dependencies
pip install -e .

# Run pytest to verify all 18 unit tests
pytest backend/tests -v

# Start FastAPI server on port 8000
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

## 6. Project Routes
- `/dashboard` — Social Audit Resource Person (SARP) Overview with stat tiles, charts, ruled ledger table, and live Gemma 4 call log.
- `/audit/new` — Document capture, EXIF stripping, and field-by-field human verification gate.
- `/audit/w1` — Comprehensive legal evidence dossier, worked arithmetic breakdown, expandable VB-G RAM G clauses, Web Speech read-aloud, and grievance drafts.
- `/demo/reader` — Physical ESP32 reader TFT simulation and Android Web NFC tap test.
