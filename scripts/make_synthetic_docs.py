#!/usr/bin/env python3
"""Synthetic document generator for Saakshi evaluation dataset.
Generates 30 synthetic documents across Hindi, Marathi, Tamil, and English:
  - Job cards (handwritten + print mix)
  - Bank passbook pages
  - Muster roll printouts
  - Worksite Citizen Information boards
Seeds known errors: missing muster entries, wrong day counts, late credit dates.
Ground truth JSON is written alongside each generated image into data/synthetic/.
ALL DATA IS STRICTLY SYNTHETIC AND FICTIONAL.
"""

import json
import os
from PIL import Image, ImageDraw, ImageFont

SYNTHETIC_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "synthetic")
os.makedirs(SYNTHETIC_DIR, exist_ok=True)

DOCUMENTS = [
    {
        "id": "doc_01_hi_jc",
        "doc_type": "job_card",
        "language": "Hindi",
        "worker_name": "रामलाल बंशीधर शर्मा",
        "job_card_id": "UP-12-004-019-001/1042",
        "panchayat": "रामपुर (Rampur)",
        "days_worked": 6,
        "rate_paise": 30000,
        "is_handwritten": True,
        "seeded_error": "none",
    },
    {
        "id": "doc_02_mr_jc",
        "doc_type": "job_card",
        "language": "Marathi",
        "worker_name": "कमलाबाई रामचंद्र जाधव",
        "job_card_id": "MH-04-002-019-001/4218",
        "panchayat": "बोरगाव (Borgaon)",
        "days_worked": 6,
        "rate_paise": 30000,
        "is_handwritten": True,
        "seeded_error": "missing_muster_days",
    },
    {
        "id": "doc_03_mr_mr",
        "doc_type": "muster_roll",
        "language": "Marathi",
        "muster_roll_id": "MR-2026-0819",
        "worker_name": "Kamla Ramchandra",
        "job_card_id": "MH-04-002-019-001/4218",
        "days_attended": 0,
        "muster_close_date": "2026-08-07",
        "is_handwritten": False,
        "seeded_error": "missing_muster_days",
    },
    {
        "id": "doc_04_mr_pb",
        "doc_type": "passbook",
        "language": "Marathi",
        "account_number": "XXXX-XXXX-9842",
        "account_holder_name": "Kamlabai R Jadhav",
        "transaction_date": "2026-09-16",
        "amount_credited_paise": 0,
        "is_handwritten": False,
        "seeded_error": "late_credit_40_days",
    },
    {
        "id": "doc_05_ta_jc",
        "doc_type": "job_card",
        "language": "Tamil",
        "worker_name": "முருகன் சண்முகம்",
        "job_card_id": "TN-07-003-011-002/8821",
        "panchayat": "அன்னூர் (Annur)",
        "days_worked": 8,
        "rate_paise": 30000,
        "is_handwritten": True,
        "seeded_error": "delayed_payment",
    },
    {
        "id": "doc_06_en_board",
        "doc_type": "worksite_board",
        "language": "English",
        "work_code": "VB-2026-004-9102",
        "work_name": "Desilting of Borgaon Irrigation Canal",
        "notified_daily_rate_paise": 30000,
        "is_handwritten": False,
        "seeded_error": "none",
    },
]

# Expand to 30 synthetic test cases
for i in range(7, 31):
    lang = ["Hindi", "Marathi", "Tamil", "English"][i % 4]
    doc_type = ["job_card", "passbook", "muster_roll", "worksite_board"][i % 4]
    has_error = (i % 3 == 0)
    err_type = "missing_muster_days" if has_error else "none"

    DOCUMENTS.append({
        "id": f"doc_{i:02d}_{lang[:2].lower()}_{doc_type[:2]}",
        "doc_type": doc_type,
        "language": lang,
        "worker_name": f"Worker Synthetic {i}",
        "job_card_id": f"IN-0{i % 9}-001-002-003/{1000 + i}",
        "panchayat": f"Gram Panchayat {i}",
        "days_worked": 5 + (i % 7),
        "rate_paise": 30000 if i % 5 != 0 else 28000,
        "is_handwritten": (i % 2 == 0),
        "seeded_error": err_type,
    })


def generate_documents():
    print(f"Generating {len(DOCUMENTS)} synthetic documents in {SYNTHETIC_DIR}...")
    for doc in DOCUMENTS:
        # Create image
        img = Image.new("RGB", (600, 360), color=(250, 249, 246))
        draw = ImageDraw.Draw(img)

        # Draw border
        draw.rectangle([(8, 8), (592, 352)], outline=(20, 22, 26), width=2)
        draw.line([(8, 60), (592, 60)], fill=(20, 22, 26), width=1)

        # Header
        draw.text((20, 20), f"GOVERNMENT OF INDIA - VB-G RAM G AUDIT RECORD", fill=(15, 39, 64))
        draw.text((20, 75), f"Doc ID: {doc['id']} [{doc['language']} - {doc['doc_type'].upper()}]", fill=(74, 79, 87))

        y = 110
        for k, v in doc.items():
            if k not in ("id", "doc_type", "language", "is_handwritten", "seeded_error"):
                draw.text((20, y), f"{k.replace('_', ' ').title()}: {v}", fill=(20, 22, 26))
                y += 28

        if doc.get("is_handwritten"):
            draw.text((20, y + 10), "[HANDWRITTEN FIELD SIGNATURE]", fill=(168, 98, 10))

        img_path = os.path.join(SYNTHETIC_DIR, f"{doc['id']}.jpg")
        img.save(img_path, format="JPEG", quality=90)

        # Save ground truth
        json_path = os.path.join(SYNTHETIC_DIR, f"{doc['id']}.json")
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(doc, f, indent=2, ensure_ascii=False)

    print(f"Successfully generated {len(DOCUMENTS)} synthetic documents & ground truth files.")


if __name__ == "__main__":
    generate_documents()
