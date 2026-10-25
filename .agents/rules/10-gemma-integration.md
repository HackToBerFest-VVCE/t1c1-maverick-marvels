---
trigger: always_on
---

# Gemma 4 integration rules

## The governing rule

**The AI reads. The code computes. The human decides.**

Gemma 4 converts images to structured data, and structured data to prose. It
never calculates, totals, compares or decides a number. All arithmetic, date
differences and legal thresholds live in `backend/audit/engine.py`.

If you are writing a prompt that asks the model to work out an amount — stop.
That belongs in the engine, with a unit test.

## Allowed models — nothing else, ever

```
gemma-4-26b-a4b-it     # vision: document photo → structured data
gemma-4-31b-it         # text: audit orchestration, document drafting
```

`backend/gemma/client.py` must raise on any other model string before the
request leaves the process. Do not add a Gemini fallback — not in code, not in a
comment, not "temporarily". A fallback is how a free project starts getting
billed and how a Gemma challenge entry stops being a Gemma entry.

Both Gemma models are free on the Gemini API ($0 in, $0 out) and have no paid
tier. A billing-linked key does not change the cost.

## Single entry point

Every call to the Gemini API goes through `backend/gemma/client.py`. No other
file imports `google.genai`. This is what makes the integration reviewable by a
judge in one file, and it is the point of the structure.

## Build against the probe, not the docs

`reference/PROBE-RESULT.md` records what the API actually supports for Gemma 4 on
this key. Read it before writing a call. Where it disagrees with the
documentation, **the probe wins.**

Gemma 3 returned HTTP 400 for `system_instruction`, JSON mode and function
calling. Gemma 4 may or may not have fixed this. The documented fallbacks:

| If unsupported | Do this |
|---|---|
| `system_instruction` | Fold the system prompt into the first user turn |
| `response_schema` / JSON mode | Ask for JSON in the prompt; validate with Pydantic |
| Function calling | Run the tool loop in our own code, not API-side |

Never silently work around a failure. Record the exact error string in
`reference/PROBE-RESULT.md`, then implement the fallback.

## Every call is traced

`backend/gemma/trace.py` records model ID, latency, prompt tokens, output tokens
and outcome for every call, and the dashboard renders it live. This is the
evidence that satisfies "demonstrate the integration in your code or demo", so
no call may bypass the tracer.

## Resilience

- Cache extractions by SHA-256 of the image bytes. Re-running the same demo photo
  must not hit the API twice.
- `thinking_level="minimal"` on extraction; reserve `"high"` for orchestration.
- Set `max_output_tokens` on extraction — the schema bounds the answer, and the
  model can otherwise emit up to 32K.
- Retry once on 429 or 503 with jittered backoff, then surface a clear error.
  Never retry on 400; a 400 is a bug in our request.
