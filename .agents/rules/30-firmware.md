---
trigger: glob
globs: "firmware/**/*"
---

# Firmware rules (ESP32 DevKit + RC522)

## Hardware is optional and must never block the demo

The reader is a demonstration prop. The web app must work completely without it.
No frontend code path may require the device to be present, reachable or paired.
If the reader is offline, the app shows manual entry and says nothing about
hardware.

## Card choice is fixed — NTAG213, not MIFARE Classic

Use **NTAG213** cards. The RC522 can read them, and so can an ordinary Android
phone over NFC. MIFARE Classic is readable by the RC522 but **not by iPhones and
not by many Android phones**, which would break the phone-tap path entirely. One
card type has to serve both readers, and NTAG213 is the one that does.

## The card holds a pointer, never documents

Write only the job card number — 18 bytes — to NTAG213 user memory starting at
page 4. Nothing else.

An NTAG213 has 144 bytes of user memory. One legible photo of a job card page is
300,000 to 800,000 bytes. Storing documents on the card is off by three orders of
magnitude; it is not a tuning problem. The card's only job is to save a volunteer
from typing an 18-character number in the sun.

## Voltage

The RC522 is a **3.3V** part. Connect it to `3V3`. Putting 5V on its VCC
destroys it. See `firmware/PINOUT.md` for every pin.

## Firmware conventions

- Arduino framework, ESP32 DevKit v1 (the 30-pin board, `esp32dev`).
- WiFi credentials and the backend URL come from `secrets.h`, which is
  git-ignored. `secrets.example.h` is committed.
- The device authenticates to the backend with a static bearer token from
  `secrets.h`. It is a shared-secret prop, not an identity system — never give
  the device any endpoint that can write audit data.
- The TFT displays **ASCII only.** Rendering Devanagari or Tamil needs complex
  text shaping — conjuncts and repositioned matras — which embedded text
  libraries do not do. Showing mangled Hindi is worse than showing none. Numbers,
  Latin letters and status words only.
- Never print the bearer token or WiFi password over serial.
- Every network call gets a timeout. A hung reader must recover on its own, not
  wait for someone to hit reset mid-demo.
