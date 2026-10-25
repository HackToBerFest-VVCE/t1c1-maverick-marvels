# Phase 5 — The verify pane

**Goal:** the screen where a human takes responsibility for the data before any
money is calculated from it. Legally and ethically, this is the most important
screen in the product.

---

## Prompt

```
Run /saakshi-dashboard-ui first if it is not already loaded in this session.

Build the capture-and-verify flow using the .verify classes in dashboard.css.

Route: /audit/new

Step 1 — Capture
- Camera input plus file upload, multi-page sessions.
- Document type picker: Job Card, Passbook, Worksite Board, Muster Roll,
  Wage List.
- Client-side, BEFORE upload: resize to max 1600px, strip EXIF and GPS,
  compute a SHA-256 of the bytes for dedupe. Use a canvas re-encode so the
  metadata genuinely does not survive — do not merely omit it.
- Queue captures in IndexedDB so a dropped connection does not lose work.
  Wrap every IndexedDB access in try/catch; it throws in private windows.

Step 2 — Verify  (.verify)
- Left: the source photo, sticky, with the crop for the active field
  highlighted. Right: the extracted fields.
- Every field is an editable .verify__field showing key, value, and a .conf
  meter from the model's confidence.
- Fields below 0.75 confidence get data-flagged="true" and sort to the top.
- A field the model returned as null renders as empty and REQUIRES input —
  it cannot be confirmed blank.
- Each field has an explicit confirm control. A per-document "Confirm all
  remaining" is allowed only once every flagged field has been individually
  touched.
- Money inputs accept rupees and store integer paise. Never a float.
- Identifiers display masked to the last 4 characters, with a deliberate
  reveal control.

Step 3 — Gate
- The "Run audit" button stays disabled until every field is confirmed.
- Disabled state explains itself: "3 fields still need checking", not a dead
  grey button.
- On submit, POST only confirmed records. The backend raises
  UnconfirmedDataError on anything else — surface that clearly if it fires.

Copy rules — this matters as much as the layout:
- Low confidence reads as "please check this", never "the AI failed".
- Never claim the extraction is correct. The human is deciding, not approving
  a machine's verdict.
- Plain language, short sentences, no jargon. Translate every string.

Accessibility:
- The whole flow works by keyboard. This is the legally meaningful act in the
  product; it cannot require a mouse.
- Each field's confidence is announced to screen readers as text, not conveyed
  only by the meter's width.
- Tab order follows visual order, flagged fields first.

Show me the flow with a real extracted job card, including a deliberately
flagged low-confidence field.
```

---

## Done when

- [ ] A photo flows through capture → extract → verify → audit
- [ ] A null field cannot be confirmed empty
- [ ] "Run audit" is impossible until everything is confirmed, and says why
- [ ] EXIF is genuinely gone from the uploaded bytes — verify with `exiftool`
- [ ] The whole flow completes by keyboard alone
- [ ] Identifiers are masked by default everywhere
