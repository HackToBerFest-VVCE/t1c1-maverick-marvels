# SAAKSHI — Project Context

> Read this file completely before writing any code. Every phase prompt assumes it.

---

## 1. What we are building, in ten lines

1. On 1 July 2026 a new law, VB-G RAM G, replaced MGNREGA as India's rural jobs guarantee.
2. It promises 125 days of work a year, ₹300 a day, and wages paid within a fortnight.
3. When wages arrive late, the worker is owed 0.05% of the unpaid amount for every extra day.
4. But all a worker holds is paper — a job card, a passbook, the board at the worksite.
5. The government's version sits in an online database, and the two often disagree.
6. Checking one against the other needs literacy, data, and about an hour of someone's time.
7. So unpaid wages and missing workdays sit undiscovered until an audit six months later.
8. Saakshi lets a worker photograph their papers alongside the official muster roll.
9. Gemma 4, through the Gemini API, reads those photos into structured, checkable data.
10. The worker confirms each field, tested code does the maths, and out comes the rupees owed, the clause that proves it, and a grievance ready to file.

---

## 2. The one rule that governs the whole architecture

**The AI reads. The code computes. The human decides.**

Gemma 4 is good at reading a smudged handwritten job card in Marathi. It is not
something we trust with somebody's wages. Therefore:

- Gemma 4 turns **images into structured data** and **structured data into prose**.
- Every rupee figure, every date difference, every legal threshold is computed by
  unit-tested Python in `backend/audit/engine.py`.
- Nothing is computed from a field the user has not visually confirmed.

If you are ever about to let the model add, subtract, multiply or compare numbers,
stop — that belongs in the engine.

---

## 3. Hackathon constraints (these are hard requirements, not preferences)

From the challenge brief, Track 1 — Challenge A: Best Use of Google Gemma 4:

| Requirement | How we satisfy it |
|---|---|
| Gemma 4 genuinely integrated, not just mentioned | Three real call sites in `backend/gemma/client.py` |
| Model clearly identified in the README | A "Model" section at the very top, naming both model IDs |
| Integration demonstrable in code or working demo | A live trace panel in the dashboard showing model ID, latency, tokens |
| API key never in the public repo | `.env` git-ignored, `.env.example` committed, key read from environment |

**Models we are allowed to call. Nothing else.**

```
gemma-4-26b-a4b-it     # vision: reads document photos into structured data
gemma-4-31b-it         # text: audit orchestration and document drafting
```

Both are **free of charge** on the Gemini API ($0 input, $0 output). There is no
paid tier for Gemma. A billing-linked key does not change the cost, and may raise
rate limits. Enforce the allowlist in code so a fallback can never silently call a
metered Gemini model.

---

## 4. Known API caveats — design around these, do not assume

Gemma 3 on the Gemini API returned HTTP 400 for several features that normally
work with Gemini models. Google's guidance at the time was to work around them,
not that they had been enabled. Gemma 4 may or may not have fixed this.

| Feature | Gemma 3 status | What we do |
|---|---|---|
| `system_instruction` | `Developer instruction is not enabled` | Fold the system prompt into the **first user turn** |
| JSON mode / `response_schema` | `Json mode is not enabled` | Ask for JSON in the prompt; validate with Pydantic in code |
| Function calling | `Function calling is not enabled` | Run the tool loop **in our own code**, not API-side |
| Image input | Shipped later than announced | Verify with the probe before relying on it |

**Phase 1 exists to settle this empirically.** Run the probe against the real key,
write the result to `reference/PROBE-RESULT.md`, and build against what the probe
found — never against what the docs imply. Every later phase reads that file.

---

## 5. System shape

```
Layer 1  Client            Next.js PWA, mobile-first, works on low-end Android
Layer 2  Backend API       FastAPI on Cloud Run, holds the API key
Layer 3  Model layer       Gemma 4 via Gemini API (google-genai SDK)
Layer 4  Rules & knowledge Deterministic engine + clause store (sqlite-vec)
Layer 5  Storage           SQLite (dev) / Postgres (prod), feedback loop
         Hardware (opt.)   ESP32 + RC522 reader, NTAG213 cards, TFT readout
```

End-to-end flow:

```
Capture photos
  → preprocess on device (deskew, resize, strip EXIF, mask IDs)
  → GEMMA 4 26B  : image → structured JSON
  → human confirms every field
  → deterministic engine computes wages, gaps, delay compensation
  → clause store attaches the legal citation
  → GEMMA 4 31B  : drafts grievance + records request in the worker's language
  → worker files it
```

---

## 6. The maths, stated once, authoritatively

These live in `backend/audit/engine.py` and nowhere else.

```
wage_due            = days_worked × notified_daily_rate      # rate floor ₹300
unpaid_wages        = wage_due − amount_credited
delay_days          = max(0, days_since_muster_close − 16)
delay_compensation  = unpaid_wages × 0.0005 × delay_days
entitlement_balance = 125 − household_days_used_this_year
```

Every one of these gets a unit test with a hand-computed expected value.
`delay_compensation` is rounded to 2 decimal places, half-up, at the end only.

---

## 7. Repository layout

```
saakshi/
├── AGENTS.md                  # always-on agent rules (do not delete)
├── CONTEXT.md                 # this file
├── .env.example               # committed
├── .env                       # GIT-IGNORED, holds GEMINI_API_KEY
├── .gitignore
├── backend/
│   ├── main.py                # FastAPI app
│   ├── gemma/
│   │   ├── client.py          # THE Gemma integration — single entry point
│   │   ├── prompts.py         # per-document-type instructions
│   │   ├── schemas.py         # Pydantic models for extracted documents
│   │   └── trace.py           # records every call for the demo panel
│   ├── audit/
│   │   ├── engine.py          # deterministic maths, no model calls allowed
│   │   └── tools.py           # typed tools the orchestrator may call
│   ├── clauses/
│   │   ├── store.py           # sqlite-vec retrieval
│   │   └── data/clauses.json  # ~40 curated VB-G RAM G snippets
│   └── tests/
├── frontend/                  # Next.js PWA
├── firmware/                  # ESP32 + RC522 reader
├── design/                    # tokens.css, dashboard.css, charts.css
├── scripts/validate_palette.js
└── reference/
    ├── PROBE-RESULT.md        # written by Phase 1
    └── gemma-api-notes.md
```

---

## 8. Data policy — non-negotiable

- **The hackathon build uses synthetic documents only.** Never commit, upload or
  test against a real worker's job card, passbook or Aadhaar number.
- Generate the test set with `scripts/make_synthetic_docs.py`, with errors
  deliberately seeded so detection recall is measurable.
- Mask job card and Aadhaar numbers in all logs, all UI, all screenshots.
- Strip EXIF and GPS client-side, before upload.
- Raw images are not retained by default.

---

## 9. Definition of done for the hackathon

- [ ] `reference/PROBE-RESULT.md` exists and records real API behaviour
- [ ] A document photo goes in and validated structured data comes out
- [ ] Every extracted field is confirmable in the UI before any computation
- [ ] `pytest backend/tests` passes, including hand-computed maths cases
- [ ] The dashboard renders, in light and dark, on a 360px-wide screen
- [ ] The trace panel shows model ID, latency and token count for each call
- [ ] README names both model IDs in its first section
- [ ] `git log -p | grep -i "AIza"` returns nothing
- [ ] Accuracy table published in the README from the 30-document test set
- [ ] A recorded backup demo video exists, in case the network or quota fails
