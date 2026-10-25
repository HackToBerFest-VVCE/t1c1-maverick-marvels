---
trigger: always_on
---

# Design rules

Before writing ANY UI, CSS, chart or layout, load the design guidance:
run `/saakshi-dashboard-ui` and read `design/DESIGN-BRIEF.md`. Writing UI without
reading these produces the generic AI dashboard look this project is explicitly
trying to avoid.

## Tokens

- Import `design/tokens.css` once, at the app root. Never redeclare a token.
- Use tokens by role (`var(--ink-secondary)`), never raw hex, anywhere in a
  component. A raw hex in a component file is a bug.
- New token needed? Add it to `tokens.css` with a comment saying what it is for.

## Colour

- The categorical series palette is validated. Do not add, reorder or brighten a
  series colour. If you must change one, re-run
  `node scripts/validate_palette.js` for BOTH modes and keep only an order that
  passes every gate.
- Series 3, 4 and 5 sit below 3:1 on the light surface. Wherever they appear,
  ship a visible direct label or the table view.
- The amber accent (`--accent-*`) marks only "a human must act on this". Never a
  heading, never a chart series, never decoration. At most one attention element
  per screen.
- Status is always icon + label + colour. Never colour alone.
- Text wears ink tokens, never a series colour.

## Charts

- One value axis. **Never a dual-axis chart.**
- Categorical hues in fixed order, never cycled. A ninth series folds into
  "Other" or the chart facets.
- Colour follows the entity, not its rank — a filter must not repaint survivors.
- Sequential = one hue light→dark. Diverging = two hues with a neutral grey mid.
- Two or more series get a legend; four or fewer are also direct-labelled.
- Every plotted chart ships a hover tooltip and a reachable table view.
- No donut charts. No pie charts. No sparkline in a tile that has a delta.

## Layout

- Structure comes from hairline rules and whitespace, not drop shadows.
- Filters in one row above the content.
- Amounts, days and counts right-aligned; names and places left-aligned.
- Build at 360px first, then widen.
- Never abbreviate a rupee amount. The exact figure is the point — it is money
  someone is owed and it gets read aloud at a village meeting.

## Accessibility

WCAG 2.2 AA contrast, visible focus rings, keyboard-reachable verify flow,
`prefers-reduced-motion` honoured, a text-size control, a skip-to-content link.
These are gates. A screen that fails one is not done.
