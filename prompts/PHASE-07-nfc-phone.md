# Phase 7 — Phone NFC tap (optional)

**Goal:** tap an NTAG213 card against an Android phone to reopen a saved audit.

**Scope discipline:** this is a convenience, not a capability. It earns no Gemma
points. Build it only once Phases 1–6 are working and measured. The card holds
18 bytes — a job card number — and nothing else.

---

## Prompt

```
Read .agents/rules/30-firmware.md for the card format rules.

Add optional NFC tap-to-recall to the PWA.

1. Card format — NTAG213, NDEF text record, holding ONLY the job card number.
   NTAG213 has 144 bytes of user memory; a legible job card photo is 300,000+
   bytes, so documents on the card are not possible and must never be implied
   in the UI. An NDEF text record is used so any stock phone NFC app can read
   it without our software.

2. Reader — Web NFC (NDEFReader), Chrome on Android only.
   - Feature-detect: if ("NDEFReader" in window). Where absent, show manual
     entry with NO mention of NFC. An iPhone user must not see a broken
     affordance.
   - Web NFC needs a user gesture and HTTPS. Wire it to an explicit "Tap card"
     button, never an automatic scan on page load.
   - Handle: permission denied, scan aborted, a card with no NDEF record, and a
     record whose text is not a known job card. Each gets its own message.
   - On a successful read, resolve the number against the local audit database
     and open that worker's record. If unknown, say "not on file — run an audit
     first" rather than failing silently.

3. Writer — scripts/write_card.py, run from a laptop with a USB NFC writer, or
   document using an Android app such as NFC Tools. It writes one NDEF text
   record containing the job card number. It must refuse to write anything
   longer than 32 characters, and must never write a name, an Aadhaar number,
   or any amount.

4. UI copy — state the limit plainly wherever the feature appears:
   "The card holds only the job card number. No documents are stored on it."
   This pre-empts the obvious question and is simply true.

5. A kill switch: NEXT_PUBLIC_ENABLE_NFC=false removes the feature entirely.
   The demo must be able to drop it in one environment variable.

Do not add any NFC dependency to a code path the core flow needs.
```

---

## Done when

- [ ] Tapping a written card on an Android Chrome device opens the right record
- [ ] A device without Web NFC shows manual entry and no NFC affordance
- [ ] Every error case has its own message
- [ ] The writer refuses anything but a job card number
- [ ] `NEXT_PUBLIC_ENABLE_NFC=false` removes it cleanly
- [ ] Turning the feature off breaks nothing
