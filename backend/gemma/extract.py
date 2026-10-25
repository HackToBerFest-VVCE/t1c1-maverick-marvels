"""Document Extraction Engine using Gemma 4 26B vision model.
- Model: gemma-4-26b-a4b-it
- Cache: SHA-256 hash of image bytes to prevent redundant API hits
- Repair: Exactly one automatic repair attempt on schema validation failure
- Enforces strict Pydantic v2 schemas
"""

import hashlib
import json
from typing import Any, Dict, Union

from backend.gemma.client import generate
from backend.gemma.prompts import build_folded_turn
from backend.gemma.schemas import (
    JobCardPage,
    MusterRollRow,
    PassbookPage,
    WageListRow,
    WorksiteBoard,
)

SCHEMA_MAP = {
    "job_card": JobCardPage,
    "passbook": PassbookPage,
    "worksite_board": WorksiteBoard,
    "muster_roll": MusterRollRow,
    "wage_list": WageListRow,
}

_EXTRACTION_CACHE: Dict[str, Any] = {}


def clean_json_text(raw_text: str) -> str:
    """Strip markdown code fence blocks if present."""
    text = raw_text.strip()
    if text.startswith("```json"):
        text = text[7:]
    elif text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    return text.strip()


def extract(image_bytes: bytes, doc_type: str = "job_card") -> Union[
    JobCardPage, PassbookPage, WorksiteBoard, MusterRollRow, WageListRow
]:
    """Extract structured data from a document image using Gemma 4 26B.
    Checks SHA-256 cache first to avoid re-hitting the API for identical images.
    Attempts one JSON schema repair pass on parse failure.
    """
    if doc_type not in SCHEMA_MAP:
        raise ValueError(f"Unknown doc_type: {doc_type}. Must be one of {list(SCHEMA_MAP.keys())}")

    target_schema = SCHEMA_MAP[doc_type]

    cache_key = f"{doc_type}:{hashlib.sha256(image_bytes).hexdigest()}"
    if cache_key in _EXTRACTION_CACHE:
        return _EXTRACTION_CACHE[cache_key]

    prompt_turn = build_folded_turn(doc_type)

    raw_output = generate(
        model_id="gemma-4-26b-a4b-it",
        prompt=prompt_turn,
        image_bytes=image_bytes,
        endpoint_name=f"extract/{doc_type}",
        thinking_level="minimal",
        max_output_tokens=2048,
        response_mime_type="application/json",
    )

    clean_output = clean_json_text(raw_output)

    try:
        data_dict = json.loads(clean_output)
        validated = target_schema.model_validate(data_dict)
        _EXTRACTION_CACHE[cache_key] = validated
        return validated
    except Exception as first_err:
        repair_prompt = (
            f"The following JSON failed validation for schema {target_schema.__name__}:\n"
            f"Error: {str(first_err)}\n\n"
            f"Raw JSON was:\n{clean_output}\n\n"
            f"Please output strictly corrected valid JSON matching the schema requirements without comments or markdown."
        )
        repaired_raw = generate(
            model_id="gemma-4-26b-a4b-it",
            prompt=repair_prompt,
            endpoint_name=f"extract/{doc_type}/repair",
            max_output_tokens=2048,
            response_mime_type="application/json",
        )
        repaired_clean = clean_json_text(repaired_raw)
        try:
            repaired_dict = json.loads(repaired_clean)
            validated = target_schema.model_validate(repaired_dict)
            _EXTRACTION_CACHE[cache_key] = validated
            return validated
        except Exception as second_err:
            raise ValueError(
                f"Document extraction validation failed after repair.\n"
                f"Error: {str(second_err)}\n"
                f"Raw output: {repaired_clean}"
            )
