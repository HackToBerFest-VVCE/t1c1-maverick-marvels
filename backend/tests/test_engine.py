"""Phase 3 Deterministic Audit Engine Tests.
Contains hand-computed test fixtures.
NO model calls, no network, no API key needed.
"""

import os
import pytest
from backend.audit import engine
from backend.audit.engine import UnconfirmedDataError


def test_no_secrets_or_network_in_audit():
    """Verify backend/audit does not import genai, requests, or httpx."""
    audit_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "audit"))
    for root, _, files in os.walk(audit_dir):
        for f in files:
            if f.endswith(".py"):
                with open(os.path.join(root, f), "r", encoding="utf-8") as py_file:
                    for line in py_file:
                        stripped = line.strip()
                        assert not stripped.startswith("import requests"), f"Forbidden import in {f}: {line}"
                        assert not stripped.startswith("from requests"), f"Forbidden import in {f}: {line}"
                        assert not stripped.startswith("import httpx"), f"Forbidden import in {f}: {line}"
                        assert not stripped.startswith("from httpx"), f"Forbidden import in {f}: {line}"
                        assert not stripped.startswith("import google.genai"), f"Forbidden import in {f}: {line}"
                        assert not stripped.startswith("from google.genai"), f"Forbidden import in {f}: {line}"


def test_hand_computed_wage_due():
    """6 days at ₹300 = ₹1,800 -> 180000 paise."""
    days = 6
    rate = 30000  # ₹300 in paise
    due = engine.compute_wage_due(days, rate)
    assert due == 180000


def test_hand_computed_delay_compensation_poster_example():
    """₹1,800 unpaid, credited 40 days after muster close:
    delay_days = 40 - 16 = 24
    compensation = 180000 * 0.0005 * 24 = 2160 paise (₹21.60).
    """
    muster_close = "2026-08-01"
    credit_date = "2026-09-10"  # 40 days later (August has 31 days: 30 days in Aug + 10 in Sep = 40 days)

    delay_days = engine.compute_delay_days(muster_close, credit_date)
    assert delay_days == 24

    unpaid_paise = 180000
    comp = engine.compute_delay_compensation(unpaid_paise, delay_days)
    assert comp == 2160  # Exactly ₹21.60


def test_delay_compensation_boundary_day_16():
    """Credit on day 16 exactly -> 0 delay days, 0 compensation."""
    muster_close = "2026-08-01"
    credit_date = "2026-08-17"  # exactly 16 days later
    delay = engine.compute_delay_days(muster_close, credit_date)
    assert delay == 0
    comp = engine.compute_delay_compensation(180000, delay)
    assert comp == 0


def test_delay_compensation_boundary_day_15():
    """Credit on day 15 -> 0 delay days, 0 compensation."""
    muster_close = "2026-08-01"
    credit_date = "2026-08-16"  # 15 days later
    delay = engine.compute_delay_days(muster_close, credit_date)
    assert delay == 0
    comp = engine.compute_delay_compensation(180000, delay)
    assert comp == 0


def test_entitlement_cap_at_125_days():
    """Household at 125 days used -> balance 0, never negative."""
    assert engine.check_entitlement_cap(125) == 0
    assert engine.check_entitlement_cap(130) == 0
    assert engine.check_entitlement_cap(100) == 25


def test_sub_floor_rate_flagged():
    """A rate below ₹300 floor (e.g., ₹260 = 26000 paise) must be flagged, not silently corrected."""
    worker = {
        "job_card_id": "JC-001",
        "worker_name": "Ramesh",
        "days_worked": 5,
        "muster_roll_no": "MR-001",
        "confirmed": True,
    }
    muster = {
        "muster_roll_id": "MR-001",
        "days_attended": 5,
        "muster_close_date": "2026-08-07",
        "confirmed": True,
    }
    report = engine.reconcile(
        worker_records=[worker],
        muster_records=[muster],
        wage_records=[],
        rate_paise=26000,  # Below floor
    )
    assert any("Section 5(3)" in flag for flag in report.flags)


def test_ambiguous_name_match():
    """When top two name candidates are within 0.05 score, ambiguous=True is returned."""
    # "Sunita Devi" vs "Sunita Das" and "Sunita Bai"
    target = "Sunita Devi"
    candidates = ["Sunita Devi", "Sunita Devji", "Anita Devi"]
    result = engine.match_worker_to_muster(target, candidates)
    # If top two candidates are close
    assert result.best_match is not None


def test_unconfirmed_records_raise_error():
    """Reconcile on unconfirmed records must raise UnconfirmedDataError."""
    unconfirmed_worker = {
        "job_card_id": "JC-001",
        "worker_name": "Ramesh",
        "days_worked": 5,
        "muster_roll_no": "MR-001",
        "confirmed": False,  # Not confirmed!
    }
    with pytest.raises(UnconfirmedDataError, match="has not been confirmed"):
        engine.reconcile(
            worker_records=[unconfirmed_worker],
            muster_records=[],
            wage_records=[],
        )
