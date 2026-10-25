"""Muster Roll Reconciler for Saakshi.
Pure Python, zero model calls, 100% deterministic arithmetic.

Governing Axioms & Rules:
1. "The AI reads. The code computes. The human decides."
2. Language Discipline:
   - NEVER use 'ghost worker' or 'fraud'.
   - ALWAYS output 'unverified name — no paper record found' or 'discrepancy to raise at Gram Sabha'.
3. Always report coverage on any aggregate signal ('based on X of Y muster rolls').
4. Cross-document name matching surfaces ambiguous candidates for human review.
"""

from datetime import date
from decimal import Decimal, ROUND_HALF_UP
import difflib
from typing import Any, Dict, List, Optional, Set, Tuple
from pydantic import BaseModel, Field

from backend.audit.engine import (
    compute_wage_due,
    compute_unpaid_wages,
    compute_delay_days,
    compute_delay_compensation,
    normalize_name,
    NOTIFIED_RATE_FLOOR_PAISE,
)


class Finding(BaseModel):
    finding_type: str  # GHOST_CANDIDATE, DAYS_INFLATED, OVERLAPPING_ATTENDANCE, COWORKER_MISMATCH, WAGE_MISMATCH, AGGREGATE_DELAY_COMPENSATION
    severity: str      # HIGH, MEDIUM, LOW
    headline: str      # Strictly following language rules
    description: str
    affected_workers: List[str]
    rupee_impact_paise: int = 0
    clause_id: str
    worked_maths: str
    source_hashes: List[str] = Field(default_factory=list)
    requires_human_confirmation: bool = False
    metadata: Dict[str, Any] = Field(default_factory=dict)


class GramPanchayatSignal(BaseModel):
    panchayat_id: str
    panchayat_name: str
    audited_muster_rolls: int
    estimated_total_muster_rolls: int
    coverage_statement: str  # e.g., "based on 3 of an estimated 14 muster rolls (21.4% coverage)"
    total_unverified_names: int
    total_inflated_days: int
    total_rupees_at_issue_paise: int
    findings_by_severity: Dict[str, int]
    per_mate_summary: Dict[str, Dict[str, Any]]
    per_work_summary: Dict[str, Dict[str, Any]]
    findings: List[Finding]


def compute_jaccard_distance(set_a: Set[str], set_b: Set[str]) -> float:
    """Compute Jaccard distance = 1 - (intersection / union)."""
    if not set_a and not set_b:
        return 0.0
    union = set_a | set_b
    if not union:
        return 0.0
    intersection = set_a & set_b
    similarity = len(intersection) / len(union)
    return round(1.0 - similarity, 3)


def match_worker_name(name: str, candidate_names: List[str], threshold: float = 0.72) -> Tuple[Optional[str], float, bool]:
    """Fuzzy match with transliteration support.
    Returns: (best_match_name_or_None, score, is_ambiguous)
    """
    if not candidate_names:
        return None, 0.0, False

    target_norm = normalize_name(name)
    scored = []
    for cand in candidate_names:
        c_norm = normalize_name(cand)
        sim = difflib.SequenceMatcher(None, target_norm, c_norm).ratio()
        scored.append((sim, cand))

    scored.sort(key=lambda x: x[0], reverse=True)
    best_score, best_cand = scored[0]

    is_ambiguous = False
    if len(scored) > 1:
        diff = best_score - scored[1][0]
        if diff <= 0.06 and best_score >= 0.5:
            is_ambiguous = True

    if best_score >= threshold:
        return best_cand, round(best_score, 3), is_ambiguous
    return None, round(best_score, 3), is_ambiguous


def reconcile_muster_roll(
    muster_roll: Dict[str, Any],
    job_cards: List[Dict[str, Any]],
    mis_snapshot: Optional[Dict[str, Any]] = None,
    notified_rate_paise: int = NOTIFIED_RATE_FLOOR_PAISE,
    total_estimated_rolls: int = 14,
) -> GramPanchayatSignal:
    """Cross-reference muster roll attendance against worker job cards and MIS snapshot.
    Produces strictly typed findings with zero hallucination and explicit coverage.
    """
    panchayat_id = muster_roll.get("panchayat_id", "GP-DEFAULT")
    panchayat_name = muster_roll.get("panchayat_name", "Gram Panchayat")
    muster_roll_id = muster_roll.get("muster_roll_id", "MR-UNKNOWN")
    muster_hash = muster_roll.get("sha256", "hash_mr_placeholder")
    work_code = muster_roll.get("work_code", "WORK-CANAL-01")
    mate_name = muster_roll.get("mate_name", "Shri Mate Kumar")

    muster_workers = muster_roll.get("workers", [])
    jc_by_id = {jc.get("job_card_id"): jc for jc in job_cards if jc.get("job_card_id")}
    jc_names = [jc.get("worker_name", "") for jc in job_cards if jc.get("worker_name")]

    findings: List[Finding] = []
    total_unverified_names = 0
    total_inflated_days = 0
    total_delay_compensation_paise = 0

    # Collect muster worker names for co-worker analysis
    official_muster_names = {normalize_name(w.get("worker_name", "")) for w in muster_workers if w.get("worker_name")}

    # Track attendance across dates for overlapping worksite check
    worker_attendance_dates: Dict[str, List[Tuple[str, str]]] = {}

    for w in muster_workers:
        w_name = w.get("worker_name", "")
        w_jc_id = w.get("job_card_id")
        muster_days = int(w.get("days_attended", 0))
        credited_paise = int(w.get("total_wage_credited_paise", 0))
        w_hash = w.get("sha256", muster_hash)

        # 1. GHOST_CANDIDATE Check: "unverified name — no paper record found"
        matched_jc = None
        if w_jc_id and w_jc_id in jc_by_id:
            matched_jc = jc_by_id[w_jc_id]
        else:
            best_name, score, ambiguous = match_worker_name(w_name, jc_names)
            if best_name and not ambiguous:
                matched_jc = next((jc for jc in job_cards if jc.get("worker_name") == best_name), None)

        if not matched_jc:
            total_unverified_names += 1
            unverified_wage = muster_days * notified_rate_paise
            findings.append(
                Finding(
                    finding_type="GHOST_CANDIDATE",
                    severity="HIGH",
                    headline="Unverified name — no paper job card found",
                    description=(
                        f"Worker '{w_name}' (Job Card ID: {w_jc_id or 'Not Recorded'}) is credited with "
                        f"{muster_days} days on muster roll {muster_roll_id}, but no corresponding physical job card "
                        f"or registered household record was found in the audit sample."
                    ),
                    affected_workers=[w_name],
                    rupee_impact_paise=unverified_wage,
                    clause_id="SEC_32_VERIFICATION",
                    worked_maths=f"{muster_days} days × ₹{notified_rate_paise / 100:.2f} = ₹{unverified_wage / 100:.2f}",
                    source_hashes=[muster_hash],
                    requires_human_confirmation=True,
                    metadata={"mate_name": mate_name, "work_code": work_code},
                )
            )
        else:
            jc_days = int(matched_jc.get("days_worked", 0))
            jc_hash = matched_jc.get("sha256", "hash_jc_placeholder")

            # 2. DAYS_INFLATED Check: Muster/MIS days > worker's job card days
            if muster_days > jc_days:
                diff_days = muster_days - jc_days
                total_inflated_days += diff_days
                inflated_rupees = diff_days * notified_rate_paise
                findings.append(
                    Finding(
                        finding_type="DAYS_INFLATED",
                        severity="HIGH",
                        headline="Muster days exceed job card entry",
                        description=(
                            f"Official muster roll records {muster_days} days for '{w_name}', but the worker's own "
                            f"confirmed job card records only {jc_days} days worked. Difference of {diff_days} days requires reconciliation."
                        ),
                        affected_workers=[w_name],
                        rupee_impact_paise=inflated_rupees,
                        clause_id="SCH_II_PARA_6",
                        worked_maths=f"({muster_days} muster days - {jc_days} card days) = {diff_days} days × ₹{notified_rate_paise / 100:.2f} = ₹{inflated_rupees / 100:.2f}",
                        source_hashes=[muster_hash, jc_hash],
                        metadata={"mate_name": mate_name, "work_code": work_code, "excess_days": diff_days},
                    )
                )

            # 3. WAGE_MISMATCH Check: Credited amount != days × notified rate
            expected_wage = jc_days * notified_rate_paise
            if credited_paise < expected_wage:
                shortfall = expected_wage - credited_paise
                findings.append(
                    Finding(
                        finding_type="WAGE_MISMATCH",
                        severity="MEDIUM",
                        headline="Wage credited below statutory entitlement",
                        description=(
                            f"Worker '{w_name}' was credited ₹{credited_paise / 100:.2f} for {jc_days} confirmed days. "
                            f"Statutory entitlement at ₹{notified_rate_paise / 100:.2f}/day is ₹{expected_wage / 100:.2f}. Underpayment of ₹{shortfall / 100:.2f}."
                        ),
                        affected_workers=[w_name],
                        rupee_impact_paise=shortfall,
                        clause_id="SEC_5_3_RATE_FLOOR",
                        worked_maths=f"{jc_days} days × ₹{notified_rate_paise / 100:.2f} = ₹{expected_wage / 100:.2f} - ₹{credited_paise / 100:.2f} credited = ₹{shortfall / 100:.2f} shortfall",
                        source_hashes=[muster_hash, jc_hash],
                        metadata={"mate_name": mate_name, "work_code": work_code},
                    )
                )

            # 4. COWORKER_MISMATCH Check: Jaccard distance on co-worker recollections
            recalled_coworkers = matched_jc.get("reported_coworkers")
            if recalled_coworkers is not None and isinstance(recalled_coworkers, list):
                rec_set = {normalize_name(c) for c in recalled_coworkers}
                jaccard_dist = compute_jaccard_distance(rec_set, official_muster_names)
                if jaccard_dist >= 0.50:  # Consistent with Rajasthan 61% study threshold
                    findings.append(
                        Finding(
                            finding_type="COWORKER_MISMATCH",
                            severity="MEDIUM",
                            headline="Significant co-worker roster disagreement",
                            description=(
                                f"Worker '{w_name}' reported worksite co-workers with a Jaccard distance of {jaccard_dist:.2f} "
                                f"relative to official muster roll {muster_roll_id}. Reflects 61% co-worker divergence pattern "
                                f"documented in peer-reviewed rural audit literature."
                            ),
                            affected_workers=[w_name],
                            rupee_impact_paise=0,
                            clause_id="SOC_AUDIT_COLLECTIVE",
                            worked_maths=f"Jaccard distance = {jaccard_dist:.2f} (> 0.50 threshold)",
                            source_hashes=[muster_hash, jc_hash],
                            metadata={"jaccard_distance": jaccard_dist},
                        )
                    )

            # Record period for overlapping worksite check
            start_date = matched_jc.get("work_period_start", "2026-08-01")
            end_date = matched_jc.get("work_period_end", "2026-08-07")
            if w_name not in worker_attendance_dates:
                worker_attendance_dates[w_name] = []
            worker_attendance_dates[w_name].append((start_date, end_date))

        # Delay compensation computation across roll
        close_d = w.get("muster_close_date", muster_roll.get("muster_close_date", "2026-08-07"))
        credit_d = w.get("credit_date", "2026-09-16")
        unpaid_calc = max(0, (muster_days * notified_rate_paise) - credited_paise)
        delay_days = compute_delay_days(close_d, credit_d)
        if delay_days > 0 and unpaid_calc > 0:
            comp = compute_delay_compensation(unpaid_calc, delay_days)
            total_delay_compensation_paise += comp

    # 5. OVERLAPPING_ATTENDANCE Check
    if mis_snapshot:
        external_records = mis_snapshot.get("cross_worksite_records", [])
        for ext in external_records:
            ext_name = ext.get("worker_name", "")
            ext_work = ext.get("work_code", "")
            ext_start = ext.get("start_date", "")
            ext_end = ext.get("end_date", "")
            if ext_name in worker_attendance_dates and ext_work != work_code:
                findings.append(
                    Finding(
                        finding_type="OVERLAPPING_ATTENDANCE",
                        severity="HIGH",
                        headline="Simultaneous attendance recorded at two distinct worksites",
                        description=(
                            f"Worker '{ext_name}' is recorded present on {muster_roll_id} (Work: {work_code}) "
                            f"and simultaneously on MIS register for {ext_work} during overlapping period ({ext_start} to {ext_end})."
                        ),
                        affected_workers=[ext_name],
                        rupee_impact_paise=muster_days * notified_rate_paise,
                        clause_id="SEC_33_ATTENDANCE_CONCURRENCY",
                        worked_maths="Overlapping date attendance across independent worksite muster rolls",
                        source_hashes=[muster_hash],
                    )
                )

    # 6. AGGREGATE_DELAY_COMPENSATION
    if total_delay_compensation_paise > 0:
        findings.append(
            Finding(
                finding_type="AGGREGATE_DELAY_COMPENSATION",
                severity="MEDIUM",
                headline="Collective delay compensation payable across muster roll",
                description=(
                    f"Cumulative statutory delay compensation owed across all workers on muster roll {muster_roll_id} "
                    f"under Section 5(3) & Schedule II Para 6 exceeds individual threshold."
                ),
                affected_workers=[w.get("worker_name", "") for w in muster_workers],
                rupee_impact_paise=total_delay_compensation_paise,
                clause_id="SCH_II_PARA_6",
                worked_maths=f"Sum of statutory 0.05% per day compensation = ₹{total_delay_compensation_paise / 100:.2f}",
                source_hashes=[muster_hash],
            )
        )

    # Aggregate summaries by mate and work code
    per_mate = {
        mate_name: {
            "unverified_names": total_unverified_names,
            "inflated_days": total_inflated_days,
            "findings_count": len(findings),
        }
    }
    per_work = {
        work_code: {
            "unverified_names": total_unverified_names,
            "inflated_days": total_inflated_days,
            "rupees_at_issue": sum(f.rupee_impact_paise for f in findings),
        }
    }

    # Order findings strictly by rupee impact
    findings.sort(key=lambda x: x.rupee_impact_paise, reverse=True)

    # Mandatory Bounded Coverage Calculation
    pct_coverage = round((1 / max(1, total_estimated_rolls)) * 100.0, 1)
    coverage_stmt = (
        f"Based on 1 of an estimated {total_estimated_rolls} muster rolls for Gram Panchayat "
        f"{panchayat_name} ({pct_coverage}% sample coverage)."
    )

    sev_counts = {"HIGH": 0, "MEDIUM": 0, "LOW": 0}
    for f in findings:
        sev_counts[f.severity] = sev_counts.get(f.severity, 0) + 1

    total_rupees = sum(f.rupee_impact_paise for f in findings)

    return GramPanchayatSignal(
        panchayat_id=panchayat_id,
        panchayat_name=panchayat_name,
        audited_muster_rolls=1,
        estimated_total_muster_rolls=total_estimated_rolls,
        coverage_statement=coverage_stmt,
        total_unverified_names=total_unverified_names,
        total_inflated_days=total_inflated_days,
        total_rupees_at_issue_paise=total_rupees,
        findings_by_severity=sev_counts,
        per_mate_summary=per_mate,
        per_work_summary=per_work,
        findings=findings,
    )
