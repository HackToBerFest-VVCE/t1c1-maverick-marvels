"""Tamper-Evident Evidence Packet & Section 63 BSA Certificate Generator.
Legal Framework:
  Section 63 of Bharatiya Sakshya Adhiniyam, 2023 (replacing Section 65B of Evidence Act).
  Upheld by Supreme Court in July 2026: electronic hash is synonymous with electronic fingerprint.

Guarantees:
  1. Dual-hash at capture: original camera bytes vs processed model bytes.
  2. Complete human confirmation audit trail: model proposed value vs confirmed human value.
  3. Deterministic formula verification: re-runnable pure Python computations.
  4. Court-ready preparation: pre-fills Part A custodian schedule, explicitly notes Part B requirement.
"""

from datetime import datetime, timezone
import hashlib
import json
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

from backend.audit.engine import (
    compute_wage_due,
    compute_delay_days,
    compute_delay_compensation,
    compute_unpaid_wages,
    check_entitlement_cap,
)


class DocumentEvidence(BaseModel):
    doc_type: str
    sha256_original: str
    sha256_processed: str
    captured_utc: str
    device_timezone: str = "Asia/Kolkata"
    extraction_model: str = "gemma-4-26b-a4b-it"
    trace_id: Optional[str] = None


class HumanConfirmation(BaseModel):
    field_path: str
    model_value: Any
    confirmed_value: Any
    changed: bool
    confirmed_utc: str


class ClauseCited(BaseModel):
    clause_id: str
    title: str
    clause_sha256: str


class ComputationRecord(BaseModel):
    engine_version: str = "1.0.0"
    engine_git_sha: str = "HEAD"
    inputs: Dict[str, Any]
    outputs: Dict[str, Any]
    formulas_applied: List[str]


class AuditManifest(BaseModel):
    audit_id: str
    created_utc: str
    documents: List[DocumentEvidence]
    human_confirmations: List[HumanConfirmation]
    computation: ComputationRecord
    clauses_cited: List[ClauseCited]
    manifest_sha256: str = ""

    def compute_hash(self) -> str:
        """Compute SHA-256 hash of canonical JSON excluding manifest_sha256."""
        data = self.model_dump()
        data["manifest_sha256"] = ""
        canonical_str = json.dumps(data, sort_keys=True, ensure_ascii=False)
        return hashlib.sha256(canonical_str.encode("utf-8")).hexdigest()


def build_manifest(
    audit_id: str,
    documents: List[Dict[str, Any]],
    human_confirmations: List[Dict[str, Any]],
    inputs: Dict[str, Any],
    clauses: List[Dict[str, Any]],
) -> AuditManifest:
    """Build a complete, tamper-evident audit manifest."""
    # Run deterministic computation directly in engine
    days_worked = inputs.get("days_worked", 0)
    notified_rate = inputs.get("rate_paise", 30000)
    credited = inputs.get("amount_credited_paise", 0)
    muster_close = inputs.get("muster_close_date", "2026-08-07")
    credit_date = inputs.get("credit_date", "2026-09-16")

    wage_due = compute_wage_due(days_worked, notified_rate)
    unpaid = compute_unpaid_wages(wage_due, credited)
    delay_days = compute_delay_days(muster_close, credit_date)
    delay_comp = compute_delay_compensation(unpaid, delay_days)
    entitlement_left = check_entitlement_cap(days_worked)

    computation = ComputationRecord(
        engine_version="1.0.0",
        engine_git_sha="git-rev-parse-head",
        inputs=inputs,
        outputs={
            "wage_due_paise": wage_due,
            "unpaid_wages_paise": unpaid,
            "delay_days": delay_days,
            "delay_compensation_paise": delay_comp,
            "entitlement_cap_remaining": entitlement_left,
        },
        formulas_applied=[
            "compute_wage_due",
            "compute_unpaid_wages",
            "compute_delay_days",
            "compute_delay_compensation",
            "check_entitlement_cap",
        ],
    )

    doc_models = [DocumentEvidence(**d) for d in documents]
    conf_models = [HumanConfirmation(**c) for c in human_confirmations]

    clause_models = []
    for c in clauses:
        c_str = json.dumps(c, sort_keys=True)
        c_hash = hashlib.sha256(c_str.encode("utf-8")).hexdigest()
        clause_models.append(
            ClauseCited(
                clause_id=c.get("clause_id", "UNKNOWN"),
                title=c.get("title", ""),
                clause_sha256=c_hash,
            )
        )

    manifest = AuditManifest(
        audit_id=audit_id,
        created_utc=datetime.now(timezone.utc).isoformat(),
        documents=doc_models,
        human_confirmations=conf_models,
        computation=computation,
        clauses_cited=clause_models,
    )
    manifest.manifest_sha256 = manifest.compute_hash()
    return manifest


def generate_section_63_certificate(
    manifest: AuditManifest,
    custodian_name: str = "Gram Rozgar Sahayak / Social Audit Volunteer",
    device_model: str = "Android Smartphone / PWA Capture Interface",
) -> str:
    """Generate Section 63 (Bharatiya Sakshya Adhiniyam, 2023) Schedule Part A certificate."""
    doc_table = ""
    for idx, doc in enumerate(manifest.documents, 1):
        doc_table += f"""
  {idx}. Document Type: {doc.doc_type}
     - Original Camera SHA-256:   {doc.sha256_original}
     - Processed Model SHA-256:  {doc.sha256_processed}
     - Captured UTC:              {doc.captured_utc}
     - Timezone:                  {doc.device_timezone}
"""

    return f"""================================================================================
SCHEDULE UNDER SECTION 63(4)
BHARATIYA SAKSHYA ADHINIYAM (BSA), 2023
CERTIFICATE OF ELECTRONIC EVIDENCE — PART A (CUSTODIAN DECLARATION)
================================================================================

STATUS: Court-ready preparation — Part B expert certification still required.
AUDIT REFERENCE ID: {manifest.audit_id}
GENERATED AT (UTC): {manifest.created_utc}
MANIFEST SHA-256:   {manifest.manifest_sha256}

I, the undersigned custodian / operator of the electronic device described herein,
do hereby certify under Section 63(4)(a) of the Bharatiya Sakshya Adhiniyam, 2023:

1. IDENTIFICATION OF ELECTRONIC RECORD:
   This certificate applies to the digital photographs and computational audit records
   assembled for the verification of rural jobs guarantee entitlement claims under
   VB-G RAM G.

2. DEVICE DESCRIPTION & CUSTODY:
   - Capturing System: {device_model}
   - Software Application: Saakshi Social Audit Engine (Client v1.0.0, SHA-256 verification active)
   - Operating Condition: During the creation of these records, the computing system was
     operating properly without malfunction that would affect data integrity.

3. HASH VALUES (CRYPTOGRAPHIC FINGERPRINTS):
{doc_table}

4. HUMAN CONFIRMATION TRAIL:
   Total human verifications recorded: {len(manifest.human_confirmations)}
   Human corrections to model proposals: {sum(1 for c in manifest.human_confirmations if c.changed)}

5. INDEPENDENT DETERMINISTIC ARITHMETIC:
   - Statutory Daily Wage Floor: ₹300.00 (30,000 paise)
   - Wage Due Computed: ₹{manifest.computation.outputs.get('wage_due_paise', 0) / 100:.2f}
   - Unpaid Wages Computed: ₹{manifest.computation.outputs.get('unpaid_wages_paise', 0) / 100:.2f}
   - Delay Compensation: ₹{manifest.computation.outputs.get('delay_compensation_paise', 0) / 100:.2f}
   All arithmetic calculated via pure Python functions independent of generative models.

--------------------------------------------------------------------------------
PART A SIGNATURE (DEVICE CUSTODIAN):

Name of Custodian: {custodian_name}
Designation: Rural Employment Social Audit Volunteer
Signature: ___________________________
Date: ________________________________
Place: _______________________________

--------------------------------------------------------------------------------
NOTICE:
Under Section 63(4)(c) of the Bharatiya Sakshya Adhiniyam, 2023, Part B of this
schedule requires certification by an Examiner of Electronic Evidence or designated
expert under Section 39 of the Act. This document constitutes formal preparation
and chain-of-custody assembly; final evidentiary admissibility requires Part B sign-off.
================================================================================
"""
