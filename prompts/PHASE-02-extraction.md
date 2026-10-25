# Phase 2 — The Gemma 4 extraction pipeline

**Goal:** a document photo goes in, validated structured data comes out, and
every call is traced. This is the phase the judges will actually read.

**Precondition:** `reference/PROBE-RESULT.md` exists. Build against it.

---

## Prompt

```
Read reference/PROBE-RESULT.md and .agents/rules/10-gemma-integration.md first.
Build against what the probe found, not what the docs imply.

Build the extraction pipeline.

backend/gemma/client.py — the ONLY file in this repo that imports google.genai.
- ALLOWED_MODELS = {"gemma-4-26b-a4b-it", "gemma-4-31b-it"} as a module constant
- A generate() wrapper that raises ValueError on any other model string BEFORE
  the request leaves the process. No Gemini fallback, not even commented out.
- Key from os.environ["GEMINI_API_KEY"]. Never logged, never returned.
- Retry once on 429/503 with jittered backoff. Never retry a 400.
- Every call goes through the tracer. No exceptions.

backend/gemma/schemas.py — Pydantic v2 models, one per document type:
  JobCardPage, PassbookPage, WorksiteBoard, MusterRollRow, WageListRow
Every field carries: value, confidence (0..1), and crop_ref (the region of the
source image it came from, so the UI can show the crop beside the field).
Money fields are integer paise, never float. Dates are ISO strings.

backend/gemma/prompts.py — one instruction per document type. Each must:
- state the document type and what it looks like in the field
- demand strict JSON matching the schema, keys in a fixed order
- require a per-field confidence and crop reference
- instruct the model to emit null, not a guess, for an illegible field
- explicitly forbid calculating, totalling or inferring any value
If the probe says system_instruction is unsupported, prepend this text to the
first user turn instead — implement whichever the probe says works.

backend/gemma/extract.py:
- extract(image_bytes, doc_type) -> validated Pydantic model
- model = gemma-4-26b-a4b-it, thinking_level="minimal", max_output_tokens set
- Cache on SHA-256 of the image bytes. A repeated demo photo must not re-hit
  the API.
- On a validation failure: ONE repair attempt that returns the parse error to
  the model, then raise with the raw text attached. Never silently return
  partial data.

backend/gemma/trace.py:
- Records model_id, endpoint, latency_ms, prompt_tokens, output_tokens, outcome
- In-memory ring buffer of the last 100 calls plus a JSONL file
- GET /api/trace returns it for the dashboard panel

Endpoint: POST /api/extract taking an image upload and a doc_type, returning the
validated model plus the trace id.

Tests: mock the SDK and assert (a) a disallowed model raises before any network
call, (b) a malformed JSON response triggers exactly one repair then raises,
(c) the cache prevents a second call for identical bytes.

Show me a real extraction against one synthetic job card image.
```

---

## Done when

- [ ] A job card photo returns validated structured data
- [ ] `GET /api/trace` shows the model ID, latency and token counts
- [ ] Passing `"gemini-3-flash"` to `generate()` raises before any network call
- [ ] Re-posting the same image does not produce a second trace entry
- [ ] Only `backend/gemma/client.py` imports `google.genai` —
      verify with `grep -rn "google.genai" backend/ | grep -v client.py`
