# Saakshi Build Kit

Everything needed to build Saakshi with Google Antigravity: agent context, phase
prompts, a validated design system, and the ESP32 reader firmware.

---

## What Saakshi is, in ten lines

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

## Setup

```bash
# 1. Create the repo and copy this kit into it
mkdir saakshi && cd saakshi && git init
cp -r /path/to/saakshi-build-kit/* .
cp -r /path/to/saakshi-build-kit/.agents .

# 2. Your key — never committed
cp .env.example .env
#    then put your key in .env as GEMINI_API_KEY=...

# 3. Open in Antigravity, then verify the rules loaded by asking:
#    "what are your standing rules for this repo?"
#    It must mention the model allowlist and "AI reads, code computes".
#    If it does not, the rules are not being read — fix that before building.
```

---

## Run the phases in order

Paste each prompt into Antigravity. Do not skip ahead; each phase assumes the
previous one's output.

| Phase | File | What it produces |
|---|---|---|
| 0 | `prompts/PHASE-00-setup.md` | Scaffold, rules loaded, key hygiene |
| 1 | `prompts/PHASE-01-gemma-probe.md` | **What the API actually supports** |
| 2 | `prompts/PHASE-02-extraction.md` | Photo → structured data, traced |
| 3 | `prompts/PHASE-03-audit-engine.md` | The maths, with hand-computed tests |
| 4 | `prompts/PHASE-04-dashboard.md` | The dashboard |
| 5 | `prompts/PHASE-05-verify-ui.md` | Capture and human verification |
| 6 | `prompts/PHASE-06-drafting.md` | Orchestration, drafts, the report |
| 7 | `prompts/PHASE-07-nfc-phone.md` | Phone NFC tap *(optional)* |
| 8 | `prompts/PHASE-08-esp32-reader.md` | ESP32 reader *(optional)* |
| 9 | `prompts/PHASE-09-eval-and-demo.md` | **Measurement, README, demo** |

**Phase 1 is not optional and not skippable.** Gemma 3 returned HTTP 400 for
`system_instruction`, JSON mode and function calling. Gemma 4 may have fixed
this; the docs are ambiguous and third-party reports conflict. Ten minutes of
probing beats rewriting the extraction layer at hour 30.

**Phase 9 is where the marks are.** Past winners of these Gemma challenges won
on published accuracy numbers and a clean, inspectable integration — not on
feature count. If you are short on time, cut Phases 7 and 8, never Phase 9.

---

## What's in the kit

```
AGENTS.md                      always-on agent rules (Antigravity reads this)
CONTEXT.md                     the project brief — read first, every time
.agents/rules/                 modular rules: design, Gemma, security, firmware
.agents/skills/                the dashboard UI skill (/saakshi-dashboard-ui)
prompts/                       the ten phase prompts
design/tokens.css              validated design tokens, light + dark
design/dashboard.css           app shell, ledger table, stat tiles, trace panel
design/charts.css              chart chrome and the rules behind it
design/DESIGN-BRIEF.md         why the design is what it is + system comparison
firmware/PINOUT.md             ESP32 pin numbers
firmware/saakshi_reader/       the reader firmware, ready to flash
scripts/validate_palette.js    run this after any palette change
reference/gemma-api-notes.md   verified API facts and the known caveats
reference/skills-to-install.md the six community design skills, with caveats
```

---

## The three rules that govern everything

**1. The AI reads. The code computes. The human decides.**
Gemma 4 turns images into data and data into prose. Every rupee figure comes from
unit-tested Python. Nothing is computed from an unconfirmed field.

**2. Only two models exist in this codebase.**
`gemma-4-26b-a4b-it` and `gemma-4-31b-it`, both free on the Gemini API, enforced
by an allowlist in `backend/gemma/client.py`. No Gemini fallback, ever — that is
how a free project starts getting billed and how a Gemma entry stops being one.

**3. Synthetic documents only.**
Never a real job card, passbook or Aadhaar number, in the repo or its history.

---

## Before you submit

```bash
git log -p | grep -iE "AIza[0-9A-Za-z_-]{35}"      # must be empty
grep -rn "google.genai" backend/ | grep -v client.py  # must be empty
grep -rn "gemini-" backend/ frontend/               # must be empty
```

- [ ] README's first section is the model table naming both IDs
- [ ] `reference/EVAL-RESULTS.md` has real, untuned numbers
- [ ] The trace-panel GIF is in the README
- [ ] A backup demo video exists
- [ ] The dashboard works at 360px, in both themes

---

## One honest note on the hardware

The ESP32 reader and the NFC cards contribute nothing to the criterion you are
scored on, which is the Gemma 4 integration. The cards hold 18 bytes — a job card
number — because an NTAG213 has 144 bytes of user memory and one legible document
photo is 300,000 or more. They are a tangible prop, and a good one, but they are
Phase 7 and 8 for a reason. If Phases 1–6 and 9 are not finished and recorded,
leave the hardware in the box.
