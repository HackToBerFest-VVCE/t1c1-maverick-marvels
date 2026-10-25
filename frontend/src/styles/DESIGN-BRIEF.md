# Saakshi — Design Brief

Read this before writing any UI. It explains *why* the tokens are what they are,
so you extend them instead of fighting them.

---

## The concept: "the official ledger"

Saakshi reads paper registers and produces evidence a Gram Sabha will act on. So
the interface is built like a well-made government register, not like a SaaS
analytics product:

- **Warm paper surfaces** (`#faf9f6`), not cold white. A register is paper.
- **Hairline rules carry the structure.** Drop shadows are nearly absent. Panels
  are separated by 1px rules and whitespace, which is how printed forms work.
- **Tabular figures everywhere.** Every number in this product is money, days or
  a count, and all three are read in columns.
- **Small radii.** 3–5px. A register has corners, not pills. Pills are reserved
  for status chips alone.
- **One reserved accent.** Amber appears *only* where a human must act — a
  flagged field, an unpaid amount, a pending grievance. Its scarcity is what
  makes it legible as a call to action. Using it for a heading destroys it.
- **The tricolour appears once**, as a 3px rule beneath the masthead. Authority
  in a government product comes from typography and accuracy, not from flag
  graphics. One restrained reference reads as official; a tricolour gradient
  behind a hero section reads as a template.

The test: a block officer should believe this is a system of record, and a
designer should find nothing generic in it.

---

## What we took from each reference system

Four systems were compared. None was adopted wholesale.

**UX4G (ux4g.gov.in) — India's official government design system.**
This is the authoritative Indian reference and the one to cite if asked. It ships
50+ components, a Figma kit, CDN/npm installs for HTML, React, Angular and
Flutter, and targets GIGW 3.0 and WCAG. Its default theme colour is `#4a2bc2`.
*Taken:* the accessibility floor (GIGW 3.0 / WCAG), the text-size control, the
skip-to-content link, the dark mode expectation, multilingual support as a
baseline rather than a feature, and the grievance-escalation pattern — which maps
almost exactly onto our Programme Officer → Gram Sabha path.
*Not taken:* the violet theme. It reads as consumer-service, and our product is
an audit instrument. We keep UX4G's *structure* and substitute our own palette,
which is what its own theming plugin is for.

**GOV.UK Design System.**
*Taken:* the discipline. Plain language, one question per screen on the capture
flow, generous line length, visible focus states, and an almost complete absence
of decoration. GOV.UK's lesson is that trust comes from legibility.
*Not taken:* its typographic scale, which is tuned for long-form guidance, not
for dense tabular data.

**U.S. Web Design System.**
*Taken:* the token architecture — roles rather than raw hex — and the status
colour pattern where an icon and a label always accompany the colour.

**Typical SaaS analytics dashboards (the thing to avoid).**
What they do that we deliberately do not: gradient hero panels, purple-on-dark
everything, a card with a drop shadow for every element, a sparkline inside every
stat tile, dual-axis charts, donut charts for part-to-whole, colour as the only
encoding, and a number formatted as "₹1.8K" when the exact figure is the point.
In this product the exact figure is *always* the point — it is the amount a
worker is owed, and it has to survive being read aloud at a village meeting.

---

## Colour: computed, not chosen

The categorical series palette was **validated with a script, not by eye.** Run
it yourself after any change:

```bash
node scripts/validate_palette.js \
  "#2a78d6,#eb6834,#1baf7a,#eda100,#e87ba4,#008300,#6250d6,#e34948" \
  --mode light --surface "#faf9f6"
```

Current results, both modes:

| Check | Light (`#faf9f6`) | Dark (`#15171a`) |
|---|---|---|
| Lightness band | PASS | PASS |
| Chroma floor | PASS | PASS |
| CVD separation | PASS — worst adjacent ΔE 9.1 (protan) | PASS — ΔE 8.4 (protan) |
| Normal-vision floor | PASS — worst adjacent ΔE 19.6 | PASS — ΔE 19.3 |
| Contrast vs surface | **WARN** — aqua 2.67, yellow 2.06, magenta 2.56 | PASS — all ≥ 3:1 |

That WARN is not dismissable. It triggers the **relief rule**: wherever series 3,
4 or 5 appear on the paper surface, the chart ships a visible direct label or the
table view. Our charts do both anyway, so the rule costs us nothing — but if you
add a chart, you owe it that relief.

Three further constraints that follow from the validation:

- **Do not reorder the slots.** The order *is* the colourblind-safety mechanism.
  Candidate orderings were enumerated and only passing ones kept.
- **Scatter, bubble, choropleth and small multiples cap at three series.** Those
  forms compare all pairs, not just adjacent ones, and the full eight cannot
  clear the floors that way. Past three, fold to "Other" or facet.
- **Dark mode is selected, not flipped.** Each dark value is the same hue
  re-stepped for the dark surface and re-validated as a set.

---

## Typography

Stack: `Inter`, then `Noto Sans` / `Noto Sans Devanagari` / `Noto Sans Tamil`,
then system sans.

Devanagari and Tamil are in the stack *first*, not as a fallback, because a
worker reads this in their own script or not at all. Noto Sans and Inter share
metrics closely enough that a Hindi label and an English label in the same table
row sit on the same baseline at the same optical weight — which matters, because
our tables mix scripts constantly.

The scale is deliberately tight (13px table body, 15px copy). Government data is
dense, oversized type is the enemy of density, and density is the point. The only
large type in the product is the figure on a stat tile and the single hero number
on a report.

---

## Layout rules

- **Filters in one row, above the content.** Never in a side drawer, never down
  the right edge.
- **Amounts, days and counts right-aligned. Names and places left-aligned.**
  Always, in every table, with no exceptions — a column of figures that does not
  align cannot be scanned.
- **At most one `data-attention="true"` element per screen.** Two attention
  states cancel each other out.
- **360px wide is the real target.** The field user is on a low-end Android phone
  in sunlight. Build that width first and widen up; do not design at 1440 and
  squeeze down.

---

## Accessibility floor — these are gates, not aspirations

- WCAG 2.2 AA contrast on all text. Body ink on paper measures well past it.
- Every status is **icon + label + colour**, never colour alone.
- Every chart has a reachable table view.
- Visible focus rings. Never `outline: none` without a replacement.
- `prefers-reduced-motion` honoured; the skeleton shimmer is the only animation
  of consequence and it stops.
- `forced-colors` mode keeps panel structure via explicit borders.
- A text-size control and a skip-to-content link, per GIGW 3.0.
- Keyboard-reachable verify flow. Confirming extracted fields is the legally
  meaningful act in this product; it cannot require a mouse.

---

## What would make this look generic — a checklist to fail

If any of these appear, the design has drifted. Fix it.

- [ ] A purple or indigo gradient anywhere
- [ ] A drop shadow on a card that already has a border
- [ ] A donut chart
- [ ] A dual-axis chart
- [ ] A sparkline inside a stat tile that already shows a delta
- [ ] An amount abbreviated to "1.8K"
- [ ] A status shown by colour with no icon and no label
- [ ] An emoji used as an interface icon
- [ ] A series colour used as text colour
- [ ] More than one amber element on a screen
- [ ] A chart with no legend and more than one series
