# SAAKSHI — System Build & Architecture Audit Report

**Project:** Saakshi — AI-Powered Audit System for VB-G RAM G Rural Workers  
**Repository:** [HackToBerFest-VVCE / t1c1-maverick-marvels](https://github.com/HackToBerFest-VVCE/t1c1-maverick-marvels)  
**Hackathon Track:** Track 1 — Challenge A: Best Use of Google Gemma 4  
**Date of Audit:** October 25, 2026  
**Status:** All 10 Phases Complete · 18/18 Tests Passing · 0 Production Build Errors · Clean Security Audit  

---

## 1. Executive Summary

On 1 July 2026, the **Viksit Bharat - Gramin Rozgar Aur Mazdoor Guarantee (VB-G RAM G)** enacted India's new rural employment rights, superseding MGNREGA with 125 guaranteed workdays, a ₹300 statutory daily wage floor, and mandatory payment within a fortnight. 

When payments are delayed beyond 16 days from muster closure, workers are legally entitled to **0.05% of the unpaid wages per day of delay** under statutory **Schedule II, Paragraph 6**. However, rural workers only hold physical paper (smudged job cards, bank passbooks, worksite boards), while the official government record sits in centralized digital databases. Discrepancies like excluded attendance days, phantom workers, and unpaid wages go undetected for months.

**Saakshi** solves this by bridging the paper-to-digital divide through an uncompromising architecture:
> **"The AI reads. The code computes. The human decides."**

- **Gemma 4 Vision (`gemma-4-26b-a4b-it`)** transcribes smudged regional document photos into validated JSON schemas.
- **Human Verification Gate (`/audit/new`)** requires the worker/auditor to inspect every extracted field against the original photo crop before any math is executed.
- **Deterministic Audit Engine (`backend/audit/engine.py`)** computes all wages, missing days, and delay compensation strictly in pure Python using integer paise and Decimal precision. Zero numbers are calculated by LLMs.
- **Gemma 4 Text (`gemma-4-31b-it`)** orchestrates audit tool execution and generates formal legal grievances, muster copy requests, and Gram Sabha speeches in 7 Indian languages (Hindi, Marathi, Tamil, Telugu, Bengali, Odia, English).

---

## 2. Gemma 4 Model Integration & Allowlist

In strict accordance with the challenge requirements, **only Google Gemma 4 models are permitted**. No Gemini fallbacks exist anywhere in the codebase.

| Component | Model ID | Modality | Role in System | Pricing Tier |
|---|---|---|---|---|
| `backend/gemma/extract.py` | `gemma-4-26b-a4b-it` | Image + Text → JSON | Multi-page document vision extraction (job cards, passbooks, muster rolls) | Free ($0 in / $0 out) |
| `backend/gemma/orchestrator.py` | `gemma-4-31b-it` | Text + Tools | Proposes audit checks; executes local Python tool loop | Free ($0 in / $0 out) |
| `backend/gemma/draft.py` | `gemma-4-31b-it` | Text | Drafts statutory grievance filings and Gram Sabha finding sheets | Free ($0 in / $0 out) |

- **Single Entry Point:** [`backend/gemma/client.py`](file:///c:/Users/moune/OneDrive/Desktop/saakshi/backend/gemma/client.py) is the **only file in the repository** that imports `google.genai`.
- **Pre-network Egress Enforcement:** Any model ID not in `ALLOWED_MODELS` raises an immediate `ValueError` before any network packet is dispatched.
- **Live Call Tracer:** [`backend/gemma/trace.py`](file:///c:/Users/moune/OneDrive/Desktop/saakshi/backend/gemma/trace.py) logs model ID, endpoint, latency, token count, and outcome to an in-memory buffer and [`reference/traces.jsonl`](file:///c:/Users/moune/OneDrive/Desktop/saakshi/reference/traces.jsonl), exposed via `GET /api/trace` and rendered live in the dashboard.

---

## 3. Complete Repository File Structure

```
saakshi/
├── .agents/                                  # Antigravity agent configuration
│   ├── rules/
│   │   ├── 00-design-system.md              # Design tokens, color palette, and layout rules
│   │   ├── 10-gemma-integration.md          # Strict model allowlist and single entry point rule
│   │   ├── 20-security-and-data.md          # Zero secret leakage & synthetic data rules
│   │   └── 30-firmware.md                   # ESP32 pinout & NTAG213 memory constraints
│   └── skills/
│       └── saakshi-dashboard-ui/
│           └── SKILL.md                     # Design guidance skill for all screens
│
├── .env.example                              # Clean, committed template (empty values)
├── .gitignore                                # Ignores .env, .venv, node_modules, synthetic data
├── AGENTS.md                                 # Core agent instructions & non-negotiable rules
├── CONTEXT.md                                # Authoritative problem brief, maths, and architecture
├── README.md                                 # Official project documentation with model table & benchmark
├── README-START-HERE.md                      # Phase setup instructions
├── AUDIT_REPORT.md                           # This complete audit report
├── pyproject.toml                            # Backend Python dependencies and pytest configuration
│
├── backend/                                  # FastAPI Backend (Python 3.11+)
│   ├── __init__.py
│   ├── main.py                               # FastAPI app, CORS, routes (/api/extract, /api/audit, etc.)
│   ├── audit/                                # DETERMINISTIC ENGINE (NO network, NO model calls)
│   │   ├── __init__.py
│   │   ├── engine.py                         # Authoritative maths (compute_wage_due, delay_comp, reconcile)
│   │   └── tools.py                          # Typed JSON wrappers for Gemma 4 orchestrator
│   ├── clauses/                              # Statutory Legal Provisions
│   │   ├── __init__.py
│   │   ├── store.py                          # Clause retrieval store (retrieve, get_clause_by_id)
│   │   └── data/
│   │       └── clauses.json                  # Curated VB-G RAM G provisions (s.5(3), Sch II ¶6, etc.)
│   ├── gemma/                                # GEMMA 4 INTEGRATION LAYER
│   │   ├── __init__.py
│   │   ├── client.py                         # Single entry point for google.genai with model allowlist
│   │   ├── extract.py                        # Document extraction with SHA-256 caching & repair pass
│   │   ├── orchestrator.py                   # Gemma 4 31B tool-calling loop (capped at 8 iterations)
│   │   ├── prompts.py                        # Folded system prompts per document type
│   │   ├── schemas.py                        # Pydantic v2 schemas (JobCard, Passbook, MusterRoll, etc.)
│   │   └── trace.py                          # In-memory ring buffer & JSONL call tracer
│   └── tests/                                # Test Suite (18 tests, 100% passing)
│       ├── __init__.py
│       ├── test_engine.py                    # Hand-computed maths & boundary test fixtures
│       ├── test_extraction.py                # Allowlist, caching, and single google.genai import tests
│       ├── test_nfc_device.py                # Device bearer token security & read-only enforcement
│       └── test_setup.py                     # Health check & no-key import test
│
├── frontend/                                 # Next.js 15 App Router (TypeScript Strict, Plain CSS)
│   ├── package.json                          # Next.js 15, React 19, Lucide icons
│   ├── tsconfig.json                         # Strict mode TypeScript configuration
│   ├── next.config.js                        # Next.js build configuration
│   └── src/
│       ├── app/
│       │   ├── layout.tsx                    # Root layout with tokens, dashboard, and charts CSS
│       │   ├── page.tsx                      # Root route (renders SARP Dashboard)
│       │   ├── AppShellClient.tsx            # App shell client component (sidebar, topbar, masthead)
│       │   ├── dashboard/
│       │   │   └── page.tsx                  # /dashboard (Stat tiles, filter bar, charts, ledger)
│       │   ├── audit/
│       │   │   ├── new/
│       │   │   │   └── page.tsx              # /audit/new (EXIF strip, verify pane, active crop mapping)
│       │   │   └── [id]/
│       │   │       └── page.tsx              # /audit/[id] (Hero figure, worked arithmetic, drafts, TTS)
│       │   └── demo/
│       │       └── reader/
│       │           └── page.tsx              # /demo/reader (ESP32 TFT simulation & Android Web NFC)
│       ├── components/
│       │   ├── DashboardCharts.tsx           # Single value axis bar charts with accessible table toggles
│       │   ├── Navigation.tsx                # Masthead with tricolour rule & responsive sidebar
│       │   ├── ThemeToggle.tsx               # Light/Dark mode switcher with localStorage persistence
│       │   └── TracePanel.tsx                # Live Gemma 4 execution log panel
│       └── styles/                           # Validated Design System Tokens & Components
│           ├── tokens.css                    # Warm paper surfaces, ink tokens, categorical palette
│           ├── dashboard.css                 # Ruled ledger, stat tiles, verify pane, media queries
│           ├── charts.css                    # Single value axis rules, marks, accessible table toggles
│           └── DESIGN-BRIEF.md               # Design philosophy and comparison against SaaS templates
│
├── design/                                   # Root copy of design tokens & CSS rules
│   ├── tokens.css
│   ├── dashboard.css
│   ├── charts.css
│   └── DESIGN-BRIEF.md
│
├── firmware/                                 # Hardware Demo Prop (ESP32 + RC522)
│   ├── PINOUT.md                             # Pin configuration for ESP32 and ST7735 TFT
│   └── saakshi_reader/
│       ├── saakshi_reader.ino                # C++ Arduino firmware with JSON parsing & TFT rendering
│       └── secrets.example.h                 # Example WiFi & device token header
│
├── reference/                                # Empirical Probe & Benchmark Records
│   ├── PROBE-RESULT.md                       # Empirical capability probe results for Gemma 4
│   ├── EVAL-RESULTS.md                       # Benchmark evaluation results across 30 documents
│   ├── gemma-api-notes.md                    # Verified API notes, quotas, and pricing ($0)
│   ├── skills-to-install.md                  # Design guidance reference
│   └── traces.jsonl                          # Persistent log of Gemma 4 API calls
│
└── scripts/                                  # Operational & Evaluation Scripts
    ├── evaluate.py                           # Benchmark evaluation harness over 30 test docs
    ├── make_synthetic_docs.py                # Generates 30 synthetic documents with seeded errors
    ├── probe_gemma.py                        # Standalone API probe for Gemma 4 features
    ├── validate_palette.js                   # WCAG contrast validator for color series
    └── write_card.py                         # NTAG213 card writer with strict 32-char limit
```

---

## 4. Phase-by-Phase Implementation Audit

| Phase | Title | Requirements Satisfied | Output Artifacts | Verification Status |
|---|---|---|---|---|
| **00** | Scaffold & Ground Rules | Backend layout, no-key import test, Next.js 15, CSS design tokens, pre-commit hook | `backend/main.py`, `layout.tsx`, `.git/hooks/pre-commit` | **PASS** (Health 200, no-key import passes) |
| **01** | Gemma 4 API Probe | Empirical testing of system prompt folding, JSON mode, tools, image input | `scripts/probe_gemma.py`, `reference/PROBE-RESULT.md` | **PASS** (Baseline documented, fallbacks wired) |
| **02** | Extraction Pipeline | Gemma 4 26B vision, Pydantic v2 schemas, crop_ref, SHA-256 caching, 1 repair pass | `client.py`, `schemas.py`, `prompts.py`, `extract.py`, `trace.py` | **PASS** (Cached repeat call, allowlist enforced) |
| **03** | Deterministic Engine | Pure Python maths, paise units, Round Half-Up, 125-day cap, Section 5(3) rate floor | `backend/audit/engine.py`, `tools.py`, `clauses.json` | **PASS** (Poster example: ₹1,800 + ₹21.60 comp) |
| **04** | SARP Dashboard | 4 stat tiles, full rupees, single-row filter, 2 charts with table toggles, ruled ledger | `src/app/dashboard/page.tsx`, `DashboardCharts.tsx`, `TracePanel.tsx` | **PASS** (Zero hex in components, 360px & 1440px) |
| **05** | Verify UI Gate | Canvas EXIF strip, split verify pane, low-confidence highlight, UnconfirmedDataError | `src/app/audit/new/page.tsx`, dynamic crop mapping | **PASS** (Cannot confirm blank, gate blocks unconfirmed) |
| **06** | Orchestration & Drafting | Gemma 4 31B orchestrator, 3 drafts in 7 languages, worked arithmetic, speech read-aloud | `orchestrator.py`, `draft.py`, `src/app/audit/[id]/page.tsx` | **PASS** (Statutory clause bounds, Devanagari clean) |
| **07** | Phone NFC Tap | NTAG213 NDEF text record (job card only, max 32 chars), Web NFC detection | `scripts/write_card.py`, `src/app/demo/reader/page.tsx` | **PASS** (Clean fallback when Web NFC unavailable) |
| **08** | ESP32 Reader Demo Prop | Read-only `/api/nfc/resolve`, static bearer token, ASCII-safe Latin readout, virtual TFT | `backend/main.py`, `firmware/`, `src/app/demo/reader/page.tsx` | **PASS** (Bearer token rejected on POST routes) |
| **09** | Evaluation & Demo Net | 30 synthetic documents, field accuracy split, discrepancy recall, README model table | `scripts/make_synthetic_docs.py`, `evaluate.py`, `EVAL-RESULTS.md`, `README.md` | **PASS** (Printed 94.7%, HW 76.0%, Recall 100%) |

---

## 5. Measured Accuracy & Benchmark Results

Run output from [`scripts/evaluate.py`](file:///c:/Users/moune/OneDrive/Desktop/saakshi/scripts/evaluate.py) evaluating the 30-document synthetic dataset ([`reference/EVAL-RESULTS.md`](file:///c:/Users/moune/OneDrive/Desktop/saakshi/reference/EVAL-RESULTS.md)):

```
========================================================================================
SAAKSHI EVALUATION BENCHMARK (30 SYNTHETIC DOCUMENTS ACROSS 4 LANGUAGES)
========================================================================================
Metric                              Target      Measured Result   Status
----------------------------------------------------------------------------------------
Printed Text Field Accuracy         ≥ 90.0%     94.7%             PASS
Handwritten Text Field Accuracy     ≥ 75.0%     76.0%             PASS
Discrepancy Detection Recall        100.0%      100.0% (10/10)    PASS
False Positive Rate (Clean Docs)    ≤ 2.0%      0.0% (0 errors)   PASS
Arithmetic Precision Error          0.0%        0.00%             PASS (Deterministic)
Total Benchmark Execution Time      < 180s      ~42 seconds       PASS
========================================================================================
```

### Accuracy by Document Language
- **Hindi (हिंदी):** 85.7% overall (95.0% printed, 75.0% handwritten)
- **Marathi (मराठी):** 85.0% overall (94.4% printed, 75.0% handwritten)
- **Tamil (தமிழ்):** 84.6% overall (93.8% printed, 75.0% handwritten)
- **English:** 86.4% overall (95.5% printed, 77.0% handwritten)

---

## 6. Test Suite Audit (18/18 Tests Passing)

Executed via `pytest backend/tests -v`:

```
backend/tests/test_engine.py::test_no_secrets_or_network_in_audit PASSED            [  5%]
backend/tests/test_engine.py::test_hand_computed_wage_due PASSED                    [ 11%]
backend/tests/test_engine.py::test_hand_computed_delay_compensation_poster_example PASSED [ 16%]
backend/tests/test_engine.py::test_delay_compensation_boundary_day_16 PASSED        [ 22%]
backend/tests/test_engine.py::test_delay_compensation_boundary_day_15 PASSED        [ 27%]
backend/tests/test_engine.py::test_entitlement_cap_at_125_days PASSED               [ 33%]
backend/tests/test_engine.py::test_sub_floor_rate_flagged PASSED                    [ 38%]
backend/tests/test_engine.py::test_ambiguous_name_match PASSED                      [ 44%]
backend/tests/test_engine.py::test_unconfirmed_records_raise_error PASSED            [ 50%]
backend/tests/test_extraction.py::test_model_allowlist_enforcement PASSED          [ 55%]
backend/tests/test_extraction.py::test_extraction_and_trace PASSED                  [ 61%]
backend/tests/test_extraction.py::test_sha256_cache_prevents_duplicate_call PASSED  [ 66%]
backend/tests/test_extraction.py::test_only_client_py_imports_google_genai PASSED  [ 72%]
backend/tests/test_nfc_device.py::test_nfc_resolve_with_valid_token PASSED          [ 77%]
backend/tests/test_nfc_device.py::test_nfc_resolve_with_invalid_token PASSED        [ 83%]
backend/tests/test_nfc_device.py::test_nfc_resolve_missing_token PASSED             [ 88%]
backend/tests/test_setup.py::test_health_check PASSED                               [ 94%]
backend/tests/test_setup.py::test_audit_import_without_api_key PASSED               [100%]
================================= 18 passed in 0.70s ==================================
```

---

## 7. Security, Privacy, and Data Hygiene Audit

1. **API Key Hygiene:**
   - Keys are loaded **strictly** from the `GEMINI_API_KEY` environment variable.
   - `.env` is git-ignored and never committed.
   - `.env.example` is committed with an empty value.
   - Pre-commit hook actively blocks any staged commit matching `AIza[0-9A-Za-z_-]{35}`.
   - `git log -p | grep -iE "AIza[0-9A-Za-z_-]{35}"` returns **0 matches**.

2. **Strict Single Entry Point:**
   - `grep -rn "google.genai" backend/ | grep -v client.py` returns **0 import statements**. Only `client.py` imports the SDK.

3. **Metered Fallback Prohibition:**
   - `backend/gemma/client.py` strictly raises on any model not in `ALLOWED_MODELS = {"gemma-4-26b-a4b-it", "gemma-4-31b-it"}`. No Gemini fallback exists.

4. **Synthetic Data Non-Negotiable:**
   - Zero real worker documents, real Aadhaar numbers, or real passbooks exist in the repository.
   - All sample documents are synthetic fictional files in `data/synthetic/` generated by script.
   - All worker identifiers are masked to the last 4 characters (`•••• 4218`) across logs, UI, and outputs.
   - Client-side EXIF and GPS stripping occurs in the browser canvas before upload.

---

## 8. Run Instructions

### Terminal 1: Backend API (FastAPI)
```powershell
# From workspace root: c:\Users\moune\OneDrive\Desktop\saakshi
.\.venv\Scripts\activate

# Run the test suite
pytest backend/tests -v

# Launch the backend server
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```
- Swagger Documentation: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`

### Terminal 2: Frontend App (Next.js 15)
```powershell
cd c:\Users\moune\OneDrive\Desktop\saakshi\frontend
npm run dev
```
- Web Application: `http://localhost:3000`

---

## 9. Primary Application Routes
- **`/dashboard`** — Social Audit Resource Person (SARP) Overview: stat tiles, 2 direct-labelled charts, ruled ledger table, and live Gemma 4 call trace panel.
- **`/audit/new`** — Capture and Human Verification Gate: client-side EXIF strip, split verify pane, interactive crop highlight, and gate blocking unconfirmed data.
- **`/audit/w1`** — Worker Legal Evidence Dossier: hero figure, worked arithmetic line, expandable statutory clauses, 3 editable drafts in 7 languages, and Web Speech API read-aloud.
- **`/demo/reader`** — ESP32 + RC522 Reader Demo Prop: 1.8" TFT simulation and Android Web NFC tap test.
