# The 3-minute pitch

Gemma 4 Good scored **Impact & Vision at 40 points** and Technical Depth at 30,
and the organisers wrote that the ability to communicate the vision "is what will
set the winners apart." The Gemma 3n challenge was "judged primarily on your
video demo." Your build is strong; this is where it gets converted.

**The structural change:** your current demo ends on one worker owed ₹21.60. A
judge hears a document scanner. It must end on twenty workers and a muster roll.

---

## Beat 1 — The hook (20 seconds)

> "Between 2017 and 2021, India's social audits found nine hundred and thirty-five
> crore rupees stolen from the rural job guarantee.
>
> One point three four percent came back.
>
> And this isn't history. Two weeks ago, the Karnataka Rural Development Minister
> issued show-cause notices to three hundred and ninety-four officials, because
> wages were late in three hundred and eleven Gram Panchayats."

Say the numbers slowly. Do not put a logo on this slide — put the two numbers.

## Beat 2 — Why it persists (30 seconds)

> "The law is not the problem. Under VB-G RAM G, a worker paid late is owed
> compensation automatically — nought point nought five percent a day.
>
> The problem is proof. The worker holds paper: a job card, a passbook, a photo
> of the worksite board. The state holds a database. Nobody compares them,
> because comparing them takes an hour and needs literacy.
>
> And the individual amounts are small. Three thousand rupees paid a month late
> earns about forty-five rupees in compensation. That is exactly why nobody
> claims it — and why, in one study's sample alone, thirty-nine crore in
> compensation went unacknowledged and unpaid."

This beat does the real work. It explains why a solved-on-paper problem is
unsolved in practice.

## Beat 3 — The principle (20 seconds)

> "So we built Saakshi on one rule: **the AI reads, the code computes, the human
> decides.**
>
> Gemma 4 reads the paper. It never calculates anything. Every rupee comes from
> tested Python. And nothing is computed until a human confirms the field beside
> the original photo."

If you have a spare beat, add: *Google's own judges praised exactly this design
in the Gemma 4 Good Hackathon — they called the winning entry's deterministic,
non-hallucinatory architecture its defining strength.*

## Beat 4 — The demo (75 seconds)

**Part one, 30 seconds — the individual.**
Photograph a Hindi job card. Fields appear beside their crops. **Correct one
low-confidence digit by hand** — this is the moment that proves a human is in
control, and judges remember it. Run the audit. "Six days worked, absent from
the muster roll. ₹1,800 unpaid. Credited forty days late, so ₹21.60 compensation
under Schedule II, paragraph six."

**Part two, 45 seconds — the turn. This is the whole pitch.**

> "That's one worker. Now watch what happens with twenty, from a single muster
> roll."

Run the reconciler. On screen:
- two names on the government roll with no paper record behind them
- three days added to one worker's attendance
- the same pattern concentrated under one mate
- the delay compensation, summed across the roll

> "Individually, forty-five rupees is never worth claiming. Across one muster
> roll, it's a number an officer has to answer for. And researchers in Rajasthan
> found a sixty-one percent mismatch in co-worker names doing this check by
> hand. We just made it a by-product of a worker checking their own wages."

Then the evidence packet: every source photo SHA-256 hashed at capture, the
confirmation trail, and a Gram Sabha sheet in Kannada.

## Beat 5 — Proof (20 seconds)

Two things on one slide.

> "We measured it. Tesseract with OpenCV preprocessing got [X]% of fields right
> on our documents. Gemma 4 got [Y]%. On handwriting the gap is [Z] points.
>
> And our confidence scores aren't the model's opinion of itself — we calibrated
> them. Above 0.85, fields were right 97% of the time. Below that, we don't
> guess. We ask."

State n out loud. "Thirty documents, four hundred and twelve fields."

## Beat 6 — Why Gemma, and scale (15 seconds)

Flip the self-host toggle live.

> "Same model, running on this laptop. Gemma is Apache 2.0, so a State Social
> Audit Unit can run it on their own hardware and worker identities never leave
> government custody. That's why this had to be Gemma and not a closed model.
>
> Only six of thirty-four states have audited even half their panchayats. The
> bottleneck isn't the law. It's evidence assembly. That's what we built."

---

## Rules for delivery

**Never say "scanner", "OCR" or "extract".** Say *reads*, *evidence*,
*reconciles*. The word you use decides the category the judge files you under,
and "another OCR app" is the category you lose in.

**Never say "ghost worker" or "fraud" out loud.** Say "a name on the government
roll with no paper record behind it." You detect an absence of evidence, not the
presence of a crime. A judge who hears restraint hears someone who has thought
about being wrong.

**Lead every metric with its n.** "Thirty documents" before the percentage, not
after.

**Protect the demo.** Pre-cache every demo image, keep the local model as a
Wi-Fi fallback, and have the recorded video ready. These competitions are judged
primarily on the video anyway — record it while everything works.

---

## If you only get 60 seconds

Hook (the ₹935 crore / 1.34%), the principle (one sentence), the reconciler
demo, the Tesseract comparison. Drop everything else. The reconciler is the
pitch.
