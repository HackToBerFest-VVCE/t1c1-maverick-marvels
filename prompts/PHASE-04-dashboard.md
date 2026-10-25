# Phase 4 — The dashboard

**Goal:** the screen that makes people believe this is a system of record.

**Load the design skills before writing a line of UI.** Run
`/saakshi-dashboard-ui` and read `design/DESIGN-BRIEF.md`. If you skip this you
will produce the generic purple-gradient AI dashboard, which is the one outcome
we are explicitly designing against.

---

## Prompt

```
FIRST: run /saakshi-dashboard-ui and read design/DESIGN-BRIEF.md and
.agents/rules/00-design-system.md. Do not write UI before you have.

Build the Saakshi dashboard. Use ONLY the tokens in design/tokens.css and the
component classes in design/dashboard.css and design/charts.css. A raw hex value
in a component file is a bug. If you need something the CSS lacks, add it to
dashboard.css with a comment, do not inline it.

Route: /dashboard — the Social Audit Resource Person's view.

Layout, top to bottom:

1. Masthead (.masthead) — "SAAKSHI" with the tricolour rule, and the subtitle
   "Social audit support · VB-G RAM G". A theme toggle writing data-theme on
   <html>, persisted to localStorage in a try/catch.

2. Stat row (.stat-row) — exactly four tiles:
   - Workers audited this cycle
   - Discrepancies found
   - Total unpaid wages identified   ← this one gets data-attention="true"
   - Grievances filed
   Figures use .stat-figure with tabular numerals. Rupee amounts are written in
   full — "₹18,42,600", never "₹18.4L". Each tile carries one comparison as a
   .delta with its arrow glyph.

3. Filter bar (.filters), ONE row: panchayat select, work period range,
   status select, and a search input. Never a side drawer.

4. Two charts side by side, stacking below 900px:
   a) "Unpaid wages identified, by month" — a bar chart. One value axis.
      Direct-labelled. Legend omitted (single series — the title names it).
   b) "Discrepancies by type" — horizontal bars, max 5 categories, the rest
      folded into "Other" with --series-other. Direct labels on every bar.
   Both: hover tooltip, a .viz__table-toggle revealing an accessible table,
   gridlines on the value axis only, marks per charts.css.
   NO donut. NO dual axis. NO sparklines in the tiles.

5. Ledger table (.ledger) — "Workers with open discrepancies":
   Worker (.ledger__primary) · Job card (.ledger__id, masked to last 4) ·
   Panchayat · Days missing (.num) · Unpaid ₹ (.num) · Delay comp ₹ (.num) ·
   Status (.pill with icon and label) · action button.
   Sticky header, rows with open amounts marked data-attention="true",
   a .ledger__foot row with column totals. Sortable by any numeric column.

6. Trace panel (.trace) — "Gemma 4 call log", live from GET /api/trace.
   Each row: timestamp · model ID in --trace__model · OK/ERR · latency and
   token count right-aligned. This is the judges' proof, so make it prominent
   and let it scroll.

Requirements:
- Server components by default; client components only where interaction needs.
- Mock the data through a typed API layer so swapping to the real endpoint is
  one file.
- Build and verify at 360px FIRST, then widen. Screenshot both.
- Verify light and dark. Dark is a selected palette, not a filter.
- Keyboard: every control reachable, visible focus rings.

Then screenshot /dashboard at 360px and 1440px, in both themes, and show me all
four.
```

---

## Review against this before calling it done

- [ ] No purple or indigo gradient anywhere
- [ ] No drop shadow on anything that already has a border
- [ ] Exactly one `data-attention="true"` element per screen
- [ ] No rupee amount abbreviated
- [ ] Every status pill has an icon and a label, not just colour
- [ ] No dual-axis chart, no donut
- [ ] Series 3/4/5 never appear without a direct label or the table view
- [ ] Amounts right-aligned, names left-aligned, tabular figures throughout
- [ ] Readable at 360px with no horizontal scroll
- [ ] The trace panel shows real model IDs
