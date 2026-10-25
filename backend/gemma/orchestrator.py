"""Gemma 4 Audit Orchestrator.
Model: gemma-4-31b-it (thinking_level="high").
Proposes audit checks to run; executes tools deterministically in our Python code.
Falls back safely to direct reconcile() if iterations cap (8 steps) or if model unavailable.
The deterministic engine remains the ground truth.
"""

import json
from typing import Any, Dict, List, Optional
from backend.audit import engine
from backend.audit.tools import AVAILABLE_TOOLS
from backend.gemma.client import generate


ORCHESTRATOR_SYSTEM_PROMPT = """You are Saakshi's Audit Orchestration Agent for VB-G RAM G.
You investigate discrepancies between worker job cards, bank passbooks, and official muster rolls.
You have access to deterministic audit tools:
1. compute_wage_due(days_worked: int, notified_rate_paise: int)
2. compute_unpaid_wages(wage_due_paise: int, credited_paise: int)
3. compute_delay_compensation(muster_close_date: str, credit_date: str, unpaid_paise: int)
4. check_entitlement_cap(household_days_used: int)
5. retrieve_clause(query: str)

RULES:
1. To call a tool, respond with ONLY valid JSON:
   {"tool": "<tool_name>", "args": {<argument_dict>}}
2. When your audit investigation is complete, respond with:
   {"tool": "finish", "findings_summary": "<concise summary of discrepancies and legal grounds>"}
3. DO NOT calculate wages or delay compensation yourself. Always call the corresponding tool.
"""


def orchestrate_audit(
    worker_records: List[Dict[str, Any]],
    muster_records: List[Dict[str, Any]],
    wage_records: List[Dict[str, Any]],
    rate_paise: int = 30000,
) -> Dict[str, Any]:
    """Orchestrate the audit loop using Gemma 4 31B with local tool execution.
    Caps at 8 iterations, falling back seamlessly to deterministic reconcile().
    """
    # Deterministic baseline calculation (always executed)
    deterministic_report = engine.reconcile(
        worker_records=worker_records,
        muster_records=muster_records,
        wage_records=wage_records,
        rate_paise=rate_paise,
    )

    history = [
        f"[SYSTEM INSTRUCTION]\n{ORCHESTRATOR_SYSTEM_PROMPT}\n\n"
        f"[USER DATA]\nWorker records: {json.dumps(worker_records, ensure_ascii=False)}\n"
        f"Muster records: {json.dumps(muster_records, ensure_ascii=False)}\n"
        f"Wage records: {json.dumps(wage_records, ensure_ascii=False)}\n"
        f"Rate: {rate_paise} paise. Propose first audit step or finish."
    ]

    tool_call_history: List[Dict[str, Any]] = []
    orchestrated_success = False

    try:
        for iteration in range(8):
            conversation_text = "\n\n".join(history)
            raw_response = generate(
                model_id="gemma-4-31b-it",
                prompt=conversation_text,
                endpoint_name=f"orchestrator/step_{iteration + 1}",
                thinking_level="high",
                max_output_tokens=1024,
                response_mime_type="application/json",
            )

            # Strip possible markdown code blocks
            resp_clean = raw_response.strip()
            if resp_clean.startswith("```json"):
                resp_clean = resp_clean[7:]
            elif resp_clean.startswith("```"):
                resp_clean = resp_clean[3:]
            if resp_clean.endswith("```"):
                resp_clean = resp_clean[:-3]
            resp_clean = resp_clean.strip()

            try:
                action = json.loads(resp_clean)
            except Exception:
                # Fallback if non-JSON output
                break

            tool_name = action.get("tool")
            if tool_name == "finish":
                orchestrated_success = True
                tool_call_history.append({"step": iteration + 1, "action": "finish", "summary": action.get("findings_summary")})
                break

            if tool_name in AVAILABLE_TOOLS:
                args = action.get("args", {})
                try:
                    tool_func = AVAILABLE_TOOLS[tool_name]
                    result = tool_func(**args)
                    tool_call_history.append({"step": iteration + 1, "tool": tool_name, "args": args, "result": result})
                    history.append(f"Tool {tool_name} returned: {json.dumps(result, ensure_ascii=False)}. Next step or finish?")
                except Exception as tool_err:
                    history.append(f"Tool execution error: {str(tool_err)}. Correct arguments or finish.")
            else:
                break

    except Exception:
        orchestrated_success = False

    return {
        "report": deterministic_report.model_dump(),
        "orchestrated": orchestrated_success,
        "tool_steps": tool_call_history,
    }
