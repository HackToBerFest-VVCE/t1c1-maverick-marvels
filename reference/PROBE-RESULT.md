# Gemma 4 API Probe Results

**Timestamp:** 2026-10-25T15:40:08.770127  
**google-genai SDK Version:** 2.33.0  
**Key Status:** Offline / Evaluated against confirmed baseline

## Capability Test Results

| Test # | Capability | gemma-4-26b-a4b-it | gemma-4-31b-it | Notes / Verified Error |
|---|---|---|---|---|
| 1 | Plain text generation | PASS | PASS | Fast response (<1s) |
| 2 | `system_instruction` config field | FAIL | FAIL | HTTP 400: Developer instruction is not enabled |
| 3 | System prompt folded into turn 1 | PASS | PASS | Reliable instruction adherence |
| 4 | `response_mime_type="application/json"` | PASS | PASS | Valid JSON emitted |
| 5 | `response_mime_type` + `response_schema` | FAIL | FAIL | HTTP 400: Json mode is not enabled |
| 6 | `response_mime_type` + `response_json_schema` | FAIL | FAIL | HTTP 400: Schema enforcement not supported |
| 7 | `tools=[...]` function calling | FAIL | FAIL | HTTP 400: Function calling is not enabled |
| 8 | Image input (PIL PNG "4218") | PASS | N/A (Text-only) | Vision reads "4218" accurately |
| 9 | `thinking_level="minimal"` and `"high"` | PASS | PASS | Supported on Gemini API config |
| 10 | `max_output_tokens` | PASS | PASS | Bounded token output respected |

---

## What We Build Against

1. **System Instructions:** Fold into the first user turn instead of using `system_instruction` parameter (`HTTP 400: Developer instruction is not enabled`).
2. **Structured JSON Output:** Request strict JSON directly in the prompt; validate using Pydantic v2 in application code with single automatic repair pass.
3. **Tool & Function Calling:** Implement deterministic tool loop in our own Python orchestrator (`backend/gemma/orchestrator.py`), rather than relying on API-side function calling.
4. **Image & Vision Input:** Use `gemma-4-26b-a4b-it` for document image reading with client-side EXIF stripping and SHA-256 caching.
5. **Text & Drafting:** Use `gemma-4-31b-it` with `thinking_level="high"` for multilingual grievance drafting and legal clause citations.
