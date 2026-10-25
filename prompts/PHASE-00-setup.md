# Phase 0 — Scaffold and ground rules

**Goal:** a running skeleton with the agent rules in place, so every later phase
inherits the constraints instead of being told them again.

**Before you start:** copy `AGENTS.md`, `CONTEXT.md`, `.agents/`, `design/`,
`scripts/`, `reference/` and `firmware/` from this kit into an empty repo. Open
it in Antigravity. Confirm the rules loaded — ask the agent "what are your
standing rules for this repo?" and check it mentions the model allowlist and the
"AI reads, code computes" rule. If it does not, the rules are not being read and
nothing below will hold.

---

## Prompt

```
Read CONTEXT.md and AGENTS.md completely before doing anything.

Scaffold the Saakshi repository. Run /plan first and show me the plan.

Backend:
- FastAPI app at backend/main.py with /health returning {"status":"ok"}
- Package layout exactly as CONTEXT.md §7 specifies: backend/gemma/,
  backend/audit/, backend/clauses/, backend/tests/
- pyproject.toml with: fastapi, uvicorn, google-genai, pydantic v2,
  python-multipart, pillow, pytest, ruff
- backend/audit/ must import and test with NO API key present. Add a test that
  asserts this: import the package with GEMINI_API_KEY unset and assert no error.

Frontend:
- Next.js 15 App Router, TypeScript strict, Tailwind OFF
- We use plain CSS with the design tokens. Import design/tokens.css,
  design/dashboard.css and design/charts.css in the root layout, in that order.
- A single page at / rendering an app shell using the .app / .masthead /
  .sidebar / .topbar / .main classes from dashboard.css. Hardcoded nav items are
  fine for now. No data yet.

Config:
- .env.example with GEMINI_API_KEY= (empty)
- .gitignore covering .env, firmware/**/secrets.h, __pycache__, .next, node_modules
- A pre-commit hook that greps staged files for AIza[0-9A-Za-z_-]{35} and
  refuses the commit on a match

Do NOT write any Gemma call in this phase. Phase 1 settles what the API supports
before we write a single call site.

Then: run the backend, run the frontend, and show me both working.
```

---

## Done when

- [ ] `GET /health` returns 200
- [ ] The frontend renders the shell with the masthead tricolour rule visible
- [ ] `pytest backend/tests` passes, including the no-key import test
- [ ] `.env` is git-ignored and the hook rejects a test commit containing a fake
      `AIzaSy...` string
- [ ] No file imports `google.genai` yet
