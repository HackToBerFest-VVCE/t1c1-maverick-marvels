#!/usr/bin/env python3
"""Verifier script for Saakshi Tamper-Evident Evidence Packets.
Validates:
  1. Cryptographic SHA-256 hash match for all source photos (original & processed).
  2. Manifest self-hash integrity (manifest_sha256).
  3. Re-execution of independent deterministic arithmetic engine against recorded inputs.
Prints clear PASS / FAIL per check with strict non-zero exit code on tampering.
"""

import argparse
import hashlib
import json
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.audit.engine import (
    compute_wage_due,
    compute_unpaid_wages,
    compute_delay_days,
    compute_delay_compensation,
    check_entitlement_cap,
)
from backend.evidence.manifest import AuditManifest


def verify_packet(manifest_path: str, photo_paths: list[str]) -> bool:
    print("=" * 70)
    print("SAAKSHI EVIDENCE INTEGRITY VERIFIER")
    print(f"Manifest File: {manifest_path}")
    print("=" * 70)

    if not os.path.exists(manifest_path):
        print(f"[FAIL] Manifest file not found: {manifest_path}")
        return False

    with open(manifest_path, "r", encoding="utf-8") as f:
        manifest_raw = json.load(f)

    manifest = AuditManifest(**manifest_raw)
    all_checks_passed = True

    # Check 1: Manifest Self-Hash Integrity
    calculated_manifest_hash = manifest.compute_hash()
    if calculated_manifest_hash == manifest.manifest_sha256:
        print(f"[PASS] Manifest Hash Integrity: {calculated_manifest_hash[:16]}... matches recorded fingerprint.")
    else:
        print(f"[FAIL] Manifest Tampered! Calculated: {calculated_manifest_hash} != Recorded: {manifest.manifest_sha256}")
        all_checks_passed = False

    # Check 2: Photo Hashes
    photo_map = {}
    for p in photo_paths:
        if os.path.exists(p):
            with open(p, "rb") as pf:
                b = pf.read()
                h = hashlib.sha256(b).hexdigest()
                photo_map[h] = p

    for idx, doc in enumerate(manifest.documents, 1):
        target_orig = doc.sha256_original
        target_proc = doc.sha256_processed
        matched_orig = target_orig in photo_map
        matched_proc = target_proc in photo_map

        if matched_orig or matched_proc:
            source_file = photo_map.get(target_orig, photo_map.get(target_proc))
            print(f"[PASS] Document {idx} ({doc.doc_type}): Verified against {os.path.basename(source_file)} (SHA-256: {target_orig[:16]}...)")
        else:
            print(f"[FAIL] Document {idx} ({doc.doc_type}): Hash {target_orig[:16]}... does not match any provided photo bytes! Potential modification/tampering.")
            all_checks_passed = False

    # Check 3: Deterministic Arithmetic Verification
    comp = manifest.computation
    inputs = comp.inputs
    outputs = comp.outputs

    days = inputs.get("days_worked", 0)
    rate = inputs.get("rate_paise", 30000)
    credited = inputs.get("amount_credited_paise", 0)
    close_date = inputs.get("muster_close_date", "2026-08-07")
    credit_date = inputs.get("credit_date", "2026-09-16")

    recalc_wage = compute_wage_due(days, rate)
    recalc_unpaid = compute_unpaid_wages(recalc_wage, credited)
    recalc_delay = compute_delay_days(close_date, credit_date)
    recalc_comp = compute_delay_compensation(recalc_unpaid, recalc_delay)
    recalc_entitle = check_entitlement_cap(days)

    arithmetic_valid = (
        recalc_wage == outputs.get("wage_due_paise")
        and recalc_unpaid == outputs.get("unpaid_wages_paise")
        and recalc_delay == outputs.get("delay_days")
        and recalc_comp == outputs.get("delay_compensation_paise")
        and recalc_entitle == outputs.get("entitlement_cap_remaining")
    )

    if arithmetic_valid:
        print("[PASS] Arithmetic Verification: Independent Python recalculation matches manifest figures exactly.")
        print(f"       - Wage Due: INR {recalc_wage / 100:.2f} | Unpaid: INR {recalc_unpaid / 100:.2f} | Delay Comp: INR {recalc_comp / 100:.2f}")
    else:
        print("[FAIL] Arithmetic Discrepancy! Recorded outputs differ from statutory formula evaluation.")
        all_checks_passed = False

    print("=" * 70)
    if all_checks_passed:
        print("OVERALL RESULT: PASS — EVIDENCE PACKET INTEGRITY CONFIRMED")
    else:
        print("OVERALL RESULT: FAIL — TAMPERING OR CORRUPTION DETECTED")
    print("=" * 70)

    return all_checks_passed


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Verify Saakshi Evidence Packet")
    parser.add_argument("manifest", help="Path to evidence manifest JSON")
    parser.add_argument("photos", nargs="+", help="Paths to original document images")
    args = parser.parse_args()

    success = verify_packet(args.manifest, args.photos)
    sys.exit(0 if success else 1)
