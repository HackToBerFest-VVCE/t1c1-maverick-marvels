# Phase 6 — Orchestration, drafting and the report

**Goal:** the second and third Gemma 4 call sites — the audit orchestrator and
the document drafter — plus the evidence report a worker actually carries away.

---

## Prompt

```
Read reference/PROBE-RESULT.md again before writing the orchestrator.

Build the orchestration and drafting layer.

1. backend/gemma/orchestrator.py — model gemma-4-31b-it, thinking_level="high".

   The model proposes which checks to run; our code executes them. Implement the
   tool loop OURSELVES regardless of what the probe said about function calling:
   - Present the tools from backend/audit/tools.py with their docstrings.
   - The model replies with a tool name and arguments as JSON.
   - We validate the arguments against the tool's signature, execute, and feed
     the result back as the next turn.
   - Cap at 8 iterations. On the cap, fall back to running the full
     deterministic reconcile() directly and mark the report
     orchestrated=False.

   IMPORTANT: reconcile() must be callable directly, without the model, and the
   UI must use that path if orchestration fails. The audit is deterministic; the
   orchestrator is a demonstration of tool use, not a dependency. A judge
   unplugging the orchestrator must still get the right number.

2. backend/gemma/draft.py — model gemma-4-31b-it.

   Three documents, each in the worker's chosen language:
   - Grievance to the Programme Officer
   - Request for free copies of muster rolls (Schedule I ¶32)
   - Gram Sabha finding sheet, written to be read aloud

   Hard constraints in the prompt:
   - Cite ONLY clauses returned by clauses.retrieve(). Passing any other
     citation is a bug — validate the output against the retrieved set and
     reject a draft that invents one.
   - Every figure is injected from the report. The model never restates a
     number from memory, and never recomputes one.
   - Plain language. No legal advice. Frame findings as "discrepancies to
     raise", never as accusations.
   - Output as structured sections, not one prose blob, so the UI can render
     and the user can edit each part.

3. Report route /audit/[id]:
   - Hero figure (.viz--hero) for the total owed, in full rupees.
   - A discrepancy list; each entry states the finding, the figure, and the
     clause, with the clause text expandable.
   - A worked-arithmetic line for each figure, showing the inputs — a Gram
     Sabha will ask how the number was reached, and the answer must be on the
     page.
   - The three drafts, each editable, each with copy and print.
   - PDF export via WeasyPrint. Print stylesheet already exists in
     dashboard.css — verify the print layout.
   - Read-aloud using the Web Speech API in the worker's language, with a
     graceful fallback where the voice is unavailable.

4. Language support: Hindi, Marathi, Tamil, Telugu, Bengali, Odia, English.
   All UI strings externalised. Verify Devanagari and Tamil render correctly in
   the PDF — this usually needs the Noto fonts embedded explicitly.

Show me a full report for one worker, as a PDF, in Hindi.
```

---

## Done when

- [ ] A confirmed audit produces all three drafts in the chosen language
- [ ] A draft citing a clause not in the retrieved set is rejected by a test
- [ ] Every figure in the report traces to a worked-arithmetic line
- [ ] Disabling the orchestrator still yields the identical total
- [ ] The Hindi PDF renders Devanagari correctly, not as boxes
- [ ] The trace panel shows all three call sites with their model IDs
