"""Pydantic v2 schemas for Gemma 4 extracted document types.
Document types: JobCardPage, PassbookPage, WorksiteBoard, MusterRollRow, WageListRow.
Every extracted field carries:
  - value: Typed data (or None if illegible/missing)
  - confidence: float between 0.0 and 1.0
  - crop_ref: normalized bounding box [ymin, xmin, ymax, xmax] (0-1000 scale) for image highlight
Money amounts are strictly integer paise (e.g., ₹300 = 30000 paise).
Dates are ISO format strings (YYYY-MM-DD).
"""

from typing import Generic, List, Optional, TypeVar
from pydantic import BaseModel, Field

T = TypeVar("T")


class ExtractedField(BaseModel, Generic[T]):
    value: Optional[T] = None
    confidence: float = Field(default=1.0, ge=0.0, le=1.0)
    crop_ref: Optional[List[int]] = Field(
        default=None,
        description="Region of image [ymin, xmin, ymax, xmax] scaled 0..1000",
    )
    confirmed: bool = False  # Human verification status gate


# 1. Job Card Page
class JobCardPage(BaseModel):
    document_type: str = "job_card"
    job_card_id: ExtractedField[str] = Field(description="Full Job Card identifier, masked in UI")
    worker_name: ExtractedField[str] = Field(description="Worker's name in document script")
    father_husband_name: ExtractedField[str] = Field(description="Relation's name")
    village_panchayat: ExtractedField[str] = Field(description="Gram Panchayat name")
    days_worked: ExtractedField[int] = Field(description="Number of days worked recorded on card")
    muster_roll_no: ExtractedField[str] = Field(description="Muster roll number reference")
    work_period_start: ExtractedField[str] = Field(description="ISO date start of period")
    work_period_end: ExtractedField[str] = Field(description="ISO date end of period")
    wage_rate_paise: ExtractedField[int] = Field(
        default_factory=lambda: ExtractedField[int](value=30000, confidence=1.0),
        description="Daily wage rate in integer paise (floor ₹300 = 30000 paise)",
    )


# 2. Bank Passbook Page
class PassbookPage(BaseModel):
    document_type: str = "passbook"
    account_number: ExtractedField[str] = Field(description="Account number (masked in UI)")
    account_holder_name: ExtractedField[str] = Field(description="Account holder name")
    transaction_date: ExtractedField[str] = Field(description="ISO date money was credited")
    amount_credited_paise: ExtractedField[int] = Field(description="Amount credited in integer paise")
    narration: ExtractedField[str] = Field(description="Transaction narration/reference")


# 3. Worksite Board
class WorksiteBoard(BaseModel):
    document_type: str = "worksite_board"
    work_code: ExtractedField[str] = Field(description="Sanctioned work code")
    work_name: ExtractedField[str] = Field(description="Name/description of the work project")
    sanctioned_date: ExtractedField[str] = Field(description="Date work was sanctioned")
    notified_daily_rate_paise: ExtractedField[int] = Field(description="Official daily wage rate in paise")
    total_person_days_sanctioned: ExtractedField[int] = Field(description="Total person days sanctioned")


# 4. Muster Roll Row
class MusterRollRow(BaseModel):
    document_type: str = "muster_roll"
    muster_roll_id: ExtractedField[str] = Field(description="Official muster roll reference ID")
    worker_name: ExtractedField[str] = Field(description="Worker name on muster roll")
    job_card_id: ExtractedField[str] = Field(description="Job card number on muster roll")
    days_attended: ExtractedField[int] = Field(description="Days marked present on official roll")
    muster_close_date: ExtractedField[str] = Field(description="Date muster roll was closed")
    total_wage_credited_paise: ExtractedField[int] = Field(description="Wages credited in paise")


# 5. Wage List Row
class WageListRow(BaseModel):
    document_type: str = "wage_list"
    wage_list_no: ExtractedField[str] = Field(description="FTO / Wage List number")
    job_card_id: ExtractedField[str] = Field(description="Job Card ID")
    worker_name: ExtractedField[str] = Field(description="Worker name")
    credit_date: ExtractedField[str] = Field(description="Date credited into bank account")
    amount_paise: ExtractedField[int] = Field(description="Amount paid in integer paise")
    payment_status: ExtractedField[str] = Field(description="Processed / Rejected / Pending")
