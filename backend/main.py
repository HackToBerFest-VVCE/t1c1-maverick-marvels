"""Saakshi FastAPI Backend Application.
Deterministic audit, Gemma 4 extraction, and multilingual drafting for VB-G RAM G.
"""

import os
from typing import Any, Dict, List, Optional
from fastapi import Depends, FastAPI, File, Form, Header, HTTPException, Query, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.audit import engine
from backend.audit.engine import UnconfirmedDataError
from backend.gemma.client import generate
from backend.gemma.draft import draft_documents
from backend.gemma.extract import extract
from backend.gemma.orchestrator import orchestrate_audit
from backend.gemma.trace import TraceEntry, tracer

try:
    from indic_transliteration import sanscript
    from indic_transliteration.sanscript import transliterate
    HAS_TRANSLIT = True
except ImportError:
    HAS_TRANSLIT = False

app = FastAPI(
    title="Saakshi API",
    description="Deterministic audit & Gemma 4 extraction system for VB-G RAM G",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Security dependency for device token
def verify_device_token(authorization: Optional[str] = Header(None)):
    expected_token = os.environ.get("DEVICE_TOKEN", "demo-device-secret-123")
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    token = authorization.split("Bearer ", 1)[1].strip()
    if token != expected_token:
        raise HTTPException(status_code=403, detail="Invalid device token")
    return token


@app.get("/health")
def health_check():
    """Health check endpoint."""
    return {"status": "ok"}


@app.get("/api/trace", response_model=List[TraceEntry])
def get_traces():
    """Returns recent Gemma 4 call traces for the live dashboard panel."""
    return tracer.get_recent()


@app.post("/api/extract")
async def extract_document(
    file: UploadFile = File(...),
    doc_type: str = Form(default="job_card"),
):
    """Extract structured data from a document photo using Gemma 4 26B vision."""
    try:
        image_bytes = await file.read()
        if not image_bytes:
            raise HTTPException(status_code=400, detail="Empty file uploaded")

        validated_doc = extract(image_bytes=image_bytes, doc_type=doc_type)
        recent_traces = tracer.get_recent()
        latest_trace_id = recent_traces[0].id if recent_traces else "none"

        return {
            "status": "success",
            "doc_type": doc_type,
            "data": validated_doc.model_dump(),
            "trace_id": latest_trace_id,
        }
    except ValueError as val_err:
        raise HTTPException(status_code=422, detail=str(val_err))
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


class ReconcileRequest(BaseModel):
    worker_records: List[Dict[str, Any]]
    muster_records: List[Dict[str, Any]]
    wage_records: List[Dict[str, Any]] = []
    rate_paise: int = 30000
    use_orchestrator: bool = True


@app.post("/api/audit/reconcile")
def run_reconciliation(req: ReconcileRequest):
    """Run audit reconciliation.
    Gated by human confirmation: raises 422 if any record is unconfirmed.
    Runs Gemma 4 orchestrator tool loop or direct deterministic engine.
    """
    try:
        if req.use_orchestrator:
            result = orchestrate_audit(
                worker_records=req.worker_records,
                muster_records=req.muster_records,
                wage_records=req.wage_records,
                rate_paise=req.rate_paise,
            )
            return {"status": "success", **result}
        else:
            report = engine.reconcile(
                worker_records=req.worker_records,
                muster_records=req.muster_records,
                wage_records=req.wage_records,
                rate_paise=req.rate_paise,
            )
            return {"status": "success", "report": report.model_dump(), "orchestrated": False}
    except UnconfirmedDataError as unc_err:
        raise HTTPException(status_code=422, detail=str(unc_err))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class DraftRequest(BaseModel):
    audit_data: Dict[str, Any]
    language: str = "hi"


@app.post("/api/audit/draft")
def generate_drafts(req: DraftRequest):
    """Draft grievance, muster copies request, and Gram Sabha finding sheet in chosen language."""
    try:
        drafts = draft_documents(audit_data=req.audit_data, language=req.language)
        return {"status": "success", "drafts": drafts.model_dump()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Dashboard summary metrics
@app.get("/api/dashboard/stats")
def get_dashboard_stats():
    """Return the four primary stat tiles for the Social Audit view."""
    return {
        "workers_audited": 1284,
        "workers_delta": "+142 this cycle",
        "discrepancies_found": 86,
        "discrepancies_delta": "+12 vs prev cycle",
        "total_unpaid_paise": 184260000,  # ₹18,42,600 written in full
        "total_unpaid_rupees": "₹18,42,600",
        "unpaid_delta": "+₹2,14,200 identified",
        "grievances_filed": 42,
        "grievances_delta": "+8 submitted",
        "monthly_unpaid": [
            {"month": "May 2026", "amount_rupees": 210000, "label": "₹2,10,000"},
            {"month": "Jun 2026", "amount_rupees": 480000, "label": "₹4,80,000"},
            {"month": "Jul 2026", "amount_rupees": 390000, "label": "₹3,90,000"},
            {"month": "Aug 2026", "amount_rupees": 762600, "label": "₹7,62,600"},
        ],
        "discrepancies_by_type": [
            {"type": "Missing Muster Days", "count": 48, "color": "var(--series-1)"},
            {"type": "Delayed Payment (>16d)", "count": 22, "color": "var(--series-2)"},
            {"type": "Sub-floor Wage Rate", "count": 10, "color": "var(--series-3)"},
            {"type": "Name Transliteration Mismatch", "count": 4, "color": "var(--series-4)"},
            {"type": "Other Discrepancies", "count": 2, "color": "var(--series-other, #7c828c)"},
        ],
    }


@app.get("/api/dashboard/ledger")
def get_dashboard_ledger():
    """Return list of workers with open discrepancies for the Ledger Table."""
    return [
        {
            "id": "w1",
            "worker_name": "कमलाबाई रामचंद्र जाधव",
            "job_card_id": "MH-04-002-019-001/4218",
            "job_card_masked": "•••• 4218",
            "panchayat": "बोरगाव (Borgaon)",
            "days_missing": 6,
            "unpaid_paise": 180000,
            "unpaid_rupees": "₹1,800",
            "delay_comp_paise": 2160,
            "delay_comp_rupees": "₹21.60",
            "status": "due",
            "status_label": "Wages Due",
            "attention": True,
        },
        {
            "id": "w2",
            "worker_name": "संतोष बाळू म्हात्रे",
            "job_card_id": "MH-04-002-019-002/1092",
            "job_card_masked": "•••• 1092",
            "panchayat": "बोरगाव (Borgaon)",
            "days_missing": 4,
            "unpaid_paise": 120000,
            "unpaid_rupees": "₹1,200",
            "delay_comp_paise": 1080,
            "delay_comp_rupees": "₹10.80",
            "status": "due",
            "status_label": "Wages Due",
            "attention": True,
        },
        {
            "id": "w3",
            "worker_name": "आनंदीबाई ज्ञानेश्वर कांबळे",
            "job_card_id": "MH-04-002-019-003/7731",
            "job_card_masked": "•••• 7731",
            "panchayat": "शिंदेवाडी (Shindewadi)",
            "days_missing": 0,
            "unpaid_paise": 0,
            "unpaid_rupees": "₹0",
            "delay_comp_paise": 0,
            "delay_comp_rupees": "₹0.00",
            "status": "clear",
            "status_label": "Audited & Verified",
            "attention": False,
        },
        {
            "id": "w4",
            "worker_name": "प्रमोद तुकाराम साळुंखे",
            "job_card_id": "MH-04-002-019-004/3394",
            "job_card_masked": "•••• 3394",
            "panchayat": "वडगाव (Vadgaon)",
            "days_missing": 8,
            "unpaid_paise": 240000,
            "unpaid_rupees": "₹2,400",
            "delay_comp_paise": 3360,
            "delay_comp_rupees": "₹33.60",
            "status": "due",
            "status_label": "Wages Due",
            "attention": True,
        },
    ]


@app.get("/api/nfc/resolve")
def resolve_nfc_job_card(
    job_card: str = Query(..., description="Job Card number from NTAG213 card"),
    token: str = Depends(verify_device_token),
):
    """ESP32 / RC522 Reader endpoint.
    Protected by DEVICE_TOKEN bearer authentication.
    Returns ASCII-safe Latin fields for micro-controller TFT readout.
    """
    masked_card = f"•••• {job_card[-4:]}" if len(job_card) >= 4 else "••••"
    print(f"[NFC LOOKUP] Received reader tap for card: {masked_card}")

    # Standard demo card
    if "4218" in job_card:
        name_devanagari = "कमलाबाई रामचंद्र जाधव"
        panchayat_devanagari = "बोरगाव"
        name_latin = "Kamlabai R Jadhav"
        panchayat_latin = "Borgaon"

        if HAS_TRANSLIT:
            try:
                name_latin = transliterate(name_devanagari, sanscript.DEVANAGARI, sanscript.ITRANS)
                panchayat_latin = transliterate(panchayat_devanagari, sanscript.DEVANAGARI, sanscript.ITRANS)
            except Exception:
                pass

        return {
            "found": True,
            "job_card_masked": masked_card,
            "name_latin": "Kamlabai Jadhav",
            "panchayat_latin": "Borgaon",
            "unpaid_paise": 180000,
            "days_missing": 6,
            "status": "due",
        }

    return {
        "found": False,
        "job_card_masked": masked_card,
        "name_latin": "NOT FOUND",
        "panchayat_latin": "NOT ON FILE",
        "unpaid_paise": 0,
        "days_missing": 0,
        "status": "clear",
    }


# Phase 15: Gemma Runtime Provider Toggle Endpoints
@app.get("/api/gemma/provider")
def get_provider_endpoint():
    from backend.gemma.client import get_active_provider
    return {"active_provider": get_active_provider()}


class ProviderUpdateRequest(BaseModel):
    provider: str


@app.post("/api/gemma/provider")
def set_provider_endpoint(req: ProviderUpdateRequest):
    from backend.gemma.client import set_active_provider
    try:
        new_p = set_active_provider(req.provider)
        return {"status": "ok", "active_provider": new_p}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


# Phase 12: Evidence Packet & Section 63 BSA Certificate
@app.get("/api/audit/{audit_id}/evidence")
def get_evidence_endpoint(audit_id: str):
    from backend.evidence.manifest import build_manifest, generate_section_63_certificate
    from datetime import datetime, timezone

    sample_manifest_path = os.path.join(os.path.dirname(__file__), "..", "data", "synthetic", "sample_manifest.json")
    if os.path.exists(sample_manifest_path):
        with open(sample_manifest_path, "r", encoding="utf-8") as f:
            manifest_data = json.load(f)
        from backend.evidence.manifest import AuditManifest
        manifest = AuditManifest(**manifest_data)
    else:
        docs = [{
            "doc_type": "job_card",
            "sha256_original": "5dddb69a0442b1a2ce6a21e64906fe9df159c991c0e3a479268f7710b144fa50",
            "sha256_processed": "5dddb69a0442b1a2ce6a21e64906fe9df159c991c0e3a479268f7710b144fa50",
            "captured_utc": datetime.now(timezone.utc).isoformat(),
        }]
        confs = [{
            "field_path": "days_worked",
            "model_value": 6,
            "confirmed_value": 6,
            "changed": False,
            "confirmed_utc": datetime.now(timezone.utc).isoformat(),
        }]
        inputs = {"days_worked": 6, "rate_paise": 30000, "amount_credited_paise": 0, "muster_close_date": "2026-08-07", "credit_date": "2026-09-16"}
        clauses = [{"clause_id": "SEC_5_3", "title": "Statutory Wage Payment"}]
        manifest = build_manifest(audit_id, docs, confs, inputs, clauses)

    cert_text = generate_section_63_certificate(manifest)
    return {
        "manifest": manifest.model_dump(),
        "certificate_text": cert_text,
    }


# Phase 13: Muster Roll Cross-Reference Reconciler Endpoint
@app.get("/api/reconcile/{panchayat_id}")
def get_panchayat_reconciliation(panchayat_id: str):
    from backend.audit.reconciler import reconcile_muster_roll

    workers = []
    for i in range(1, 16):
        workers.append({
            "worker_name": f"कामगार {i} (Worker {i})",
            "job_card_id": f"MH-04-002-019/{1000 + i}",
            "days_attended": 6,
            "total_wage_credited_paise": 180000,
            "credit_date": "2026-08-15",
        })
    # 2 unverified names with no paper job card found
    workers.append({
        "worker_name": "रामकृष्ण दिनकर पाटील",
        "job_card_id": "MH-04-002-019/9901",
        "days_attended": 6,
        "total_wage_credited_paise": 180000,
        "credit_date": "2026-08-15",
    })
    workers.append({
        "worker_name": "सुभाष नारायण भोसले",
        "job_card_id": "MH-04-002-019/9902",
        "days_attended": 6,
        "total_wage_credited_paise": 180000,
        "credit_date": "2026-08-15",
    })
    # Real confirmed workers
    workers.append({
        "worker_name": "कमलाबाई रामचंद्र जाधव",
        "job_card_id": "MH-04-002-019-001/4218",
        "days_attended": 6,
        "total_wage_credited_paise": 0,
        "credit_date": "2026-09-16",
    })
    workers.append({
        "worker_name": "संतोष बाळू म्हात्रे",
        "job_card_id": "MH-04-002-019-002/1092",
        "days_attended": 8,
        "total_wage_credited_paise": 120000,
        "credit_date": "2026-08-15",
    })
    workers.append({
        "worker_name": "प्रमोद तुकाराम साळुंखे",
        "job_card_id": "MH-04-002-019-004/3394",
        "days_attended": 6,
        "total_wage_credited_paise": 180000,
        "credit_date": "2026-08-15",
    })

    muster_roll = {
        "panchayat_id": panchayat_id,
        "panchayat_name": "बोरगाव (Borgaon)",
        "muster_roll_id": "MR-2026-0819",
        "work_code": "VB-2026-004-9102",
        "mate_name": "ज्ञानदेव विठ्ठल शिंदे (Dnyandev Shinde)",
        "muster_close_date": "2026-08-07",
        "sha256": "4b82d92c730e18f2910d5402aa3928492095f93012847291a0293e8471928491",
        "workers": workers,
    }

    job_cards = []
    for i in range(1, 16):
        job_cards.append({
            "worker_name": f"कामगार {i} (Worker {i})",
            "job_card_id": f"MH-04-002-019/{1000 + i}",
            "days_worked": 6,
        })
    job_cards.append({
        "worker_name": "कमलाबाई रामचंद्र जाधव",
        "job_card_id": "MH-04-002-019-001/4218",
        "days_worked": 6,
        "sha256": "5dddb69a0442b1a2ce6a21e64906fe9df159c991c0e3a479268f7710b144fa50",
    })
    job_cards.append({
        "worker_name": "संतोष बाळू म्हात्रे",
        "job_card_id": "MH-04-002-019-002/1092",
        "days_worked": 4,  # Inflated by 4 days on roll
        "sha256": "3a84c901e827103a8f902183c749021a8f902381c0394819a8d902138a9b8192",
    })
    job_cards.append({
        "worker_name": "प्रमोद तुकाराम साळुंखे",
        "job_card_id": "MH-04-002-019-004/3394",
        "days_worked": 6,
        "reported_coworkers": ["Outsider Mate A", "Outsider Worker B", "Unknown Mate C"],
        "sha256": "91a82910c849102938a901238491028394a81920394819203948192039481920",
    })

    signal = reconcile_muster_roll(muster_roll, job_cards, total_estimated_rolls=14)
    return signal.model_dump()
