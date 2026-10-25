"""Deterministic Arithmetic & Format Validators for Saakshi.
Zero model calls, zero network requests, pure Python.
Validates extracted document data against statutory and mathematical constraints.
A validator failure triggers mandatory human review regardless of model confidence.
"""

from datetime import date
import re
from typing import Any, Dict, List, Optional
from pydantic import BaseModel


class ValidationResult(BaseModel):
    is_valid: bool
    flag_reason: Optional[str] = None  # "LOW_CONFIDENCE", "VALIDATOR_FAILED", "UNVERIFIED_RECORD"
    field_name: str
    message: str
    statutory_clause: Optional[str] = None


JOB_CARD_REGEX = re.compile(r"^[A-Z]{2}-\d{2}-\d{3}-\d{3}-\d{3}/\d+$")


def validate_job_card_format(job_card_id: Optional[str]) -> ValidationResult:
    """Validate that Job Card ID conforms to official State-District-Block-Panchayat-Village/ID pattern."""
    if not job_card_id or not str(job_card_id).strip():
        return ValidationResult(
            is_valid=False,
            flag_reason="VALIDATOR_FAILED",
            field_name="job_card_id",
            message="Missing Job Card ID. Format requires XX-XX-XXX-XXX-XXX/XXXX.",
            statutory_clause="SCH_I_PARA_1",
        )
    clean_id = str(job_card_id).strip().upper()
    if not JOB_CARD_REGEX.match(clean_id):
        return ValidationResult(
            is_valid=False,
            flag_reason="VALIDATOR_FAILED",
            field_name="job_card_id",
            message=f"Job Card ID '{clean_id}' does not match standard pattern XX-XX-XXX-XXX-XXX/XXXX.",
            statutory_clause="SCH_I_PARA_1",
        )
    return ValidationResult(is_valid=True, field_name="job_card_id", message="Job Card ID format is valid.")


def validate_wage_math(days_worked: int, wage_rate_paise: int, total_claimed_paise: int) -> ValidationResult:
    """Validate: days_worked * wage_rate_paise == total_claimed_paise."""
    if days_worked < 0 or wage_rate_paise < 0:
        return ValidationResult(
            is_valid=False,
            flag_reason="VALIDATOR_FAILED",
            field_name="wage_rate_paise",
            message="Days worked or wage rate cannot be negative.",
        )
    expected_paise = days_worked * wage_rate_paise
    if expected_paise != total_claimed_paise:
        diff_paise = abs(expected_paise - total_claimed_paise)
        return ValidationResult(
            is_valid=False,
            flag_reason="VALIDATOR_FAILED",
            field_name="wage_rate_paise",
            message=(
                f"Arithmetic discrepancy: {days_worked} days × ₹{wage_rate_paise / 100:.2f} = "
                f"₹{expected_paise / 100:.2f}, but document claims ₹{total_claimed_paise / 100:.2f} (diff ₹{diff_paise / 100:.2f})."
            ),
            statutory_clause="SEC_5_3_RATE_FLOOR",
        )
    return ValidationResult(is_valid=True, field_name="wage_rate_paise", message="Wage arithmetic matches exactly.")


def validate_days_vs_period(days_worked: int, period_start: str, period_end: str) -> ValidationResult:
    """Validate that days_worked <= calendar days between work_period_start and work_period_end."""
    try:
        d_start = date.fromisoformat(period_start)
        d_end = date.fromisoformat(period_end)
    except Exception:
        return ValidationResult(
            is_valid=False,
            flag_reason="VALIDATOR_FAILED",
            field_name="days_worked",
            message=f"Invalid date format: start={period_start}, end={period_end}.",
        )
    calendar_days = (d_end - d_start).days + 1
    if calendar_days <= 0:
        return ValidationResult(
            is_valid=False,
            flag_reason="VALIDATOR_FAILED",
            field_name="work_period_end",
            message=f"Work period end date {period_end} precedes start date {period_start}.",
        )
    if days_worked > calendar_days:
        return ValidationResult(
            is_valid=False,
            flag_reason="VALIDATOR_FAILED",
            field_name="days_worked",
            message=f"Days worked ({days_worked}) exceeds calendar duration of period ({calendar_days} days).",
            statutory_clause="SCH_II_PARA_6",
        )
    return ValidationResult(is_valid=True, field_name="days_worked", message="Days worked is within calendar period bounds.")


def validate_payment_sequence(muster_close_date: str, credit_date: str) -> ValidationResult:
    """Validate that credit_date >= muster_close_date (cannot credit payment before work closes)."""
    try:
        d_close = date.fromisoformat(muster_close_date)
        d_credit = date.fromisoformat(credit_date)
    except Exception:
        return ValidationResult(
            is_valid=False,
            flag_reason="VALIDATOR_FAILED",
            field_name="credit_date",
            message="Invalid date format in close date or credit date.",
        )
    if d_credit < d_close:
        return ValidationResult(
            is_valid=False,
            flag_reason="VALIDATOR_FAILED",
            field_name="credit_date",
            message=f"Chronological anomaly: Credit date {credit_date} is before muster close date {muster_close_date}.",
            statutory_clause="SCH_II_PARA_6",
        )
    return ValidationResult(is_valid=True, field_name="credit_date", message="Payment chronological sequence is valid.")


def validate_extracted_document(doc_type: str, fields: Dict[str, Any]) -> List[ValidationResult]:
    """Run all applicable deterministic validators over an extracted document."""
    results: List[ValidationResult] = []

    if doc_type == "job_card":
        jc_id = fields.get("job_card_id")
        results.append(validate_job_card_format(jc_id))

        days = fields.get("days_worked")
        start_d = fields.get("work_period_start")
        end_d = fields.get("work_period_end")
        if days is not None and start_d and end_d:
            try:
                results.append(validate_days_vs_period(int(days), str(start_d), str(end_d)))
            except Exception:
                pass

        rate = fields.get("wage_rate_paise")
        if rate is not None:
            try:
                if int(rate) < 30000:
                    results.append(
                        ValidationResult(
                            is_valid=False,
                            flag_reason="VALIDATOR_FAILED",
                            field_name="wage_rate_paise",
                            message=f"Recorded daily wage rate ₹{int(rate)/100:.2f} is below statutory ₹300.00 floor.",
                            statutory_clause="SEC_5_3_RATE_FLOOR",
                        )
                    )
            except Exception:
                pass

    return [r for r in results if not r.is_valid]
