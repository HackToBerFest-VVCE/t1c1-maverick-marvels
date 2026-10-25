# Gemma 4 on the Gemini API — verified notes

Gathered October 2026. Where a claim is third-party rather than from Google, it
says so. **Nothing here replaces `reference/PROBE-RESULT.md`** — the probe tests
the real key and wins any disagreement.

---

## Models available on the Gemini API

Only two Gemma 4 models are served through the Gemini API:

```
gemma-4-26b-a4b-it     # MoE, ~4B active params
gemma-4-31b-it         # dense
```

The other Gemma 4 sizes released in April 2026 — E2B, E4B, and the later 12B
Unified — are **not** on the Gemini API. They exist as open weights for
self-hosting (Hugging Face, Ollama, llama.cpp, LiteRT).

## Capabilities (from the launch and the model card)

| Property | Value |
|---|---|
| Released | 2 April 2026, Apache 2.0 |
| Input | text + image (audio on E2B/E4B/12B, which are not on the API) |
| Context | 256K on both API models |
| Output cap | reported as 32,768 tokens |
| Languages | 140+ |
| Arena ranking | 31B reported #3 open model, 26B A4B #6, at launch |

## Pricing

Third-party model trackers report `gemma-4-31b-it` on Google AI Studio at **$0
per 1M input and $0 per 1M output**, with the paid tier listed as "not
available". Google's own pricing page does not carry a Gemma section at all,
which is consistent with Gemma not being billed.

Practical consequence: **a billing-linked key does not start charging for Gemma
calls**, because $0 × tokens is $0 at any tier. Using a paid key is safe and may
raise rate limits. The real exposure is a *fallback* to a Gemini model, which is
metered — which is why the model allowlist in `client.py` is mandatory.

Verify once before demo day: make one call with each model, then check the usage
dashboard reads zero.

## Rate limits

Google no longer publishes per-model limit tables. The only reliable figure is
the one shown for your own project at `https://aistudio.google.com/rate-limit`.
Limits apply **per project, not per API key**, and daily quotas reset at midnight
Pacific.

Third-party sources quote conflicting numbers; do not design against them. Design
against caching:

- Cache extractions by SHA-256 of the image bytes.
- `thinking_level="minimal"` for extraction.
- Lower image detail for printed documents, higher only for handwriting.
- Set `max_output_tokens` on extraction.
- Keep a recorded backup demo video.

---

## The features that may not work — this is the important part

Gemma 3 on the Gemini API returned **HTTP 400** for several features that work
normally with Gemini models:

```
Developer instruction is not enabled for models/gemma-3-27b-it
Function calling is not enabled for models/gemma-3-27b-it
Json mode is not enabled for models/gemma-3-27b-it
```

Google's response on the developer forum (28 March 2025) was that Gemma does not
accept a system role and the system prompt should be sent as the first turn
instead; on function calling, that it depends on the model's instruction-following
rather than being an API feature. JSON mode was not addressed. The thread does
not confirm any of the three were later enabled.

Gemma 4 *as a model* has native tool calling and strong structured-output
behaviour — self-hosted via `transformers`, `apply_chat_template(tools=...)`
works. But self-hosted capability and Gemini API surface are different things,
and community guides note Gemma 4 has **no schema enforcement**: you ask for JSON
in the prompt and parse what comes back.

One self-reported account claims `responseJsonSchema` (not `responseSchema`)
works with Gemma 4 31B through the Gemini API, with these caveats: both
`responseMimeType` and `responseJsonSchema` must be set or the mime type is
ignored; schemas returned "Internal error" on an unbilled project, so a
billing-linked key was needed; streaming plus schema truncated responses; and all
fields had to be marked `required` or they were skipped. Treat this as
unverified — it is exactly what the probe settles.

### Fallbacks, which the code implements regardless

| If unsupported | What we do |
|---|---|
| `system_instruction` | Prepend the system text to the first user turn |
| `response_schema` / JSON mode | Request JSON in the prompt, validate with Pydantic, repair once, then fail loudly |
| Function calling | Run the tool loop in our own code: the model proposes a tool as JSON, we execute it, we feed the result back |
| Image input | Confirm with the probe before building on it |

Building the fallbacks is not wasted work. They make the integration more
visibly *ours*, keep the deterministic engine in control, and remove a hard
dependency on an API surface that has changed before.

---

## Sources

- Gemini API pricing — https://ai.google.dev/gemini-api/docs/pricing
- Gemini API rate limits — https://ai.google.dev/gemini-api/docs/rate-limits
- AI Studio per-project limits — https://aistudio.google.com/rate-limit
- "Gemma 3 — missing features despite announcement", Google AI Developers Forum
  — https://discuss.ai.google.dev/t/gemma-3-missing-features-despite-announcement/71692
- LiteLLM model page, gemma-4-31b-it — https://models.litellm.ai/models/gemma-4-31b-it
- Gemma 4 function calling guide — https://gemma4.dev/guides/gemma-4-function-calling
- Gemini API free tier in 2026 — https://dev.to/hassann/gemini-api-free-tier-in-2026-limits-models-and-when-you-get-billed-4081
