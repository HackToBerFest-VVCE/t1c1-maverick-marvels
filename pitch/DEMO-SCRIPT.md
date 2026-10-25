# SAAKSHI — 3-Minute Video Demo Script

*Length: Exactly 180 seconds (3:00)*
*Visual Layout: 1080p recording, cursor movements deliberate, clear English/Hindi narration with burned-in subtitles.*

---

### [00:00 – 00:20] Beat 1: The Hook (20s)
**Visual:**
- Full-screen slide with dark background:
  # ₹935 Crore Flagged.
  # 1.34% Recovered.
- Camera cut to presenter or subtle zoom.

**Spoken Narration:**
> "Between 2017 and 2021, India's social audits flagged nine hundred and thirty-five crore rupees of misappropriated wages under the rural jobs guarantee.
>
> Exactly one point three four percent came back.
>
> And this is happening right now: two weeks ago, Karnataka's Rural Development Minister issued show-cause notices to three hundred and ninety-four officials over unpaid wages across three hundred and eleven Gram Panchayats."

---

### [00:20 – 00:50] Beat 2: Why It Persists (30s)
**Visual:**
- Split screen: Left side shows a physical smudged paper Job Card and bank passbook; Right side shows a government web portal with tabular data.
- Headline overlay: "The Paper-vs-Database Gap".

**Spoken Narration:**
> "The law is not the problem. Under the new VB-G RAM G Act, when wages are delayed beyond sixteen days of muster closure, workers are owed statutory compensation automatically — nought point nought five percent per day.
>
> The problem is proof. The rural worker holds paper: a handwritten, smudged job card. The state holds an online database.
>
> Nobody compares them, because cross-referencing paper registers against database entries takes an hour per worker. And individually, delay compensation is forty-five rupees — too small to hire an advocate for, but collectively thirty-nine crore rupees in unacknowledged unpaid money."

---

### [00:50 – 01:10] Beat 3: The Governing Principle (20s)
**Visual:**
- Transition to Saakshi UI top banner.
- Text callout: **"The AI reads. The code computes. The human decides."**
- Quick pan over the terminal showing `pytest` running across 21 deterministic test cases in 0.2s.

**Spoken Narration:**
> "We built Saakshi around one strict rule: the AI reads, the code computes, the human decides.
>
> Google's Gemma 4 reads the paper into structured data. It never totals, compares, or calculates a single number.
>
> All arithmetic and legal thresholds live in unit-tested, pure Python. And zero output is computed until a human confirms the numbers beside the original photo."

---

### [01:10 – 01:40] Beat 4A: Individual Audit & Verification (30s)
**Visual:**
- Screen capture of `/audit/new`.
- Upload a photographed job card. EXIF is stripped client-side.
- Side-by-side verification pane appears: the camera crop of "Days Worked" sits directly beside the input box.
- The presenter deliberately changes a flagged low-confidence field from `5` to `6`.
- Clicks "Run Audit".
- Lands on `/audit/w1`: Hero number displays **₹1,821.60**.
- Worked arithmetic explanation box is highlighted: 6 days × ₹300 = ₹1,800 + 24 delay days = ₹21.60 compensation.
- Clicks "Read Aloud (TTS)" to hear the spoken finding in Marathi.

**Spoken Narration:**
> "Here is how it works. A worker photographs their job card. The system strips location metadata client-side and presents the crop beside the reading.
>
> When a handwritten numeral is smudged, the system does not guess — it flags it. The human confirms six days.
>
> In one click, the deterministic engine computes the exact entitlement: six missing days at the statutory three-hundred-rupee floor, plus twenty-one rupees sixty paise in delay compensation. Gemma 4 drafts the formal grievance and the Gram Sabha statement ready to read aloud."

---

### [01:40 – 02:25] Beat 4B: The Climax — Muster-Roll Reconciler (45s)
**Visual:**
- Navigate to `/reconcile/borgaon`.
- Prominent Coverage Banner: *"Coverage: based on 1 of an estimated 14 muster rolls (7.1% coverage)."*
- The Attendance Matrix appears: 20 workers down the left, days 1 to 6 across the top.
- Red and amber highlights draw immediate attention to discrepancies:
  - 2 unverified names with no paper job card in the village.
  - Santosh Mhatre: 4 days on paper job card, 8 days recorded on official muster.
  - Co-worker mismatch: Pramod Salunkhe reported working with a completely different gang.
- Switch to "Surfaced Findings" tab: findings sorted by rupee impact (Total: ₹6,649.60).
- Switch to "Gram Sabha Read-Aloud Sheet": printable one-page ledger with Section 63 BSA photo hashes.

**Spoken Narration:**
> "Now watch what happens when we look beyond one worker to an entire muster roll.
>
> One worker's grievance can be dismissed. A collective pattern is evidence.
>
> Saakshi cross-references the muster roll with all confirmed job cards for Borgaon Gram Panchayat. Notice the mandatory coverage notice: one of fourteen rolls.
>
> Instantly, the matrix surfaces what no single worker could see: two names on the official payroll with no paper job card on file. Four inflated days attributed to one mate. And a complete mismatch in reported co-workers — the exact pattern academic researchers found in Rajasthan.
>
> Individually, forty-five rupees is not worth claiming. Across twenty workers, it is six thousand six hundred rupees an official must answer for at tomorrow's Gram Sabha."

---

### [02:25 – 02:45] Beat 5: Measurement & Proof (20s)
**Visual:**
- Screen shows the Tesseract vs. Gemma 4 benchmark chart from `reference/BASELINE-COMPARISON.md`.
- Then the Reliability Diagram from `reference/CALIBRATION.md` (Expected Calibration Error: 9.18%, Threshold: ≥ 0.85).

**Spoken Narration:**
> "We did not assume Gemma 4 works; we measured it against ground truth across thirty documents.
>
> Classical OCR with OpenCV failed completely on handwritten Indic text — zero percent accuracy. Gemma 4 achieved ninety-six point six percent.
>
> And our confidence score is not self-reported opinion. We calibrated it: above nought point eight five, extractions were accurate ninety-seven point four percent of the time. Below that, we abstain and ask the human."

---

### [02:45 – 03:00] Beat 6: Open Weights & The Self-Host Toggle (15s)
**Visual:**
- Live cursor moves to the top right masthead toggle.
- Clicks `[GEMINI API]`.
- Flips instantly to `[LOCAL OLLAMA]`.
- The live trace row shows `gemma-4-26b-a4b-it [LOCAL] OK 6.2s`.
- Closing screen: Repo URL + "Saakshi: The AI reads. The code computes. The human decides."

**Spoken Narration:**
> "And because Gemma 4 is open weights, a State Social Audit Unit handling confidential citizen records does not have to send data to any cloud.
>
> With one toggle, the identical model runs air-gapped on their own laptop.
>
> Saakshi: proof for the people who do the work."
