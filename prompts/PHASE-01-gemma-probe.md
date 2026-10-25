# Phase 1 — Probe what the API actually supports

**Goal:** settle, empirically, which Gemini API features work with Gemma 4 on
*your* key. Every later phase builds on the answer.

**Why this phase exists:** Gemma 3 returned HTTP 400 for `system_instruction`,
JSON mode and function calling. Gemma 4 may have fixed this; the documentation
is ambiguous and third-party reports conflict. Guessing wrong means rewriting
the extraction layer at hour 30. Read `reference/gemma-api-notes.md` first.

**Takes about 10 minutes, including the API calls.**

---

## Prompt

```
Read reference/gemma-api-notes.md before writing anything.

Write scripts/probe_gemma.py — a standalone capability probe. It reads
GEMINI_API_KEY from the environment and tests, independently, against BOTH
gemma-4-26b-a4b-it and gemma-4-31b-it:

 1. plain text generation
 2. system_instruction as a config field
 3. system text folded into the first user turn instead
 4. response_mime_type="application/json" alone
 5. response_mime_type + response_schema
 6. response_mime_type + response_json_schema   (note: different field)
 7. tools=[...] function calling
 8. image input — generate a 400x120 PNG with PIL containing the text "4218",
    ask the model to read the digits, check the reply contains 4218
 9. thinking_level="minimal" and "high"
10. max_output_tokens

Requirements:
- Every test wrapped so one failure never aborts the run.
- On failure, capture the EXACT error string, not a summary. The 400 message is
  the useful artefact.
- Guard every config field with try/except TypeError, because an older SDK may
  not know a newer field name.
- Print a PASS/FAIL table at the end.
- Write the results to reference/PROBE-RESULT.md as a markdown table with a
  timestamp, the SDK version, and a "What we build against" section stating the
  decision for each feature.
- Never print the API key, not even masked.

Run it and show me reference/PROBE-RESULT.md.
```

---

## After it runs

Read the result yourself. The decisions that follow from it:

| Probe outcome | What Phase 2 does |
|---|---|
| `system_instruction` works | use it |
| `system_instruction` 400s | prepend system text to the first user turn |
| `response_schema` works | use it, and still validate with Pydantic |
| only `response_json_schema` works | use that, mark every field `required` |
| neither works | request JSON in the prompt, validate, repair once, fail loudly |
| function calling works | still run the loop in our code; do not depend on it |
| image input fails | **stop and tell me immediately** — the project premise depends on it |

That last row is the one real project risk. If image input does not work on a
Gemma 4 model through the Gemini API, say so before building anything else.

---

## Done when

- [ ] `reference/PROBE-RESULT.md` exists, with a timestamp and SDK version
- [ ] Every feature has a PASS/FAIL and, on FAIL, the verbatim error string
- [ ] Image input is confirmed working on `gemma-4-26b-a4b-it`
- [ ] The "What we build against" section states a decision per feature
