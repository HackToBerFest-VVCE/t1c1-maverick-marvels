"""Prompt templates for Gemma 4 document extraction.
Strictly adheres to:
1. Folded system instructions into first turn (per PROBE-RESULT.md).
2. JSON structure matching backend.gemma.schemas.
3. Instructing null on illegible fields rather than guessing.
4. Strictly forbidding arithmetic, totaling, or inference (AI reads, code computes).
"""

EXTRACTION_SYSTEM_INSTRUCTION = """You are Saakshi's document extraction engine for Indian rural jobs guarantee (VB-G RAM G) papers.
Your single job is to transcribe visual text from the document image into structured JSON.
CRITICAL RULES:
1. NEVER calculate, total, subtract, or infer any numbers. Emit ONLY what is visually printed or handwritten on the paper.
2. For any field where the handwriting or print is smudged, torn, or illegible, set value to null. Do NOT guess.
3. Assign a realistic confidence score between 0.0 and 1.0 for each field:
   - 0.95+ for clear printed text
   - 0.70-0.85 for clear handwriting
   - <0.70 for faint, smudged, or ambiguous characters
4. Provide a crop_ref bounding box for each field as [ymin, xmin, ymax, xmax] scaled 0 to 1000.
5. All monetary amounts must be reported in integer PAISE (₹1 = 100 paise; ₹300 = 30000 paise).
6. Dates must be formatted as ISO strings YYYY-MM-DD.
7. Return raw valid JSON only without markdown formatting.
"""

JOB_CARD_PROMPT = """Analyze this Indian Rural Employment Guarantee (VB-G RAM G) Worker Job Card document image.
IMPORTANT: This is a Government of India rural welfare employment record, NOT a vehicle repair or mechanic job order.
Extract its fields according to this exact JSON format:
{
  "document_type": "job_card",
  "job_card_id": {"value": "<string or null>", "confidence": <float>, "crop_ref": [<int>, <int>, <int>, <int>]},
  "worker_name": {"value": "<string or null>", "confidence": <float>, "crop_ref": [<int>, <int>, <int>, <int>]},
  "father_husband_name": {"value": "<string or null>", "confidence": <float>, "crop_ref": [<int>, <int>, <int>, <int>]},
  "village_panchayat": {"value": "<string or null>", "confidence": <float>, "crop_ref": [<int>, <int>, <int>, <int>]},
  "days_worked": {"value": "<int or null>", "confidence": <float>, "crop_ref": [<int>, <int>, <int>, <int>]},
  "muster_roll_no": {"value": "<string or null>", "confidence": <float>, "crop_ref": [<int>, <int>, <int>, <int>]},
  "work_period_start": {"value": "<YYYY-MM-DD or null>", "confidence": <float>, "crop_ref": [<int>, <int>, <int>, <int>]},
  "work_period_end": {"value": "<YYYY-MM-DD or null>", "confidence": <float>, "crop_ref": [<int>, <int>, <int>, <int>]},
  "wage_rate_paise": {"value": <int or 30000>, "confidence": <float>, "crop_ref": [<int>, <int>, <int>, <int>]}
}
Remember: Transcribe only what is written on the document. Do not invent mechanical parts or forklift repairs."""

PASSBOOK_PROMPT = """Analyze this Bank Passbook transaction page image and extract fields:
{
  "document_type": "passbook",
  "account_number": {"value": "<string or null>", "confidence": <float>, "crop_ref": [<int>, <int>, <int>, <int>]},
  "account_holder_name": {"value": "<string or null>", "confidence": <float>, "crop_ref": [<int>, <int>, <int>, <int>]},
  "transaction_date": {"value": "<YYYY-MM-DD or null>", "confidence": <float>, "crop_ref": [<int>, <int>, <int>, <int>]},
  "amount_credited_paise": {"value": "<int paise or null>", "confidence": <float>, "crop_ref": [<int>, <int>, <int>, <int>]},
  "narration": {"value": "<string or null>", "confidence": <float>, "crop_ref": [<int>, <int>, <int>, <int>]}
}"""

WORKSITE_BOARD_PROMPT = """Analyze this Worksite Citizen Information Board image and extract fields:
{
  "document_type": "worksite_board",
  "work_code": {"value": "<string or null>", "confidence": <float>, "crop_ref": [<int>, <int>, <int>, <int>]},
  "work_name": {"value": "<string or null>", "confidence": <float>, "crop_ref": [<int>, <int>, <int>, <int>]},
  "sanctioned_date": {"value": "<YYYY-MM-DD or null>", "confidence": <float>, "crop_ref": [<int>, <int>, <int>, <int>]},
  "notified_daily_rate_paise": {"value": <int paise or 30000>, "confidence": <float>, "crop_ref": [<int>, <int>, <int>, <int>]},
  "total_person_days_sanctioned": {"value": <int or null>, "confidence": <float>, "crop_ref": [<int>, <int>, <int>, <int>]}
}"""

MUSTER_ROLL_PROMPT = """Analyze this Muster Roll document and extract the worker's attendance record:
{
  "document_type": "muster_roll",
  "muster_roll_id": {"value": "<string or null>", "confidence": <float>, "crop_ref": [<int>, <int>, <int>, <int>]},
  "worker_name": {"value": "<string or null>", "confidence": <float>, "crop_ref": [<int>, <int>, <int>, <int>]},
  "job_card_id": {"value": "<string or null>", "confidence": <float>, "crop_ref": [<int>, <int>, <int>, <int>]},
  "days_attended": {"value": <int or null>, "confidence": <float>, "crop_ref": [<int>, <int>, <int>, <int>]},
  "muster_close_date": {"value": "<YYYY-MM-DD or null>", "confidence": <float>, "crop_ref": [<int>, <int>, <int>, <int>]},
  "total_wage_credited_paise": {"value": <int paise or 0>, "confidence": <float>, "crop_ref": [<int>, <int>, <int>, <int>]}
}"""

WAGE_LIST_PROMPT = """Analyze this Wage List / FTO document row and extract fields:
{
  "document_type": "wage_list",
  "wage_list_no": {"value": "<string or null>", "confidence": <float>, "crop_ref": [<int>, <int>, <int>, <int>]},
  "job_card_id": {"value": "<string or null>", "confidence": <float>, "crop_ref": [<int>, <int>, <int>, <int>]},
  "worker_name": {"value": "<string or null>", "confidence": <float>, "crop_ref": [<int>, <int>, <int>, <int>]},
  "credit_date": {"value": "<YYYY-MM-DD or null>", "confidence": <float>, "crop_ref": [<int>, <int>, <int>, <int>]},
  "amount_paise": {"value": <int paise or null>, "confidence": <float>, "crop_ref": [<int>, <int>, <int>, <int>]},
  "payment_status": {"value": "<Processed/Rejected/Pending or null>", "confidence": <float>, "crop_ref": [<int>, <int>, <int>, <int>]}
}"""

PROMPTS = {
    "job_card": JOB_CARD_PROMPT,
    "passbook": PASSBOOK_PROMPT,
    "worksite_board": WORKSITE_BOARD_PROMPT,
    "muster_roll": MUSTER_ROLL_PROMPT,
    "wage_list": WAGE_LIST_PROMPT,
}


def build_folded_turn(doc_type: str) -> str:
    """Build single user turn with system instructions folded in."""
    type_prompt = PROMPTS.get(doc_type, JOB_CARD_PROMPT)
    return f"[SYSTEM INSTRUCTION]\n{EXTRACTION_SYSTEM_INSTRUCTION}\n\n[USER REQUEST]\n{type_prompt}"
