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
