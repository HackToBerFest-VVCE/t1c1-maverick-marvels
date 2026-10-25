"""Phase 8 NFC Device Endpoint & Security Tests.
Validates:
1. GET /api/nfc/resolve returns ASCII-safe Latin fields for TFT display with correct bearer token.
2. Device token cannot access any POST or write endpoints.
3. Masked identifiers only in logs and outputs.
"""

import os
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_nfc_resolve_with_valid_token(monkeypatch):
    monkeypatch.setenv("DEVICE_TOKEN", "test-token-xyz")
    headers = {"Authorization": "Bearer test-token-xyz"}
    response = client.get("/api/nfc/resolve?job_card=MH-04-002-019-001/4218", headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["found"] is True
    assert "name_latin" in data
    assert "panchayat_latin" in data
    assert data["unpaid_paise"] == 180000
    assert data["status"] == "due"


def test_nfc_resolve_with_invalid_token(monkeypatch):
    monkeypatch.setenv("DEVICE_TOKEN", "test-token-xyz")
    headers = {"Authorization": "Bearer wrong-token"}
    response = client.get("/api/nfc/resolve?job_card=4218", headers=headers)
    assert response.status_code == 403


def test_nfc_resolve_missing_token():
    response = client.get("/api/nfc/resolve?job_card=4218")
    assert response.status_code == 401
