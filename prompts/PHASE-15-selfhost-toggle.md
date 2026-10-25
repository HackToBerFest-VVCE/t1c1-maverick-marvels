# Phase 15 — The self-host toggle

**Goal:** make "open weights" tangible instead of a talking point.

In the Gemma 4 Good Hackathon, nearly every prize went to local or on-device
deployments — Ollama, llama.cpp, LiteRT, Cactus. The judges in this ecosystem
demonstrably reward proving that the open model actually runs outside Google's
API. A toggle in the trace panel does that in five seconds of demo time.

It also converts your weakest-sounding answer ("we could self-host") into a
demonstrated one ("here, watch").

---

## Prompt

```
Add a local-inference backend so the identical model can run without the API.

1. backend/gemma/client.py — add a provider abstraction WITHOUT weakening the
   allowlist:
   - GEMMA_PROVIDER env var: "gemini_api" (default) or "ollama"
   - The ALLOWED_MODELS check still runs first, on every path. The provider
     changes where the request goes, never which models are permitted.
   - Ollama path: POST to the local /api/chat with model gemma4:26b, images as
     base64. Same prompts, same Pydantic validation, same repair pass.
   - If Ollama is unreachable, fail with a clear message. Do NOT silently fall
     back to the API — a silent switch would make the trace panel lie, and the
     trace panel is our evidence.

2. Trace panel: show the provider on every row, visually distinct.
     14:22:01  gemma-4-26b-a4b-it  [GEMINI API]  OK  1.8s  1,204 tok
     14:22:19  gemma-4-26b-a4b-it  [LOCAL]       OK  6.2s  1,204 tok
   The side-by-side is the whole point. Same model ID, two providers.

3. A /settings toggle switching provider at runtime, with the current provider
   shown in the topbar so it is never ambiguous which one produced a result.

4. Measure it — reference/LOCAL-BENCHMARK.md:
   - The same 30-document eval, run through Ollama
   - Accuracy delta between providers, with n and intervals
   - Median and p95 latency on the demo hardware, hardware stated
   - Peak RAM
   Report it honestly. Local will be slower, and quantised local may be less
   accurate. Both are fine and expected. "Slower but identical weights, and it
   works with no connectivity" is a strong, true claim. An unmeasured claim is
   not.

5. README: a short "Deployment modes" section — hosted API for a volunteer with
   a phone, self-hosted for a State Social Audit Unit that cannot send citizen
   data to a third-party API.
```

---

## Setup before you run this

```bash
ollama pull gemma4:26b     # ~18 GB at Q4
ollama run gemma4:26b "test"
```

Check the vision path works locally before building against it — multimodal
support through local runners varies by version, and if images do not work, that
is worth discovering in ten minutes rather than two hours. If vision fails
locally, still ship the toggle for the text models (orchestration and drafting)
and say plainly which parts run local.

## The argument this unlocks

> "This is why it had to be Gemma and not Gemini or GPT. A State Social Audit
> Unit handling citizen entitlement data cannot send it to a third-party API.
> With Gemma they don't have to — the weights are Apache 2.0, and this is the
> identical model running on a laptop. Same prompts, same code path. Watch."

Then flip the toggle on stage.

## Done when

- [ ] The allowlist still runs first on both providers
- [ ] An unreachable Ollama fails loudly and never silently falls back
- [ ] The trace panel labels the provider on every row
- [ ] `LOCAL-BENCHMARK.md` has measured accuracy and latency with hardware stated
- [ ] A live toggle works in the demo in under five seconds
