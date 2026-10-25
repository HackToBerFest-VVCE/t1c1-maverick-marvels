---
name: saakshi-dashboard-ui
description: Design rules for every Saakshi screen, chart and component. Load this BEFORE writing any UI, CSS, chart or layout code — including a single component, a chart, or a change to an existing screen.
---

# Saakshi dashboard UI

Load `design/DESIGN-BRIEF.md` alongside this. That file carries the reasoning and
the reference-system comparison; this file is the checklist.

## The concept

**"The official ledger."** Saakshi reads paper registers, so the interface is
built like a well-made government register, not a SaaS analytics product. Warm
paper surfaces, hairline rules instead of drop shadows, tabular figures
everywhere, small radii, and one reserved accent for things a human must act on.

A block officer should believe this is a system of record, and a designer should
find nothing generic in it.

## Non-negotiables

1. **Tokens only.** Import `design/tokens.css` once at the root. Use tokens by
   role. A raw hex in a component file is a bug. Need something new? Add it to
   `tokens.css` with a comment.
2. **The series palette is validated, not chosen.** Do not add, reorder or
   brighten a series colour. Re-run
   `node scripts/validate_palette.js "<hexes>" --mode light --surface "#faf9f6"`
   and keep only an order that passes every gate in both modes.
3. **Series 3, 4 and 5 are sub-3:1 on paper.** Wherever they appear, ship a
   visible direct label or the table view. This is the relief rule and it is not
   dismissable.
4. **The amber accent means "act on this".** Never a heading, never a chart
   series, never decoration. **At most one attention element per screen** — two
   cancel each other out.
5. **One value axis. Never a dual-axis chart.** Two measures of different scale
   become two charts, small multiples, or both indexed to a common base.
6. **Status is icon + label + colour.** Never colour alone.
7. **Text wears ink tokens**, never a series colour.
8. **Never abbreviate a rupee amount.** Not "₹1.8K", not "₹18.4L". This is money
   someone is owed and it gets read aloud at a village meeting.
9. **Amounts, days and counts right-aligned. Names and places left-aligned.**
   Always, with no exceptions.
10. **360px first.** The field user is on a low-end Android phone in sunlight.
    Build that width, then widen.

## Chart procedure, in order

1. **Pick the form from the data's job** — magnitude, identity, polarity, a
   single headline, change over time. Sometimes the answer is a stat tile or a
   hero number, not a chart.
2. **Assign colour by its job** — categorical for identity, sequential for
   magnitude (one hue, light→dark), diverging for polarity (two hues, neutral
   grey midpoint), status for state. Never a rainbow.
3. **Validate.** Run the script. Do not reason about it.
4. **Apply marks** — thin marks, 4px rounded data-ends on the baseline, 2px
   lines, ≥8px points, a 2px surface gap between adjacent and stacked fills,
   selective direct labels.
5. **Add the hover layer** — crosshair and tooltip on line/area, per-mark
   tooltip on bar/dot/cell. Only a bare stat tile skips it.
6. **Accessibility pass** — legend for ≥2 series, direct labels at ≤4 series, a
   reachable table view, dark mode selected not flipped.
7. **Render it and look at it.** The validator checks colour, not layout.
   Screenshot and check for label collisions and overflow.

Scatter, bubble, choropleth and small multiples **cap at three series** — those
forms compare all pairs, and the full eight cannot clear the floors that way.

## Accessibility gates

WCAG 2.2 AA contrast · visible focus rings · keyboard-reachable verify flow ·
`prefers-reduced-motion` honoured · a text-size control · a skip-to-content link ·
`forced-colors` keeps panel structure. A screen failing one is not done.

## Fail checklist — if any appear, the design has drifted

- [ ] A purple or indigo gradient
- [ ] A drop shadow on something that already has a border
- [ ] A donut or pie chart
- [ ] A dual-axis chart
- [ ] A sparkline in a tile that already shows a delta
- [ ] An abbreviated rupee amount
- [ ] A status conveyed by colour alone
- [ ] An emoji used as an interface icon
- [ ] A series colour used as text colour
- [ ] More than one amber element on a screen
- [ ] A multi-series chart with no legend
