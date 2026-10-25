# Phase 8 — ESP32 + RC522 reader (optional demo prop)

**Goal:** a physical reader that shows a worker's audit summary on a TFT when a
card is tapped. It is a table prop that makes the demo tangible.

**Read this before you start.** The device contributes nothing to the Gemma 4
criterion you are scored on, and hardware fails on stage. Build it only if
Phases 1–6 are done, tested and recorded. Keep it isolated: no part of the web
app may require it. If the reader dies mid-demo, your demo must not notice.

The firmware is already written: `firmware/saakshi_reader/saakshi_reader.ino`.
Pins are in `firmware/PINOUT.md`. This phase wires up the backend endpoint it
calls and gets the device on the network.

---

## Prompt

```
Read firmware/PINOUT.md and .agents/rules/30-firmware.md.

Add the device endpoint and get the reader working.

1. Backend: GET /api/nfc/resolve?job_card=...
   - Authenticated by a static bearer token from the DEVICE_TOKEN environment
     variable. This is a demo shared secret, not an identity system.
   - READ ONLY. This token must not reach any endpoint that writes audit data.
     Add a test asserting the device token is rejected on every POST route.
   - Returns ASCII-safe fields only, because the TFT cannot render Indic text:
     { "found": bool, "name_latin": str, "panchayat_latin": str,
       "unpaid_paise": int, "days_missing": int, "status": "due"|"clear" }
   - name_latin is a transliteration, not a translation. Use indic-transliteration
     to romanise. If romanisation fails, return the job card's last 4 characters
     rather than mangled bytes.
   - Money as integer paise. Never a float — a rounding error in someone's wages
     is not an acceptable class of bug.
   - Rate limit per token. Log every lookup with the job card MASKED.

2. Firmware: review saakshi_reader.ino against PINOUT.md and confirm
   - the TFT_eSPI User_Setup.h pins match the table exactly
   - secrets.h is git-ignored and secrets.example.h is committed
   - every network call has a timeout and the device self-recovers
   Then flash it to an ESP32 Dev Module and report what the serial monitor says.

3. scripts/write_card.py: write a job card number to NTAG213 as an NDEF text
   record. Refuse anything over 32 characters. Refuse names, Aadhaar numbers
   and amounts outright.

4. A demo fallback: a /demo/reader page that simulates a card tap in the
   browser, so the demo survives the device not working. Build this BEFORE
   touching the hardware.
```

---

## Hardware checks, in order

1. **Voltage first.** The RC522 goes to `3V3`. 5V destroys it, and there is no
   protection diode on the common red breakout.
2. Flash with the TFT disconnected if the board refuses flash mode — GPIO 2 and
   15 are strapping pins.
3. A blank white TFT almost always means `User_Setup.h` does not match the
   wiring. Check that before anything else.
4. Confirm the card reads before worrying about the network: the serial monitor
   should print a masked job card number on every tap.

## Done when

- [ ] `/demo/reader` simulates a tap and works without any hardware
- [ ] The physical reader shows name, panchayat and amount on tap
- [ ] The device token is rejected on every write route, with a test proving it
- [ ] Logs show masked identifiers only
- [ ] Unplugging the reader changes nothing about the web app
