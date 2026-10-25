---
trigger: always_on
---

# Secrets and data rules

## The API key

- Read from the `GEMINI_API_KEY` environment variable. Nowhere else.
- `.env` is git-ignored; `.env.example` is committed with an empty value.
- Never write a key into source, a test fixture, a notebook, a comment, a commit
  message, a log line or a screenshot.
- Never print the key, not even masked.
- The key is server-side only. It must never reach the browser bundle, so no
  `NEXT_PUBLIC_` variable ever holds it. The frontend calls our FastAPI backend;
  the backend calls Google.
- Before any commit, verify no staged file matches `AIza[0-9A-Za-z_-]{35}`.

## Worker data

**The hackathon build uses synthetic documents only.** Never commit or test
against a real job card, passbook or Aadhaar number. Generate the test set with
`scripts/make_synthetic_docs.py`, with errors deliberately seeded so detection
recall is measurable.

- Mask job card and Aadhaar numbers in every log line, UI surface and screenshot.
  Show the last 4 characters at most.
- Strip EXIF and GPS client-side, before upload.
- Raw images are not retained by default.
- No worker identifier appears in an analytics event, a URL path or a query
  string.

## Why this is stricter than a normal hackathon project

This product handles documents that identify poor rural households and the money
they are owed. A leaked job card number is not an abstract privacy problem — it
links a named person to a government entitlement dispute. Treat every field as
though the person it describes is in the room.
