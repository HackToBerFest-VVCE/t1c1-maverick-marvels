# Phase 16 — Pitch assets and the demo safety net

**Goal:** convert the build into the thing judges actually score.

Gemma 4 Good weighted **Impact & Vision at 40/100** and Technical Depth at
30/100, and the organisers stated that communicating the vision "is what will
set the winners apart". The Gemma 3n challenge was "judged primarily on your
video demo". Your engineering exists to prove the video is real — not the other
way round.

---

## Prompt

```
Read pitch/NARRATIVE.md, pitch/JUDGE-QA.md and pitch/STATISTICS.md first.

Produce the pitch assets.

1. README.md restructure. Order matters — a judge reads the top and stops:
   a) The model table (both Gemma 4 IDs, call sites, modality) — keep at top
   b) ONE sentence on what Saakshi does, using the word "evidence", not "scan"
   c) The headline statistic: ₹935 crore flagged, 1.34% recovered
   d) The Tesseract-vs-Gemma comparison table, with n
   e) The failure gallery: 3 images where Tesseract failed and Gemma didn't
   f) The reconciler, with a screenshot of the findings view
   g) Calibration curve
   h) Architecture diagram
   i) Setup, limitations, roadmap

2. Demo video, 3 minutes, following NARRATIVE.md beat for beat.
   - Record it NOW, while everything works. Re-record if things improve.
   - Screen capture at 1080p minimum, readable text, no cursor hunting.
   - Script every word. Do not improvise over a recording.
   - The reconciler is the climax — give it 45 of the 180 seconds.
   - Include the live Tesseract-vs-Gemma side-by-side.
   - Caption it. Judges may watch muted.

3. A 10-slide deck:
   1. ₹935 crore / 1.34% — nothing else on the slide
   2. The Karnataka notices, October 2026
   3. The paper-vs-database gap
   4. "The AI reads. The code computes. The human decides."
   5. The architecture
   6. Tesseract vs Gemma, with the failure gallery
   7. The reconciler findings view
   8. The calibration curve
   9. The evidence packet and Section 63
   10. Self-host: same weights, their hardware

4. The trace-panel GIF: 20 seconds of calls appearing live during a real
   extraction, model IDs legible. Embed in the README near the top. This
   answers "is Gemma really integrated" faster than any paragraph.

5. Demo safety net:
   - Pre-cache every demo image so the live run makes minimum API calls
   - A seeded account with one completed audit and one completed reconciliation
   - Local Ollama running as the Wi-Fi fallback, pre-warmed
   - The recorded video on the laptop, not in the cloud
   - Check the AI Studio rate limit for the project the morning of

6. A one-page handout: the problem statistic, the principle, the measured
   results with n, both model IDs, and the repo URL. Judges take paper away.

LANGUAGE RULE across every asset: never "scanner", "OCR tool" or "extract".
Always "reads", "evidence", "reconciles". Never "ghost worker" or "fraud" —
always "a name with no paper record found".
```

---

## One thing worth more than another feature

Get a short note from someone real — a LibTech-style NGO, a Social Audit Unit
staffer, a Gram Panchayat member, or a field volunteer. Three sentences saying
the problem is real and the tool would help.

Impact rubrics reward real-user validation, and in a field of 50 student
projects almost nobody will have spoken to an actual user. There is no published
evidence quantifying the effect of support letters, but "we showed this to a
social audit volunteer and here's what she said" is a sentence no competing team
will be able to say.

An email, a WhatsApp message or a 30-second phone video all work.

## Done when

- [ ] README leads with the model table and the headline statistic
- [ ] The video exists, is captioned, and runs under 3 minutes
- [ ] The failure gallery is in both README and deck
- [ ] The trace GIF is embedded near the top of the README
- [ ] Local fallback is pre-warmed and tested on venue-like conditions
- [ ] The handout is printed
- [ ] No asset contains the words "scanner", "ghost worker" or "fraud detection"
