"""Phase 0 Setup Tests.
Verifies backend scaffolding, no-key import of backend.audit, and /health response.
"""

import os
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_health_check():
    """GET /health must return 200 and {'status': 'ok'}."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_audit_import_without_api_key(monkeypatch):
    """backend/audit must import cleanly with GEMINI_API_KEY unset."""
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    assert "GEMINI_API_KEY" not in os.environ

    # Importing backend.audit must not raise any error
    import backend.audit
    assert backend.audit is not None
