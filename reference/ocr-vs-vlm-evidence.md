# Why a vision model and not Tesseract — the evidence

Reference material for the README and the deck. Weak sources are flagged as
weak; cite the strong ones.

---

## 1. The cost premise is false

Google's Gemini Developer API pricing page lists Gemma 4 input, output and
context caching as **"Free of charge"** on the free tier, with the paid tier
**"Not available"**. Two independent October 2026 guides confirm it and name the
exact model IDs in use here.

Three caveats worth knowing before a judge raises them:

- Free-tier rate limits are no longer printed in the docs; the per-project
  figure in AI Studio is the only reliable one.
- One secondary source notes free-tier prompts may be used to improve Google's
  products — which is a real consideration for worker data, and part of why the
  self-host path matters.
- Google Cloud's managed endpoint charges $0.15 per million input tokens for
  Gemma 4 26B if an SLA is ever needed.

Apache 2.0 weights mean the same model runs locally at zero marginal cost.

---

## 2. Classical OCR on handwriting

**English, IAM benchmark** — identical lines, published comparison:

| Engine | CER | WER | Lines exact |
|---|---|---|---|
| Tesseract 5 | 49.58% | 91.1% | 0% |
| TrOCR-large (specialist) | 3.68% | — | — |
| Gemini 3 Flash | 1.42% | — | — |

*okraPDF "Handwriting OCR benchmark". Vendor source — but the direction matches
peer-reviewed work putting GPT-4o-mini at 1.71% CER on IAM (arXiv 2503.15195).*
The okraPDF conclusion: "handwriting destroys traditional OCR."

**Devanagari, purpose-trained models** — IIIT-HW-Dev, 95,381 handwritten words
from 12 writers:

| Setup | WER | CER |
|---|---|---|
| CNN-RNN from scratch | 45.72% | 17.56% |
| Best, no lexicon (DAS 2018) | 26.22% | 8.64% |
| Improved (ICFHR 2018) | 19.52% | 6.41% |

IIIT-HW-Telugu, 118,515 words: best without lexicon **23.98% WER, 4.58% CER**.

Read those carefully: these are *pre-cropped single words*, from a dozen
writers, using models trained specifically for that script. Roughly one word in
five is still wrong.

**At page level it gets worse.** IIT Bombay's PLATTER framework (arXiv
2502.06172) ran six Indic-trained recognisers on full handwritten pages:

- Best overall word recognition rate: **43.67%** (against 79.04% on isolated words)
- Tesseract as a word *detector*: F1 **73.93** at IoU 0.5, **4.45** at IoU 0.75
- A fine-tuned detector: 99.70

Tesseract cannot reliably find where the words are, before recognition even
begins.

**Off-the-shelf engines on handwritten Devanagari** — 20 handwritten Sanskrit
images: Tesseract mean CER 0.855, EasyOCR 0.468, Google Vision 0.146.
**PaddleOCR recognised no Devanagari characters on any image.**
*Weak source: tiny sample, minor journal. Use only as colour.*

**An honest gap:** no peer-reviewed benchmark of off-the-shelf Tesseract,
EasyOCR, PaddleOCR or TrOCR recognition on standard handwritten Indic datasets
appears to exist. Present that as a gap, not as proof. The reason is itself the
point — nobody benchmarks Tesseract on handwritten Indic text because it was
never built for it.

---

## 3. Even printed Indic text breaks on real photos — and the errors are numerals

"Can OCR-VLMs Read Devanagari?" (arXiv 2606.29213, June 2026) tested ten systems:

- **On clean synthetic renders**, all ten scored chrF++ 91–98. Synthetic tests
  hide every difference that matters.
- **On 300 real printed scans**, classical EasyOCR fell from 93.6 to **58.3**,
  median CER ~2% → **17%**. Gemini 2.5 Flash held at 86.3, median CER 0.0.
  Open-weight Qwen3-VL-8B scored 75.2.
- **The error types differ in kind.** EasyOCR's errors were dominated by
  **numerals (69 of 197)** and punctuation. The VLMs' errors fell on conjuncts
  and matras.
- Specialised small OCR-VLMs collapsed too: DeepSeek-OCR scored chrF++ **10.4**,
  with 89% of samples catastrophic.

**The numeral finding is the single most useful fact in this document.** A wage
audit is entirely numerals. Classical OCR fails precisely where Saakshi cannot
tolerate failure.

On IndicVisionBench-OCR, Gemini 2.5's CER exceeded 1 on 0% of samples; GPT-4o's
did on 13.12%. Model choice matters enormously in Indic scripts — it is not
"any VLM will do".

---

## 4. Gemma 4's own document numbers

OmniDocBench 1.5 average edit distance, lower is better *(Gemma 4 model card)*:

| Model | Edit distance |
|---|---|
| Gemma 4 31B | 0.131 |
| **Gemma 4 26B A4B** (ours) | **0.149** |
| Gemma 3 27B | 0.365 |

A 2.4× error reduction in one generation. The card explicitly lists "OCR
(including multilingual), handwriting recognition" among its image capabilities.
The 26B A4B activates only ~3.8B parameters per token with a ~550M-parameter
vision encoder — which is why it is fast enough for interactive use and small
enough to self-host.

---

## 5. The categorical argument

This is the part that actually wins the exchange.

OCR returns a bag of characters with coordinates. Saakshi must determine which
number on a previously unseen page is *days worked*, which is the *muster roll
number*, and which is the *amount credited* — then cross-check them, and decline
when a field is illegible.

Template matching and regex require a fixed layout. Panchayat registers,
passbooks from different banks, and hand-ruled worksite boards have no fixed
layout. Every new format needs a new template, written by someone who has seen
that format.

Industry analyses of production document pipelines reach the same conclusion:
most OCR errors on real documents are **layout** errors — a table cell returned
under the wrong header — not character errors. One analysis puts it as VLM
extraction measuring "the model's ability to find fields and place them into a
schema, which is half of the value on real document workloads."

**The line:**

> "Tesseract answers 'what characters are here?' We need to answer 'which of
> these numbers is the wage, and does it match the government's record?' That's
> reasoning over layout, script and meaning. OCR doesn't attempt it."

---

## 6. The counter-arguments, stated at full strength

Pre-empt these. A judge who raises one you have already addressed is a judge you
have won.

**"Classical OCR fails visibly; LLMs fail confidently."**
The best objection. Tesseract produces obvious garbage; a VLM can "complete" an
obscured number with plausible invented digits, and its self-reported confidence
is itself generated by the model. *Answer:* the human gate, no LLM arithmetic,
plus the measured calibration and independent arithmetic validators from
Phase 14.

**Speed, cost at scale, offline, determinism.**
Tesseract runs on CPU, returns word positions in hOCR/ALTO, and is
deterministic. For clean printed text on fixed forms at volume it is the right
tool. *Concede it plainly:* "If every panchayat used the same printed form, we'd
use Tesseract. They don't."

**Small specialised OCR models beat general VLMs on some benchmarks.**
PaddleOCR-VL (0.9B) leads OmniDocBench v1.6 at 96.34%. *Answer:* those
benchmarks are overwhelmingly English and Chinese; specialised OCR-VLMs
collapsed on real Devanagari (DeepSeek-OCR at 10.4); and their output is
markdown, not schema-bound semantic fields.

**VLMs are not universally better.**
On document rotation detection, classical docTR and TrOCR beat GPT-4o and Gemini
2.5 Flash. Gemma 4 E2B failed on 29.6% of Chinese documents in one faithfulness
study. *Implication:* do not claim the small on-device Gemma models are reliable
for Indic text without testing them yourself.

---

## 7. What actually settles it

Run Tesseract (`hin+mar+tam+eng`) with honest OpenCV preprocessing and your own
field regexes over your own 30 documents, score it with the same scorer, and put
the two columns side by side.

One to two hours. It beats every citation on this page, because it is *your*
data and nobody can argue with it.
