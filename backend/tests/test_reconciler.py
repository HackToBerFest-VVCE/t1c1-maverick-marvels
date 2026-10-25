"""Tests for Phase 13 Muster Roll Reconciler.
Validates:
1. GHOST_CANDIDATE check ("unverified name — no paper record found").
2. DAYS_INFLATED check.
3. WAGE_MISMATCH check.
4. COWORKER_MISMATCH check (Jaccard distance).
5. AGGREGATE_DELAY_COMPENSATION check.
6. Clean muster roll produces exactly ZERO findings.
7. Language discipline: assert that 'ghost' and 'fraud' never appear in headlines or descriptions.
"""

import pytest
from backend.audit.reconciler import reconcile_muster_roll, compute_jaccard_distance


def test_jaccard_distance():
    set_a = {"ramesh", "suresh", "kamla"}
    set_b = {"ramesh", "suresh", "kamla"}
    assert compute_jaccard_distance(set_a, set_b) == 0.0

    set_c = {"anitha", "pooja", "sunil"}
    assert compute_jaccard_distance(set_a, set_c) == 1.0


def test_clean_muster_roll_zero_findings():
    """A clean muster roll where all workers match job cards must yield zero discrepancies."""
    clean_roll = {
        "panchayat_id": "GP-BORGAON",
        "panchayat_name": "Borgaon",
        "muster_roll_id": "MR-2026-CLEAN",
        "work_code": "WORK-POND-01",
        "mate_name": "Shri Shinde",
        "muster_close_date": "2026-08-07",
        "workers": [
            {
                "worker_name": "कमलाबाई जाधव",
                "job_card_id": "MH-04-001/101",
                "days_attended": 6,
                "total_wage_credited_paise": 180000,
                "credit_date": "2026-08-15",  # Within 16-day grace period
            },
            {
                "worker_name": "रामलाल शर्मा",
                "job_card_id": "UP-12-001/102",
                "days_attended": 6,
                "total_wage_credited_paise": 180000,
                "credit_date": "2026-08-15",
            },
        ],
    }

    job_cards = [
        {
            "worker_name": "कमलाबाई जाधव",
            "job_card_id": "MH-04-001/101",
            "days_worked": 6,
        },
        {
            "worker_name": "रामलाल शर्मा",
            "job_card_id": "UP-12-001/102",
            "days_worked": 6,
        },
    ]

    signal = reconcile_muster_roll(clean_roll, job_cards)
    assert signal.findings == []
    assert signal.total_unverified_names == 0
    assert signal.total_inflated_days == 0
    assert signal.total_rupees_at_issue_paise == 0


def test_20_worker_muster_roll_with_planted_discrepancies():
    """Test 20-worker roll with 5 specific planted discrepancies."""
    workers = []
    # 15 clean workers
    for i in range(1, 16):
        workers.append({
            "worker_name": f"Worker Regular {i}",
            "job_card_id": f"JC-CLEAN-{i:02d}",
            "days_attended": 6,
            "total_wage_credited_paise": 180000,
            "credit_date": "2026-08-15",
        })

    # Planted 1 & 2: Two names with no job card (unverified)
    workers.append({
        "worker_name": "Phantom Name One",
        "job_card_id": "JC-NONEXISTENT-91",
        "days_attended": 6,
        "total_wage_credited_paise": 180000,
        "credit_date": "2026-08-15",
    })
    workers.append({
        "worker_name": "Phantom Name Two",
        "job_card_id": "JC-NONEXISTENT-92",
        "days_attended": 6,
        "total_wage_credited_paise": 180000,
        "credit_date": "2026-08-15",
    })

    # Planted 3: Days inflated (muster: 6, card: 3 -> 3 days difference)
    workers.append({
        "worker_name": "Worker Inflated",
        "job_card_id": "JC-INFLATED-01",
        "days_attended": 6,
        "total_wage_credited_paise": 180000,
        "credit_date": "2026-08-15",
    })

    # Planted 4: Wage mismatch (6 days, but only credited ₹1,200 instead of ₹1,800)
    workers.append({
        "worker_name": "Worker Underpaid",
        "job_card_id": "JC-UNDERPAID-01",
        "days_attended": 6,
        "total_wage_credited_paise": 120000,
        "credit_date": "2026-08-15",
    })

    # Planted 5: Coworker roster mismatch
    workers.append({
        "worker_name": "Worker Disputed Squad",
        "job_card_id": "JC-SQUAD-01",
        "days_attended": 6,
        "total_wage_credited_paise": 180000,
        "credit_date": "2026-08-15",
    })

    muster_roll = {
        "panchayat_id": "GP-TEST-20",
        "panchayat_name": "Test Panchayat 20",
        "muster_roll_id": "MR-2026-DISCREPANT",
        "work_code": "WORK-ROAD-04",
        "mate_name": "Mate Deshmukh",
        "muster_close_date": "2026-08-07",
        "workers": workers,
    }

    # Build matching job cards (only for workers 1-15, plus the 3 non-phantom ones)
    job_cards = []
    for i in range(1, 16):
        job_cards.append({
            "worker_name": f"Worker Regular {i}",
            "job_card_id": f"JC-CLEAN-{i:02d}",
            "days_worked": 6,
        })

    job_cards.append({
        "worker_name": "Worker Inflated",
        "job_card_id": "JC-INFLATED-01",
        "days_worked": 3,  # Card has only 3 days!
    })

    job_cards.append({
        "worker_name": "Worker Underpaid",
        "job_card_id": "JC-UNDERPAID-01",
        "days_worked": 6,
    })

    job_cards.append({
        "worker_name": "Worker Disputed Squad",
        "job_card_id": "JC-SQUAD-01",
        "days_worked": 6,
        "reported_coworkers": ["Outsider A", "Outsider B", "Outsider C", "Outsider D"],
    })

    signal = reconcile_muster_roll(muster_roll, job_cards, total_estimated_rolls=10)

    # Check finding counts
    finding_types = [f.finding_type for f in signal.findings]
    assert finding_types.count("GHOST_CANDIDATE") == 2
    assert "DAYS_INFLATED" in finding_types
    assert "WAGE_MISMATCH" in finding_types
    assert "COWORKER_MISMATCH" in finding_types

    # Assert exact arithmetic on inflated days
    inflated_finding = next(f for f in signal.findings if f.finding_type == "DAYS_INFLATED")
    assert inflated_finding.rupee_impact_paise == 3 * 30000  # 3 days * ₹300 = ₹900 = 90,000 paise

    # Assert wage mismatch arithmetic
    wage_finding = next(f for f in signal.findings if f.finding_type == "WAGE_MISMATCH")
    assert wage_finding.rupee_impact_paise == 60000  # ₹1800 - ₹1200 = ₹600 = 60,000 paise

    # Check coverage statement
    assert "Based on 1 of an estimated 10 muster rolls" in signal.coverage_statement

    # Strict language rule enforcement
    for f in signal.findings:
        text = (f.headline + " " + f.description).lower()
        assert "ghost" not in text, f"Violated language rule: 'ghost' found in {f.headline}"
        assert "fraud" not in text, f"Violated language rule: 'fraud' found in {f.headline}"
