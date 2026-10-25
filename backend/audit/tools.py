"""Typed Tool Interface for Gemma 4 Orchestrator.
Exposes audit calculations as JSON-serialisable tool wrappers with explicit docstrings.
No calculation logic lives here; all calls delegate to backend.audit.engine.
"""

from typing import Any, Dict, List, Optional
from backend.audit import engine
from backend.clauses import store


def tool_compute_wage_due(days_worked: int, notified_rate_paise: int = 30000) -> Dict[str, Any]:
    """Calculate total wage due in paise given days worked and daily notified rate in paise.
    Statutory floor is 30000 paise (₹300/day).
    """
    due = engine.compute_wage_due(days_worked, notified_rate_paise)
    return {"wage_due_paise": due, "wage_due_rupees": due / 100}


def tool_compute_unpaid_wages(wage_due_paise: int, credited_paise: int) -> Dict[str, Any]:
    """Calculate unpaid wages in paise given wage due and actual amount credited."""
    unpaid = engine.compute_unpaid_wages(wage_due_paise, credited_paise)
    return {"unpaid_wages_paise": unpaid, "unpaid_wages_rupees": unpaid / 100}


def tool_compute_delay_compensation(
    muster_close_date: str,
    credit_date: str,
    unpaid_paise: int,
) -> Dict[str, Any]:
    """Calculate delay days beyond the statutory 16-day window and 0.05% per day delay compensation."""
    delay_days = engine.compute_delay_days(muster_close_date, credit_date)
    comp = engine.compute_delay_compensation(unpaid_paise, delay_days)
    return {
        "delay_days": delay_days,
        "compensation_paise": comp,
        "compensation_rupees": comp / 100,
        "clause_cited": "Schedule II, Paragraph 6",
    }


def tool_check_entitlement_cap(household_days_used: int) -> Dict[str, Any]:
    """Check remaining guaranteed days out of the statutory 125-day annual entitlement."""
    remaining = engine.check_entitlement_cap(household_days_used)
    return {
        "statutory_cap_days": 125,
        "days_used": household_days_used,
        "remaining_days": remaining,
    }


def tool_retrieve_clause(query: str) -> Dict[str, Any]:
    """Retrieve verified statutory provisions and clauses from the VB-G RAM G legal store."""
    snippets = store.retrieve(query, k=2)
    return {"query": query, "retrieved_clauses": snippets}


AVAILABLE_TOOLS = {
    "compute_wage_due": tool_compute_wage_due,
    "compute_unpaid_wages": tool_compute_unpaid_wages,
    "compute_delay_compensation": tool_compute_delay_compensation,
    "check_entitlement_cap": tool_check_entitlement_cap,
    "retrieve_clause": tool_retrieve_clause,
}
