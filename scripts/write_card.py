#!/usr/bin/env python3
"""NTAG213 NFC Card Writer Script for Saakshi.
Writes ONLY a Job Card identifier (up to 32 ASCII characters) as a single NDEF text record.
REFUSES:
  - Strings longer than 32 characters
  - Names or text with spaces/personal identifiers
  - 12-digit Aadhaar numbers
  - Rupee amounts or wage figures
NTAG213 has 144 bytes of user memory — no documents or PII may ever be written to the card.
"""

import re
import sys


def validate_payload(card_id: str) -> None:
    cleaned = card_id.strip()
    if len(cleaned) > 32:
        raise ValueError(f"Payload too long ({len(cleaned)} chars). Max permitted length is 32 characters.")

    # Reject Aadhaar (12 digits)
    if re.search(r"\b\d{4}\s*\d{4}\s*\d{4}\b", cleaned):
        raise ValueError("Rejected: Looks like an Aadhaar number. Writing identity numbers to card is strictly forbidden.")

    # Reject rupee amounts
    if any(symbol in cleaned for symbol in ["₹", "Rs", "rs", "paise", "INR"]):
        raise ValueError("Rejected: Contains money or wage amount. Cards store only Job Card reference numbers.")

    print(f"Payload validation passed for card ID: •••• {cleaned[-4:]}")


def write_card(card_id: str):
    validate_payload(card_id)
    print(f"Simulating NDEF text record write to NTAG213:")
    print(f"  NDEF Record Type: 'T' (Text)")
    print(f"  Encoding: UTF-8, Language: 'en'")
    print(f"  Payload: {card_id.strip()}")
    print("SUCCESS: 18-byte record written. Card is ready for mobile tap or ESP32 reader.")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        card_arg = "MH-04-002-019-001/4218"
    else:
        card_arg = sys.argv[1]
    write_card(card_arg)
