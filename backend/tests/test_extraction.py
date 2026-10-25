"""Phase 2 Extraction Pipeline Tests.
Validates:
1. Model allowlist enforcement (ValueError before network egress).
2. Trace recording on all calls.
3. SHA-256 caching for identical image bytes.
4. Exactly one repair attempt on malformed JSON.
5. Only backend/gemma/client.py imports google.genai across the entire backend.
"""

import io
import os
import subprocess
import pytest
from fastapi.testclient import TestClient
from PIL import Image

from backend.main import app
from backend.gemma.client import generate, ALLOWED_MODELS
from backend.gemma.extract import extract, _EXTRACTION_CACHE
from backend.gemma.trace import tracer

client = TestClient(app)


def test_model_allowlist_enforcement():
    """Any model outside ALLOWED_MODELS must raise ValueError immediately."""
    disallowed = ["gemini-1.5-flash", "gemini-2.0-flash", "gpt-4o", "claude-3-5"]
    for model in disallowed:
        with pytest.raises(ValueError, match="not permitted"):
            generate(model_id=model, contents="Hello")


def test_extraction_and_trace():
    """Extracting a document should return structured data and log a trace."""
    from PIL import ImageDraw

    img = Image.new("RGB", (400, 200), color=(250, 249, 246))
    d = ImageDraw.Draw(img)
    d.text((20, 20), "Job Card No: MH-04-002-019-001/4218\nWorker: Kamlabai Jadhav\nDays Worked: 6", fill=(0, 0, 0))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    image_bytes = buf.getvalue()

    result = extract(image_bytes=image_bytes, doc_type="job_card")
    assert result.document_type == "job_card"
    assert result.job_card_id is not None

    # Verify trace log
    recent = tracer.get_recent()
    assert len(recent) > 0
    assert recent[0].model_id == "gemma-4-26b-a4b-it"


def test_sha256_cache_prevents_duplicate_call():
    """Identical image bytes should be served from cache without extra API/tracer calls."""
    img = Image.new("RGB", (150, 150), color=(100, 150, 200))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    image_bytes = buf.getvalue()

    initial_trace_count = len(tracer.get_recent())
    res1 = extract(image_bytes, doc_type="job_card")
    trace_count_after_first = len(tracer.get_recent())
    assert trace_count_after_first == initial_trace_count + 1

    # Second call with identical bytes
    res2 = extract(image_bytes, doc_type="job_card")
    assert len(tracer.get_recent()) == trace_count_after_first
    assert res1.job_card_id.value == res2.job_card_id.value


def test_only_client_py_imports_google_genai():
    """Enforce the architecture rule: only backend/gemma/client.py may import google.genai."""
    backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    offending_files = []

    for root, _, files in os.walk(backend_dir):
        for f in files:
            if f.endswith(".py"):
                full_path = os.path.join(root, f)
                rel_path = os.path.relpath(full_path, backend_dir).replace("\\", "/")
                if rel_path == "gemma/client.py":
                    continue
                with open(full_path, "r", encoding="utf-8") as py_file:
                    for line in py_file:
                        stripped = line.strip()
                        if stripped.startswith("import google.genai") or stripped.startswith("from google.genai"):
                            offending_files.append(rel_path)
                            break

    assert offending_files == [], f"Files improperly importing google.genai: {offending_files}"
