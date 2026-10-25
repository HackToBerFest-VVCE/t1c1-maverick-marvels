# SAAKSHI — Social Audit Evidence Assembly

**Empowering Rural Workers with Deterministic Verification for VB-G RAM G**
*Repository:* [https://github.com/HackToBerFest-VVCE/t1c1-maverick-marvels.git](https://github.com/HackToBerFest-VVCE/t1c1-maverick-marvels.git)

---

### The Problem
- **₹935 Crore Flagged. 1.34% Recovered.** Social Audit Units flagged ₹935 crore in MGNREGA misappropriation between 2017 and 2021; approximately ₹12.5 crore was recovered (*MoRD Social Audit MIS*).
- **394 Officials Issued Notices (October 2026):** Karnataka’s RDPR Minister ordered show-cause notices across 311 Gram Panchayats for systemic wage delays.
- **The Gap:** The worker holds paper (job cards, passbooks). The state holds an online database. Discrepancies persist because cross-referencing paper registers against database entries manually requires hours per worker and administrative literacy.

---

### The Governing Principle
> **"The AI reads. The code computes. The human decides."**
- **AI Reads:** Multimodal Gemma 4 transcribes smudged paper registers and regional handwriting into structured schemas. It computes nothing.
- **Code Computes:** All arithmetic, statutory wage floors (₹300/day under Section 5(3)), and delay compensation (0.05%/day under Schedule II ¶6) are computed in unit-tested, pure Python (`backend/audit/engine.py`).
- **Human Decides:** No number is computed until a human visually confirms or corrects the field against the cropped source image.

---

### Strict Model Implementation (Zero API Fallbacks)
Enforced in `backend/gemma/client.py` — any other model ID raises an immediate exception:
- **`gemma-4-26b-a4b-it`** — Multimodal document vision: transforms document photos into validated Pydantic structures.
- **`gemma-4-31b-it`** — Multilingual text drafting & tool orchestration: generates Section 63 BSA filings, grievance petitions, and Gram Sabha finding sheets in 7 Indian languages.

---

### Measured Results Against Ground Truth (n=30 Documents, 193 Fields)
| Benchmark Metric | Classical Baseline (Tesseract + OpenCV) | Multimodal Gemma 4 26B | Impact |
|---|---|---|---|
| **Overall Field Accuracy** | 11.4% [7.7% – 16.5%] | **86.0% [80.4% – 90.2%]** | **+74.6%** |
| **Handwritten Indic Text** | 0.0% (0/87 fields) | **96.6% [90.3% – 98.8%]** | **+96.6%** |
| **Printed Text Fields** | 20.8% [14.1% – 29.5%] | **77.4% [68.5% – 84.3%]** | **+56.6%** |
| **Discrepancy Recall** | 0.0% (0/12 flagged) | **66.7% [39.1% – 86.2%]** | **+66.7%** |
| **Calibration Reliability** | Untracked (random strings) | **ECE: 9.18% · Threshold: ≥ 0.85 (97.4% accuracy)** | Calibrated |

---

### Key Capabilities Built & Tested
1. **Muster-Roll Reconciler:** Collective cross-referencing across Gram Panchayat rolls. Identifies unverified names (no paper record found), inflated attendance days, wage withholding, and worksite co-worker mismatch (Jaccard distance). Always displays coverage: *"based on 1 of an estimated 14 muster rolls"*.
2. **Section 63 BSA Tamper-Proof Evidence Packet:** Client-side original camera SHA-256 vs. processed model SHA-256 dual-hashing, complete human confirmation trail, Part A custodian declaration pre-fill, and independent CLI verifier (`scripts/verify_packet.py`).
3. **Dual Deployment Modes:** Hosted Google Gemini API (zero API cost) or 100% air-gapped local deployment (Ollama / `gemma4:26b`) for State Social Audit Units handling sensitive citizen records.

*Contact & Verification:* Tested on Python 3.11+ / Next.js 15. All synthetic test datasets, ground truth annotations, and benchmark logs committed in repo.
