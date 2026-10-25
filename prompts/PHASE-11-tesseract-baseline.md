# Phase 11 — The Tesseract baseline

**Goal:** turn "why not just use OpenCV and Tesseract?" from your riskiest
question into your strongest slide.

You cannot win this argument with citations alone. A judge wants to see it on
*your* documents. One to two hours of work produces a number nobody can argue
with.

---

## Prompt

```
Build a classical-OCR baseline and measure it against Gemma 4 on the same data.

scripts/baseline_tesseract.py — the honest, best-effort classical pipeline:

1. Preprocessing with OpenCV, done properly. This must be a genuine attempt,
   not a strawman — a weak baseline is worse than none, because a judge will
   spot it and conclude we rigged the comparison:
   - greyscale, denoise, deskew by minimum-area rectangle
   - adaptive thresholding (try both Otsu and adaptive Gaussian, keep better)
   - optional perspective correction via contour detection

2. Tesseract with the right language packs: hin+mar+tam+eng, PSM 6 and PSM 4,
   keep the better result per document. Report which PSM won.

3. Field extraction from the OCR text — the part that actually matters.
   Use regex and keyword-proximity heuristics to pull the same fields our
   Pydantic schemas define: job card number, worker name, days worked, muster
   roll number, amount credited, credit date.
   Write this as well as you reasonably can in an hour. Document in the file
   what you tried and where it broke.

4. Score it with the SAME scorer and ground truth as scripts/evaluate.py.
   Identical match rules. No special pleading either way.

Also run, as a second baseline row, EasyOCR with the same field extraction, so
we can say we tried more than one classical engine.

Write reference/BASELINE-COMPARISON.md:

| Pipeline | Printed fields | Handwritten fields | Overall | Discrepancies found |
|---|---|---|---|---|
| Tesseract + OpenCV + regex | | | | |
| EasyOCR + regex | | | | |
| Gemma 4 26B A4B | | | | |

With n beside every figure and a 95% Wilson interval.

Then add a FAILURE GALLERY — this is the part that persuades. Pick the 3 most
instructive cases where Tesseract failed and Gemma succeeded. For each, save:
- the source crop
- Tesseract's raw output
- Gemma's structured output
- one line on what class of failure it was

Prioritise these failure classes if they appear in the data:
- a numeral misread (most damaging — the audit is entirely numerals)
- a field found but assigned to the wrong label (layout failure, the most
  common real-world OCR error)
- a field Gemma correctly marked illegible and declined, where Tesseract
  emitted confident garbage

Put the gallery in the README and the pitch deck.

IMPORTANT: report whatever you measure. If Tesseract does better than expected
on printed fields, say so — that is a credible, honest result and it makes the
handwriting gap more convincing, not less.
```

---

## The framing that wins, once you have the number

The strongest point is not that Tesseract is less accurate. It is that **this is
not an OCR task at all.**

> "Tesseract answers 'what characters are here?' We need to answer 'which of
> these numbers is the wage, and does it match the government's record?' That is
> reasoning over layout, script and meaning. OCR doesn't attempt it."

Template matching cannot rescue it, because every panchayat's register, every
bank's passbook, and every hand-ruled worksite board has a different layout.
A template-based system needs a new template per format. A VLM reads a layout it
has never seen.

Industry analyses of real document pipelines make the same point: most OCR
errors on real documents are **layout** errors — a table cell returned under the
wrong header — not character errors. Your failure gallery should include one.

## Done when

- [ ] `BASELINE-COMPARISON.md` has measured rows for both classical engines
- [ ] The preprocessing is a genuine best effort, documented
- [ ] The failure gallery has 3 cases with images, ideally including a numeral
      misread and a wrong-label assignment
- [ ] The comparison is in the README and on a slide
