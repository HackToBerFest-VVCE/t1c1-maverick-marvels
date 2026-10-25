#!/usr/bin/env python3
"""Synthetic document generator for Saakshi evaluation dataset.
Generates 30 synthetic documents across Hindi, Marathi, Tamil, and English:
  - Job cards (handwritten + print mix)
  - Bank passbook pages
  - Muster roll printouts
  - Worksite Citizen Information boards
Seeds known discrepancies: missing muster days, late payment credit, rate underpayment.
Ground truth JSON is written alongside each generated image into data/synthetic/.
ALL DATA IS STRICTLY SYNTHETIC AND FICTIONAL.
"""

import json
import os
import random
from PIL import Image, ImageDraw, ImageFont

SYNTHETIC_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "synthetic")
os.makedirs(SYNTHETIC_DIR, exist_ok=True)

# Select font supporting Devanagari & Tamil
FONT_PATH = "C:/Windows/Fonts/Nirmala.ttc"
if not os.path.exists(FONT_PATH):
    FONT_PATH = "C:/Windows/Fonts/arial.ttf"

def get_font(size: int = 14, bold: bool = False):
    try:
        return ImageFont.truetype(FONT_PATH, size)
    except Exception:
        return ImageFont.load_default()

BASE_DOCUMENTS = [
    {
        "id": "doc_01_hi_jc",
        "doc_type": "job_card",
        "language": "Hindi",
        "is_handwritten": True,
        "seeded_error": "none",
        "fields": {
            "job_card_id": "UP-12-004-019-001/1042",
            "worker_name": "रामलाल बंशीधर शर्मा",
            "father_husband_name": "बंशीधर शर्मा",
            "village_panchayat": "रामपुर (Rampur)",
            "days_worked": 6,
            "muster_roll_no": "MR-2026-1042",
            "work_period_start": "2026-08-01",
            "work_period_end": "2026-08-07",
            "wage_rate_paise": 30000,
        },
    },
    {
        "id": "doc_02_mr_jc",
        "doc_type": "job_card",
        "language": "Marathi",
        "is_handwritten": True,
        "seeded_error": "missing_muster_days",
        "fields": {
            "job_card_id": "MH-04-002-019-001/4218",
            "worker_name": "कमलाबाई रामचंद्र जाधव",
            "father_husband_name": "रामचंद्र जाधव",
            "village_panchayat": "बोरगाव (Borgaon)",
            "days_worked": 6,
            "muster_roll_no": "MR-2026-0819",
            "work_period_start": "2026-08-01",
            "work_period_end": "2026-08-07",
            "wage_rate_paise": 30000,
        },
    },
    {
        "id": "doc_03_mr_mr",
        "doc_type": "muster_roll",
        "language": "Marathi",
        "is_handwritten": False,
        "seeded_error": "missing_muster_days",
        "fields": {
            "muster_roll_id": "MR-2026-0819",
            "worker_name": "कमलाबाई रामचंद्र जाधव",
            "job_card_id": "MH-04-002-019-001/4218",
            "days_attended": 0,
            "muster_close_date": "2026-08-07",
            "total_wage_credited_paise": 0,
        },
    },
    {
        "id": "doc_04_mr_pb",
        "doc_type": "passbook",
        "language": "Marathi",
        "is_handwritten": False,
        "seeded_error": "late_credit_40_days",
        "fields": {
            "account_number": "XXXX-XXXX-9842",
            "account_holder_name": "Kamlabai R Jadhav",
            "transaction_date": "2026-09-16",
            "amount_credited_paise": 0,
            "narration": "NO CREDIT FOUND",
        },
    },
    {
        "id": "doc_05_ta_jc",
        "doc_type": "job_card",
        "language": "Tamil",
        "is_handwritten": True,
        "seeded_error": "late_credit_40_days",
        "fields": {
            "job_card_id": "TN-07-003-011-002/8821",
            "worker_name": "முருகன் சண்முகம்",
            "father_husband_name": "சண்முகம்",
            "village_panchayat": "அன்னூர் (Annur)",
            "days_worked": 8,
            "muster_roll_no": "MR-2026-8821",
            "work_period_start": "2026-07-10",
            "work_period_end": "2026-07-18",
            "wage_rate_paise": 30000,
        },
    },
    {
        "id": "doc_06_en_board",
        "doc_type": "worksite_board",
        "language": "English",
        "is_handwritten": False,
        "seeded_error": "none",
        "fields": {
            "work_code": "VB-2026-004-9102",
            "work_name": "Desilting of Borgaon Irrigation Canal",
            "sanctioned_date": "2026-06-15",
            "notified_daily_rate_paise": 30000,
            "total_person_days_sanctioned": 1200,
        },
    },
]

DOCUMENTS = list(BASE_DOCUMENTS)

# Generate up to 30 documents
NAMES_HI = ["सुरेश कुमार यादव", "मंजू देवी", "राजेश अहिरवार", "मीना कुमारी", "दीपक वर्मा", "संतोष पाल"]
NAMES_MR = ["ज्ञानेश्वर एकनाथ शिंदे", "सुनीता विलास पवार", "बाळू तुकाराम गायकवाड", "संगीता मारुती कदम"]
NAMES_TA = ["செல்வம் ராமசாமி", "கவிதா சுப்பிரமணியன்", "முத்துவேல் பாண்டியன்", "அன்பரசி செல்வம்"]
NAMES_EN = ["Ramesh Kumar", "Anitha Devi", "Sunil Gowda", "Pooja Sharma", "Bikash Das", "Geeta Rao"]

LANGS = ["Hindi", "Marathi", "Tamil", "English"]
DOC_TYPES = ["job_card", "passbook", "muster_roll", "worksite_board"]

for i in range(7, 31):
    lang = LANGS[i % 4]
    doc_type = DOC_TYPES[i % 4]
    is_hw = (i % 2 == 1)
    has_err = (i % 3 == 0)

    if lang == "Hindi":
        name = NAMES_HI[i % len(NAMES_HI)]
        panchayat = f"ग्राम पंचायत रामपुर-{i}"
    elif lang == "Marathi":
        name = NAMES_MR[i % len(NAMES_MR)]
        panchayat = f"ग्राम पंचायत बोरगाव-{i}"
    elif lang == "Tamil":
        name = NAMES_TA[i % len(NAMES_TA)]
        panchayat = f"கிராம பஞ்சாயத்து அன்னூர்-{i}"
    else:
        name = NAMES_EN[i % len(NAMES_EN)]
        panchayat = f"Gram Panchayat Section-{i}"

    err_type = "none"
    if has_err:
        err_type = ["missing_muster_days", "late_credit_40_days", "rate_underpayment"][i % 3]

    if doc_type == "job_card":
        fields = {
            "job_card_id": f"IN-0{i % 9}-001-002-003/{1000 + i}",
            "worker_name": name,
            "father_husband_name": f"Guardian of {name[:8]}",
            "village_panchayat": panchayat,
            "days_worked": 5 + (i % 7),
            "muster_roll_no": f"MR-2026-{2000 + i}",
            "work_period_start": f"2026-08-01",
            "work_period_end": f"2026-08-0{7 + (i % 3)}",
            "wage_rate_paise": 30000 if err_type != "rate_underpayment" else 28000,
        }
    elif doc_type == "passbook":
        fields = {
            "account_number": f"XXXX-XXXX-{8000 + i}",
            "account_holder_name": name,
            "transaction_date": f"2026-09-{10 + (i % 15):02d}",
            "amount_credited_paise": 0 if err_type == "missing_muster_days" else (5 + (i % 7)) * 30000,
            "narration": "NO CREDIT FOUND" if err_type == "missing_muster_days" else "VB-G RAM G WAGE CREDIT",
        }
    elif doc_type == "muster_roll":
        fields = {
            "muster_roll_id": f"MR-2026-{2000 + i}",
            "worker_name": name,
            "job_card_id": f"IN-0{i % 9}-001-002-003/{1000 + i}",
            "days_attended": 0 if err_type == "missing_muster_days" else 5 + (i % 7),
            "muster_close_date": "2026-08-07",
            "total_wage_credited_paise": 0 if err_type == "missing_muster_days" else (5 + (i % 7)) * 30000,
        }
    else:  # worksite_board
        fields = {
            "work_code": f"VB-2026-00{(i % 9) + 1}-{9000 + i}",
            "work_name": f"Rural Pond Deepening Project {i}",
            "sanctioned_date": "2026-05-20",
            "notified_daily_rate_paise": 30000,
            "total_person_days_sanctioned": 800 + (i * 20),
        }

    DOCUMENTS.append({
        "id": f"doc_{i:02d}_{lang[:2].lower()}_{doc_type[:2]}",
        "doc_type": doc_type,
        "language": lang,
        "is_handwritten": is_hw,
        "seeded_error": err_type,
        "fields": fields,
    })


def render_document_image(doc: dict, output_path: str):
    width, height = 700, 440
    bg_color = (252, 250, 246) if not doc["is_handwritten"] else (248, 245, 238)
    img = Image.new("RGB", (width, height), color=bg_color)
    draw = ImageDraw.Draw(img)

    border_color = (30, 36, 44)
    draw.rectangle([(10, 10), (width - 10, height - 10)], outline=border_color, width=2)
    draw.rectangle([(14, 14), (width - 14, height - 14)], outline=(180, 185, 190), width=1)
    draw.line([(10, 65), (width - 10, 65)], fill=border_color, width=2)

    font_header = get_font(18, bold=True)
    font_sub = get_font(12)
    font_label = get_font(13, bold=True)
    font_val = get_font(14)
    font_hw = get_font(14)

    draw.text((24, 20), "GOVERNMENT OF INDIA — VB-G RAM G OFFICIAL RECORD", fill=(15, 39, 64), font=font_header)
    draw.text((24, 45), f"Document ID: {doc['id']} | Type: {doc['doc_type'].upper()} | Language: {doc['language']}", fill=(80, 85, 95), font=font_sub)

    y = 85
    fields = doc["fields"]

    for label_key, val in fields.items():
        formatted_label = label_key.replace("_", " ").title() + ":"
        draw.text((26, y), formatted_label, fill=(40, 45, 55), font=font_label)

        val_str = str(val)
        if label_key.endswith("_paise") and isinstance(val, int):
            val_str = f"₹{val // 100} ({val} paise)"

        text_color = (15, 20, 28)
        val_font = font_val

        if doc["is_handwritten"] and label_key in ("worker_name", "days_worked", "village_panchayat", "father_husband_name"):
            # Blue-black or sepia ballpoint ink simulation for handwritten fields
            text_color = (20, 45, 110)
            val_font = font_hw

        draw.text((240, y), val_str, fill=text_color, font=val_font)
        draw.line([(24, y + 24), (width - 24, y + 24)], fill=(225, 228, 232), width=1)
        y += 32

    if doc["is_handwritten"]:
        draw.text((width - 220, height - 36), "✍ Verified & Signed", fill=(140, 70, 15), font=font_sub)

    img.save(output_path, format="JPEG", quality=92)


def generate_documents():
    print(f"Generating {len(DOCUMENTS)} synthetic documents & ground truth in {SYNTHETIC_DIR}...")
    for doc in DOCUMENTS:
        img_path = os.path.join(SYNTHETIC_DIR, f"{doc['id']}.jpg")
        json_path = os.path.join(SYNTHETIC_DIR, f"{doc['id']}.json")

        render_document_image(doc, img_path)

        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(doc, f, indent=2, ensure_ascii=False)

    print(f"Generated {len(DOCUMENTS)} documents successfully.")


if __name__ == "__main__":
    generate_documents()
