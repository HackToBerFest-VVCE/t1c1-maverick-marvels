# Phase 12 — The tamper-evident evidence packet

**Goal:** make "chain of custody" concrete. The evidence chain starts at the
moment the worker photographs the paper, not when an official chooses to
acknowledge it.

**Legal grounding:** Section 63 of the Bharatiya Sakshya Adhiniyam, 2023
replaced Section 65B of the Evidence Act from 1 July 2024. Electronic records
must carry a certificate in the Schedule format stating the **hash value**
(SHA-256, SHA-1 or MD5), signed by the device custodian in Part A and an expert
in Part B. In July 2026 the Supreme Court upheld Section 63(4), describing the
hash as "synonymous with an electronic fingerprint."

---

## Prompt

```
Add a tamper-evident evidence packet.

1. Hash at capture, client-side, BEFORE upload:
   - SHA-256 of the original image bytes, computed in the browser immediately
     after capture and before any resize, EXIF strip or re-encode.
   - Also hash the processed bytes that were actually sent to the model.
   - Store both, plus the capture timestamp and the device-reported timezone.
   Record BOTH hashes. The original proves what the camera produced; the
   processed one proves what the model saw. Conflating them is the mistake.

2. backend/evidence/manifest.py — build a signed JSON manifest per audit:
   {
     "audit_id", "created_utc",
     "documents": [
       { "doc_type", "sha256_original", "sha256_processed",
         "captured_utc", "extraction_model", "trace_id" }
     ],
     "human_confirmations": [
       { "field_path", "model_value", "confirmed_value", "changed": bool,
         "confirmed_utc" }
     ],
     "computation": {
       "engine_version", "engine_git_sha",
       "inputs": {...}, "outputs": {...},
       "formulas_applied": ["wage_due", "delay_compensation", ...]
     },
     "clauses_cited": [ {"clause_id", "clause_sha256"} ],
     "manifest_sha256": "..."
   }

   The human_confirmations block is the important part and the part nobody else
   will have: it records which values the model proposed, which a human changed,
   and when. That is the audit trail for the decision, not just for the data.

3. Section 63 Part A pre-fill: generate a PDF in the Schedule format with the
   hash values, the device description, and the period of operation filled in,
   leaving the custodian signature blank.

   Label it precisely: "Court-ready preparation — Part B expert certification
   still required." We pre-fill Part A. We cannot supply the Part B expert
   signature. Overclaiming here would be both wrong and easy for a judge to
   catch.

4. A verifier: scripts/verify_packet.py takes a packet and the original photos
   and re-checks every hash, then re-runs the deterministic engine on the
   recorded inputs and confirms the outputs match. Prints PASS/FAIL per check.

   This is the demo move: hand the judge the packet, change one pixel of one
   photo, re-run the verifier, watch it fail loudly.

5. UI: an "Evidence packet" section on /audit/[id] showing the hash of each
   source photo (first 12 chars, monospace, copyable), the confirmation trail,
   and a download button for the packet plus the Part A PDF.

Do not store raw biometrics, thumbprints or face crops in the packet. Hashes and
field values only.
```

---

## Done when

- [ ] Both hashes are computed client-side at capture
- [ ] The manifest records which fields a human changed, and when
- [ ] `verify_packet.py` passes on a clean packet and fails loudly on a modified photo
- [ ] The Part A PDF is labelled as preparation, not as certification
- [ ] No biometric data anywhere in the packet
