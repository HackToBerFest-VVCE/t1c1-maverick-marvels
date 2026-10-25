"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Printer,
  FileCheck,
  Calendar,
  Layers,
  Hash,
  Download,
  Info,
} from "lucide-react";

interface WorkerRow {
  worker_name: string;
  job_card_id: string;
  paper_days: number;
  mis_days: number;
  discrepancy_days: number;
  wage_impact_rupees: number;
  attendance: { day: number; paper: string; mis: string; is_mismatch: boolean }[];
  is_unverified: boolean;
  sha256?: string;
}

interface FindingItem {
  check_type: string;
  title: string;
  severity: "critical" | "serious" | "warning" | "info";
  rupee_impact_paise: number;
  affected_workers: string[];
  clause_id: string;
  clause_title: string;
  description: string;
  citation?: string;
  hashes: string[];
}

export default function MusterReconcilerPage() {
  const params = useParams();
  const panchayatId = (params?.panchayat_id as string) || "borgaon";

  const [selectedTab, setSelectedTab] = useState<"matrix" | "findings" | "sheet">("matrix");
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Default synthetic data for Borgaon demonstration
  const [coverage] = useState({
    audited_rolls: 1,
    estimated_rolls: 14,
    coverage_percent: 7.1,
  });

  const [panchayatMeta] = useState({
    name: "बोरगाव (Borgaon)",
    block: "Karad",
    district: "Satara",
    state: "Maharashtra",
    work_code: "VB-2026-004-9102",
    work_description: "पाझर तलाव दुरुस्ती (Percolation Tank Repair - Phase 2)",
    muster_roll_no: "MR-2026-0819",
    mate_name: "ज्ञानदेव विठ्ठल शिंदे (Dnyandev Shinde)",
    period: "01-08-2026 to 07-08-2026",
    muster_sha256: "4b82d92c730e18f2910d5402aa3928492095f93012847291a0293e8471928491",
  });

  const [workers] = useState<WorkerRow[]>([
    {
      worker_name: "रामकृष्ण दिनकर पाटील",
      job_card_id: "MH-04-002-019/9901",
      paper_days: 0,
      mis_days: 6,
      discrepancy_days: 6,
      wage_impact_rupees: 1800.0,
      is_unverified: true,
      attendance: [
        { day: 1, paper: "—", mis: "P", is_mismatch: true },
        { day: 2, paper: "—", mis: "P", is_mismatch: true },
        { day: 3, paper: "—", mis: "P", is_mismatch: true },
        { day: 4, paper: "—", mis: "P", is_mismatch: true },
        { day: 5, paper: "—", mis: "P", is_mismatch: true },
        { day: 6, paper: "—", mis: "P", is_mismatch: true },
      ],
      sha256: "4b82d92c730e",
    },
    {
      worker_name: "सुभाष नारायण भोसले",
      job_card_id: "MH-04-002-019/9902",
      paper_days: 0,
      mis_days: 6,
      discrepancy_days: 6,
      wage_impact_rupees: 1800.0,
      is_unverified: true,
      attendance: [
        { day: 1, paper: "—", mis: "P", is_mismatch: true },
        { day: 2, paper: "—", mis: "P", is_mismatch: true },
        { day: 3, paper: "—", mis: "P", is_mismatch: true },
        { day: 4, paper: "—", mis: "P", is_mismatch: true },
        { day: 5, paper: "—", mis: "P", is_mismatch: true },
        { day: 6, paper: "—", mis: "P", is_mismatch: true },
      ],
      sha256: "4b82d92c730e",
    },
    {
      worker_name: "कमलाबाई रामचंद्र जाधव",
      job_card_id: "MH-04-002-019-001/4218",
      paper_days: 6,
      mis_days: 0,
      discrepancy_days: 6,
      wage_impact_rupees: 1821.6,
      is_unverified: false,
      attendance: [
        { day: 1, paper: "P", mis: "A", is_mismatch: true },
        { day: 2, paper: "P", mis: "A", is_mismatch: true },
        { day: 3, paper: "P", mis: "A", is_mismatch: true },
        { day: 4, paper: "P", mis: "A", is_mismatch: true },
        { day: 5, paper: "P", mis: "A", is_mismatch: true },
        { day: 6, paper: "P", mis: "A", is_mismatch: true },
      ],
      sha256: "5dddb69a0442",
    },
    {
      worker_name: "संतोष बाळू म्हात्रे",
      job_card_id: "MH-04-002-019-002/1092",
      paper_days: 4,
      mis_days: 8,
      discrepancy_days: 4,
      wage_impact_rupees: 1200.0,
      is_unverified: false,
      attendance: [
        { day: 1, paper: "P", mis: "P", is_mismatch: false },
        { day: 2, paper: "P", mis: "P", is_mismatch: false },
        { day: 3, paper: "P", mis: "P", is_mismatch: false },
        { day: 4, paper: "P", mis: "P", is_mismatch: false },
        { day: 5, paper: "—", mis: "P", is_mismatch: true },
        { day: 6, paper: "—", mis: "P", is_mismatch: true },
      ],
      sha256: "3a84c901e827",
    },
    {
      worker_name: "प्रमोद तुकाराम साळुंखे",
      job_card_id: "MH-04-002-019-004/3394",
      paper_days: 6,
      mis_days: 6,
      discrepancy_days: 0,
      wage_impact_rupees: 0.0,
      is_unverified: false,
      attendance: [
        { day: 1, paper: "P", mis: "P", is_mismatch: false },
        { day: 2, paper: "P", mis: "P", is_mismatch: false },
        { day: 3, paper: "P", mis: "P", is_mismatch: false },
        { day: 4, paper: "P", mis: "P", is_mismatch: false },
        { day: 5, paper: "P", mis: "P", is_mismatch: false },
        { day: 6, paper: "P", mis: "P", is_mismatch: false },
      ],
      sha256: "91a82910c849",
    },
    {
      worker_name: "आनंदीबाई विठ्ठल पवार",
      job_card_id: "MH-04-002-019-005/5120",
      paper_days: 6,
      mis_days: 6,
      discrepancy_days: 0,
      wage_impact_rupees: 0.0,
      is_unverified: false,
      attendance: [
        { day: 1, paper: "P", mis: "P", is_mismatch: false },
        { day: 2, paper: "P", mis: "P", is_mismatch: false },
        { day: 3, paper: "P", mis: "P", is_mismatch: false },
        { day: 4, paper: "P", mis: "P", is_mismatch: false },
        { day: 5, paper: "P", mis: "P", is_mismatch: false },
        { day: 6, paper: "P", mis: "P", is_mismatch: false },
      ],
      sha256: "7c12f90a1841",
    },
    {
      worker_name: "मारुती सखाराम शिंदे",
      job_card_id: "MH-04-002-019-006/6192",
      paper_days: 6,
      mis_days: 6,
      discrepancy_days: 0,
      wage_impact_rupees: 0.0,
      is_unverified: false,
      attendance: [
        { day: 1, paper: "P", mis: "P", is_mismatch: false },
        { day: 2, paper: "P", mis: "P", is_mismatch: false },
        { day: 3, paper: "P", mis: "P", is_mismatch: false },
        { day: 4, paper: "P", mis: "P", is_mismatch: false },
        { day: 5, paper: "P", mis: "P", is_mismatch: false },
        { day: 6, paper: "P", mis: "P", is_mismatch: false },
      ],
      sha256: "8e29a01b2938",
    },
    {
      worker_name: "सुमनबाई लक्ष्मण कदम",
      job_card_id: "MH-04-002-019-007/7041",
      paper_days: 6,
      mis_days: 6,
      discrepancy_days: 0,
      wage_impact_rupees: 0.0,
      is_unverified: false,
      attendance: [
        { day: 1, paper: "P", mis: "P", is_mismatch: false },
        { day: 2, paper: "P", mis: "P", is_mismatch: false },
        { day: 3, paper: "P", mis: "P", is_mismatch: false },
        { day: 4, paper: "P", mis: "P", is_mismatch: false },
        { day: 5, paper: "P", mis: "P", is_mismatch: false },
        { day: 6, paper: "P", mis: "P", is_mismatch: false },
      ],
      sha256: "1f82c0394819",
    },
  ]);

  const [findings] = useState<FindingItem[]>([
    {
      check_type: "GHOST_CANDIDATE",
      title: "Unverified Names — No Paper Record Found",
      severity: "serious",
      rupee_impact_paise: 360000,
      affected_workers: ["रामकृष्ण दिनकर पाटील", "सुभाष नारायण भोसले"],
      clause_id: "SCHEDULE_I_P32",
      clause_title: "Schedule I, Paragraph 32 — Muster Roll Transparency",
      description:
        "2 names on the official muster roll MR-2026-0819 have no physical job card presented during field verification and no matching paper entitlement record found in the village register.",
      hashes: ["4b82d92c730e"],
    },
    {
      check_type: "WAGE_MISMATCH",
      title: "Wage Withheld / Zero Credit Recorded",
      severity: "serious",
      rupee_impact_paise: 182160,
      affected_workers: ["कमलाबाई रामचंद्र जाधव"],
      clause_id: "SECTION_5_3",
      clause_title: "Section 5(3) & Schedule II, Paragraph 6",
      description:
        "Worker completed 6 confirmed working days documented on physical job card, but was marked absent on the muster roll, resulting in ₹1,800.00 unpaid wages plus ₹21.60 statutory delay compensation.",
      hashes: ["4b82d92c730e", "5dddb69a0442"],
    },
    {
      check_type: "DAYS_INFLATED",
      title: "Attendance Days Inflated Over Job Card Record",
      severity: "warning",
      rupee_impact_paise: 120000,
      affected_workers: ["संतोष बाळू म्हात्रे"],
      clause_id: "SCHEDULE_II_P6",
      clause_title: "Schedule II, Paragraph 6 — Muster Attendance Audit",
      description:
        "Official muster records 8 days of credited attendance, whereas worker's signed physical job card contains entries for only 4 days (4 unexplained surplus days). Pattern concentrated under Mate Dnyandev Shinde.",
      hashes: ["4b82d92c730e", "3a84c901e827"],
    },
    {
      check_type: "COWORKER_MISMATCH",
      title: "Worksite Co-Worker Group Mismatch",
      severity: "warning",
      rupee_impact_paise: 0,
      affected_workers: ["प्रमोद तुकाराम साळुंखे"],
      clause_id: "SCHEDULE_I_P25",
      clause_title: "Schedule I, Paragraph 25 — Social Audit Verification",
      description:
        "Worker reported working alongside an entirely different work gang (Jaccard distance: 1.0; 0 of 3 reported co-workers match muster roll roster). Consistent with literature finding of 61% co-worker mismatch in proxy muster entries.",
      citation: "Sandhya & Rajeev, Ideas for India (2014); Muralidharan et al., AER (2016)",
      hashes: ["4b82d92c730e", "91a82910c849"],
    },
    {
      check_type: "AGGREGATE_DELAY_COMPENSATION",
      title: "Aggregate Delay Compensation Across Roll",
      severity: "info",
      rupee_impact_paise: 28800,
      affected_workers: ["कमलाबाई रामचंद्र जाधव", "बोरगाव गट (Group)"],
      clause_id: "SCHEDULE_II_P6",
      clause_title: "Schedule II, Paragraph 6 — Statutory Delay Penalty",
      description:
        "Statutory delay compensation accumulated across the muster roll at 0.05% per day for wages delayed beyond 16 days of closure.",
      hashes: ["4b82d92c730e"],
    },
  ]);

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const totalRupeeImpact = findings.reduce((acc, f) => acc + f.rupee_impact_paise / 100, 0);

  return (
    <div>
      {/* Top action row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
        <Link href="/dashboard" className="btn btn--secondary" style={{ padding: "6px 10px" }}>
          <ArrowLeft size={16} /> Back to SARP Dashboard
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => window.print()}
          >
            <Printer size={16} /> Print Gram Sabha Sheet
          </button>
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => {
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ panchayatMeta, coverage, findings, workers }, null, 2));
              const downloadAnchor = document.createElement("a");
              downloadAnchor.setAttribute("href", dataStr);
              downloadAnchor.setAttribute("download", `reconciliation_${panchayatId}.json`);
              document.body.appendChild(downloadAnchor);
              downloadAnchor.click();
              downloadAnchor.remove();
            }}
          >
            <Download size={16} /> Export JSON Signal
          </button>
        </div>
      </div>

      {/* Prominent Mandatory Coverage Banner (Rule 40 & Phase 13 Requirement) */}
      <div
        className="card"
        style={{
          marginBottom: "var(--space-5)",
          borderLeft: "4px solid var(--brand-500)",
          background: "var(--surface-card)",
          padding: "var(--space-4)",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-3)" }}>
          <Info size={20} color="var(--brand-500)" style={{ flexShrink: 0, marginTop: "2px" }} />
          <div>
            <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-semi)", color: "var(--ink-primary)" }}>
              Coverage Notice: Based on {coverage.audited_rolls} of an estimated {coverage.estimated_rolls} muster rolls ({coverage.coverage_percent}% coverage)
            </div>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--ink-secondary)", marginTop: "4px", lineHeight: "1.5" }}>
              In accordance with Social Audit Evidence Integrity standards, collective patterns surfaced below represent
              <strong> discrepancies to raise for human explanation at the Gram Sabha</strong>, not an accusatory finding or proof of theft.
              Full coverage across all 14 rolls requires completing remaining block inspections.
            </div>
          </div>
        </div>
      </div>

      {/* Header Info Banner */}
      <section className="card" style={{ marginBottom: "var(--space-5)" }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "baseline", gap: "var(--space-4)" }}>
          <div>
            <span style={{ fontSize: "var(--text-xs)", textTransform: "uppercase", letterSpacing: "var(--tracking-caps)", color: "var(--ink-muted)", fontWeight: "var(--weight-semi)" }}>
              Gram Panchayat Muster-Roll Reconciliation
            </span>
            <h1 style={{ fontSize: "var(--text-xl)", fontWeight: "var(--weight-bold)", margin: "4px 0 6px" }}>
              {panchayatMeta.name}
            </h1>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--ink-secondary)", display: "flex", flexWrap: "wrap", gap: "var(--space-4)" }}>
              <span><strong>Muster Roll:</strong> <code>{panchayatMeta.muster_roll_no}</code></span>
              <span><strong>Work Code:</strong> <code>{panchayatMeta.work_code}</code></span>
              <span><strong>Worksite Mate:</strong> {panchayatMeta.mate_name}</span>
              <span><strong>Period:</strong> {panchayatMeta.period}</span>
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--ink-muted)", textTransform: "uppercase", letterSpacing: "var(--tracking-caps)" }}>
              Total Value of Discrepancies
            </span>
            <div style={{ fontFamily: "var(--font-num)", fontSize: "var(--text-hero)", fontWeight: "var(--weight-bold)", color: "var(--ink-primary)", marginTop: "2px" }}>
              ₹{totalRupeeImpact.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <span style={{ fontSize: "var(--text-xs)", color: "var(--status-crit-ink)", fontWeight: "var(--weight-semi)" }}>
              {findings.length} discrepancies surfaced across {workers.length} workers
            </span>
          </div>
        </div>
      </section>

      {/* Tabs Row */}
      <div style={{ display: "flex", gap: "var(--space-2)", borderBottom: "1px solid var(--rule-hair)", marginBottom: "var(--space-5)" }}>
        <button
          type="button"
          className="btn btn--ghost"
          style={{
            borderBottom: selectedTab === "matrix" ? "2px solid var(--brand-500)" : "2px solid transparent",
            borderRadius: 0,
            fontWeight: selectedTab === "matrix" ? "var(--weight-bold)" : "var(--weight-medium)",
            color: selectedTab === "matrix" ? "var(--ink-primary)" : "var(--ink-muted)",
          }}
          onClick={() => setSelectedTab("matrix")}
        >
          <Calendar size={16} /> Attendance Matrix (Paper vs MIS)
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          style={{
            borderBottom: selectedTab === "findings" ? "2px solid var(--brand-500)" : "2px solid transparent",
            borderRadius: 0,
            fontWeight: selectedTab === "findings" ? "var(--weight-bold)" : "var(--weight-medium)",
            color: selectedTab === "findings" ? "var(--ink-primary)" : "var(--ink-muted)",
          }}
          onClick={() => setSelectedTab("findings")}
        >
          <Layers size={16} /> Surfaced Findings ({findings.length})
        </button>
        <button
          type="button"
          className="btn btn--ghost"
          style={{
            borderBottom: selectedTab === "sheet" ? "2px solid var(--brand-500)" : "2px solid transparent",
            borderRadius: 0,
            fontWeight: selectedTab === "sheet" ? "var(--weight-bold)" : "var(--weight-medium)",
            color: selectedTab === "sheet" ? "var(--ink-primary)" : "var(--ink-muted)",
          }}
          onClick={() => setSelectedTab("sheet")}
        >
          <FileCheck size={16} /> Gram Sabha Read-Aloud Finding Sheet
        </button>
      </div>

      {/* TAB 1: ATTENDANCE CROSS-CHECK MATRIX */}
      {selectedTab === "matrix" && (
        <section className="card" style={{ overflowX: "auto", padding: "0" }}>
          <div style={{ padding: "var(--space-4)", borderBottom: "1px solid var(--rule-ledger)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2 style={{ fontSize: "var(--text-md)", fontWeight: "var(--weight-semi)", margin: 0 }}>
                Worker-by-Day Cross-Verification Grid
              </h2>
              <span style={{ fontSize: "var(--text-xs)", color: "var(--ink-muted)" }}>
                Left column: Worker name & Job Card · Days 1–6: Paper Job Card (top) vs Official Muster (bottom)
              </span>
            </div>
            <div style={{ display: "flex", gap: "var(--space-4)", fontSize: "var(--text-xs)" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                <span style={{ width: "10px", height: "10px", background: "var(--surface-sunken)", border: "1px solid var(--rule-strong)", display: "inline-block" }}></span>
                Consistent Record
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                <span style={{ width: "10px", height: "10px", background: "var(--accent-100)", border: "1px solid var(--accent-500)", display: "inline-block" }}></span>
                Discrepancy (Marked for Sabha)
              </span>
            </div>
          </div>

          <table className="ledger" style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--text-xs)" }}>
            <thead>
              <tr style={{ background: "var(--surface-sunken)", borderBottom: "1px solid var(--rule-strong)" }}>
                <th style={{ textAlign: "left", padding: "var(--space-3) var(--space-4)" }}>Worker & Job Card</th>
                <th style={{ textAlign: "center", padding: "var(--space-3) var(--space-2)" }}>D1 (01/08)</th>
                <th style={{ textAlign: "center", padding: "var(--space-3) var(--space-2)" }}>D2 (02/08)</th>
                <th style={{ textAlign: "center", padding: "var(--space-3) var(--space-2)" }}>D3 (03/08)</th>
                <th style={{ textAlign: "center", padding: "var(--space-3) var(--space-2)" }}>D4 (04/08)</th>
                <th style={{ textAlign: "center", padding: "var(--space-3) var(--space-2)" }}>D5 (05/08)</th>
                <th style={{ textAlign: "center", padding: "var(--space-3) var(--space-2)" }}>D6 (06/08)</th>
                <th style={{ textAlign: "right", padding: "var(--space-3) var(--space-3)" }}>Paper Days</th>
                <th style={{ textAlign: "right", padding: "var(--space-3) var(--space-3)" }}>MIS Days</th>
                <th style={{ textAlign: "right", padding: "var(--space-3) var(--space-3)" }}>Discrepancy</th>
                <th style={{ textAlign: "right", padding: "var(--space-3) var(--space-4)" }}>Impact (₹)</th>
              </tr>
            </thead>
            <tbody>
              {workers.map((w, idx) => {
                const hasMismatch = w.discrepancy_days > 0 || w.is_unverified;
                return (
                  <tr
                    key={idx}
                    style={{
                      borderBottom: "1px solid var(--rule-ledger)",
                      background: w.is_unverified
                        ? "rgba(208, 59, 59, 0.05)"
                        : hasMismatch
                        ? "var(--accent-100)"
                        : "transparent",
                    }}
                  >
                    <td style={{ padding: "var(--space-3) var(--space-4)", textAlign: "left" }}>
                      <div style={{ fontWeight: "var(--weight-semi)", color: "var(--ink-primary)" }}>
                        {w.worker_name}
                      </div>
                      <div style={{ fontFamily: "var(--font-mono)", color: "var(--ink-muted)", fontSize: "11px" }}>
                        {w.job_card_id}
                        {w.is_unverified && (
                          <span
                            style={{
                              marginLeft: "6px",
                              padding: "1px 5px",
                              borderRadius: "var(--radius-xs)",
                              background: "rgba(208, 59, 59, 0.15)",
                              color: "var(--status-crit-ink)",
                              fontWeight: "var(--weight-semi)",
                            }}
                          >
                            Unverified Name
                          </span>
                        )}
                      </div>
                    </td>

                    {w.attendance.map((att) => (
                      <td
                        key={att.day}
                        style={{
                          textAlign: "center",
                          padding: "var(--space-2)",
                          background: att.is_mismatch ? "rgba(199, 125, 19, 0.15)" : undefined,
                          borderLeft: "1px solid var(--rule-ledger)",
                        }}
                      >
                        <div style={{ fontSize: "11px", color: "var(--ink-muted)" }}>
                          P: <strong style={{ color: att.paper === "P" ? "var(--status-good-ink)" : "inherit" }}>{att.paper}</strong>
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--ink-secondary)" }}>
                          M: <strong style={{ color: att.mis === "P" ? "var(--brand-700)" : "inherit" }}>{att.mis}</strong>
                        </div>
                      </td>
                    ))}

                    <td style={{ textAlign: "right", padding: "var(--space-3) var(--space-3)", fontFamily: "var(--font-num)" }}>
                      {w.paper_days}
                    </td>
                    <td style={{ textAlign: "right", padding: "var(--space-3) var(--space-3)", fontFamily: "var(--font-num)" }}>
                      {w.mis_days}
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                        padding: "var(--space-3) var(--space-3)",
                        fontFamily: "var(--font-num)",
                        fontWeight: "var(--weight-bold)",
                        color: hasMismatch ? "var(--status-crit-ink)" : "var(--ink-muted)",
                      }}
                    >
                      {w.discrepancy_days > 0 ? `+${w.discrepancy_days} d` : "0"}
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                        padding: "var(--space-3) var(--space-4)",
                        fontFamily: "var(--font-num)",
                        fontWeight: "var(--weight-semi)",
                        color: w.wage_impact_rupees > 0 ? "var(--ink-primary)" : "var(--ink-muted)",
                      }}
                    >
                      ₹{w.wage_impact_rupees.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}

      {/* TAB 2: FINDINGS ORDERED BY RUPEE IMPACT */}
      {selectedTab === "findings" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
          {findings.map((finding, idx) => {
            const impactRupees = finding.rupee_impact_paise / 100;
            return (
              <div
                key={idx}
                className="card"
                style={{
                  borderLeft:
                    finding.severity === "serious"
                      ? "4px solid var(--accent-500)"
                      : finding.severity === "warning"
                      ? "4px solid var(--status-warning)"
                      : "4px solid var(--brand-500)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "var(--space-4)" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "var(--weight-semi)",
                          padding: "2px 6px",
                          borderRadius: "var(--radius-xs)",
                          background:
                            finding.severity === "serious"
                              ? "var(--accent-100)"
                              : "var(--surface-sunken)",
                          color:
                            finding.severity === "serious"
                              ? "var(--accent-600)"
                              : "var(--ink-secondary)",
                          textTransform: "uppercase",
                        }}
                      >
                        {finding.check_type.replace(/_/g, " ")}
                      </span>
                      <span style={{ fontSize: "var(--text-xs)", color: "var(--ink-muted)" }}>
                        Clause: {finding.clause_title}
                      </span>
                    </div>

                    <h3 style={{ fontSize: "var(--text-md)", fontWeight: "var(--weight-semi)", margin: "8px 0 4px" }}>
                      {finding.title}
                    </h3>
                    <p style={{ fontSize: "var(--text-sm)", color: "var(--ink-secondary)", lineHeight: "1.5", margin: 0 }}>
                      {finding.description}
                    </p>

                    {finding.citation && (
                      <div style={{ fontSize: "11px", color: "var(--ink-muted)", marginTop: "6px" }}>
                        <em>Academic Source:</em> {finding.citation}
                      </div>
                    )}

                    <div style={{ marginTop: "10px", fontSize: "var(--text-xs)", color: "var(--ink-muted)" }}>
                      <strong>Affected Individual(s):</strong> {finding.affected_workers.join(", ")}
                    </div>
                  </div>

                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--ink-muted)", textTransform: "uppercase" }}>
                      Rupee Impact
                    </span>
                    <div style={{ fontFamily: "var(--font-num)", fontSize: "var(--text-lg)", fontWeight: "var(--weight-bold)", color: "var(--ink-primary)" }}>
                      ₹{impactRupees.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>

                    {/* Source Photo Hashes */}
                    <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "3px", alignItems: "flex-end" }}>
                      {finding.hashes.map((h) => (
                        <button
                          key={h}
                          type="button"
                          className="btn btn--ghost"
                          style={{ padding: "1px 4px", fontSize: "10px", fontFamily: "var(--font-mono)", color: "var(--ink-muted)" }}
                          onClick={() => copyHash(h)}
                          title="Click to copy SHA-256 evidence fingerprint"
                        >
                          <Hash size={10} /> {h.slice(0, 12)}... {copiedHash === h ? "✓" : ""}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: ONE-PAGE GRAM SABHA READ-ALOUD FINDING SHEET (PRINTABLE) */}
      {selectedTab === "sheet" && (
        <section
          className="card"
          style={{
            background: "var(--surface-raised)",
            padding: "var(--space-6)",
            border: "1px solid var(--rule-strong)",
            fontFamily: "var(--font-ui)",
          }}
        >
          {/* Header */}
          <div style={{ borderBottom: "2px solid var(--ink-primary)", paddingBottom: "var(--space-4)", marginBottom: "var(--space-5)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "var(--tracking-caps)", color: "var(--ink-muted)" }}>
                  Official Social Audit Record · Schedule I, Paragraph 32
                </span>
                <h2 style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-bold)", margin: "4px 0" }}>
                  ग्राम सभा सामाजिक अंकेक्षण अहवाल — साक्षांकन पत्रक
                </h2>
                <div style={{ fontSize: "var(--text-xs)", color: "var(--ink-secondary)" }}>
                  Gram Panchayat: <strong>{panchayatMeta.name}</strong> · Taluk: {panchayatMeta.block} · District: {panchayatMeta.district}
                </div>
              </div>
              <div style={{ textAlign: "right", fontSize: "var(--text-xs)", color: "var(--ink-muted)" }}>
                <div>Muster No: <code>{panchayatMeta.muster_roll_no}</code></div>
                <div>Coverage: 1 of 14 rolls ({coverage.coverage_percent}%)</div>
                <div>Date: 25 October 2026</div>
              </div>
            </div>
          </div>

          {/* Reading Script for Gram Sabha */}
          <div
            style={{
              padding: "var(--space-4)",
              background: "var(--surface-sunken)",
              borderRadius: "var(--radius-sm)",
              marginBottom: "var(--space-5)",
              borderLeft: "3px solid var(--brand-700)",
            }}
          >
            <div style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-semi)", color: "var(--brand-900)", marginBottom: "4px" }}>
              सस्वर वाचन संहिता (Spoken Script for Presiding Social Audit Officer):
            </div>
            <p style={{ fontSize: "var(--text-sm)", lineHeight: "1.7", color: "var(--ink-primary)", margin: 0 }}>
              "उपस्थित ग्रामसभा सदस्य, सरपंच, व अधिकार्‍यांच्या निदर्शनास आणून देण्यात येते की बोरगाव ग्रामपंचायतीमधील
              मस्टर रोल क्र. <strong>{panchayatMeta.muster_roll_no}</strong> (काम: पाझर तलाव दुरुस्ती) ची प्रत्यक्ष पडताळणी पूर्ण झाली आहे.
              या तपासणीत खालील विसंगती नोंदवण्यात आल्या आहेत:
              (१) मस्टर रोलवर <strong>२ अशी नावे आढळली ज्यांचे कोणतेही प्रत्यक्ष जॉब कार्ड ग्रामपंचायत अभिलेखात उपलब्ध नाही</strong> (एकूण ₹३,६००/- देयक).
              (२) कामगार <strong>कमलाबाई जाधव</strong> यांनी ६ दिवस प्रत्यक्ष काम केले असताना मस्टरवर शून्य हजेरी दर्शवून ₹१,८००/- वेतन रोखले गेले, ज्यावर कायद्यानुसार ₹२१.६० विलंब भरपाई देय आहे.
              (३) कामगार <strong>संतोष म्हात्रे</strong> यांची जॉब कार्डवर ४ दिवस नोंद असताना मस्टरवर ८ दिवस (+४ दिवस जास्तीचे) दर्शवले गेले आहेत.
              एकूण <strong>₹{totalRupeeImpact.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> ची रक्कम विसंगती अंतर्गत ग्रामसभेसमोर निर्णयार्थ सादर आहे."
            </p>
          </div>

          {/* Summary Table */}
          <table className="ledger" style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--text-xs)", marginBottom: "var(--space-5)" }}>
            <thead>
              <tr style={{ background: "var(--surface-sunken)", borderBottom: "1px solid var(--rule-strong)" }}>
                <th style={{ textAlign: "left", padding: "var(--space-2) var(--space-3)" }}>अंकेक्षण मुद्दा (Audit Finding)</th>
                <th style={{ textAlign: "left", padding: "var(--space-2) var(--space-3)" }}>कायदेशीर संदर्भ (Clause)</th>
                <th style={{ textAlign: "left", padding: "var(--space-2) var(--space-3)" }}>संबंधित कामगार (Affected)</th>
                <th style={{ textAlign: "right", padding: "var(--space-2) var(--space-3)" }}>रक्कम प्रभाव (Rupee Impact)</th>
              </tr>
            </thead>
            <tbody>
              {findings.map((f, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--rule-ledger)" }}>
                  <td style={{ padding: "var(--space-2) var(--space-3)", fontWeight: "var(--weight-medium)" }}>{f.title}</td>
                  <td style={{ padding: "var(--space-2) var(--space-3)", color: "var(--ink-muted)" }}>{f.clause_id}</td>
                  <td style={{ padding: "var(--space-2) var(--space-3)" }}>{f.affected_workers.join(", ")}</td>
                  <td style={{ padding: "var(--space-2) var(--space-3)", textAlign: "right", fontFamily: "var(--font-num)", fontWeight: "var(--weight-bold)" }}>
                    ₹{(f.rupee_impact_paise / 100).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
              <tr style={{ borderTop: "2px solid var(--rule-strong)", background: "var(--surface-sunken)" }}>
                <td colSpan={3} style={{ padding: "var(--space-3)", fontWeight: "var(--weight-bold)" }}>एकूण विसंगती रक्कम (Total Discrepancy Amount)</td>
                <td style={{ padding: "var(--space-3)", textAlign: "right", fontFamily: "var(--font-num)", fontWeight: "var(--weight-bold)", fontSize: "var(--text-sm)" }}>
                  ₹{totalRupeeImpact.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Cryptographic Hash Verification Line */}
          <div style={{ fontSize: "11px", color: "var(--ink-muted)", borderTop: "1px solid var(--rule-hair)", paddingTop: "var(--space-3)", marginBottom: "var(--space-6)" }}>
            <strong>Section 63 BSA Hash Chain:</strong> Muster Photo SHA-256: <code>{panchayatMeta.muster_sha256}</code> · Validated with pure deterministic Python engine.
          </div>

          {/* Signatures */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--space-6)", paddingTop: "var(--space-5)" }}>
            <div style={{ borderTop: "1px solid var(--rule-strong)", paddingTop: "var(--space-2)", textAlign: "center", fontSize: "var(--text-xs)" }}>
              स्वाक्षरी: सामाजिक अंकेक्षण संसाधन व्यक्ती<br />(Social Audit Resource Person)
            </div>
            <div style={{ borderTop: "1px solid var(--rule-strong)", paddingTop: "var(--space-2)", textAlign: "center", fontSize: "var(--text-xs)" }}>
              स्वाक्षरी: ग्राम रोजगार सहाय्यक / मेट<br />(Gram Rozgar Sahayak / Mate)
            </div>
            <div style={{ borderTop: "1px solid var(--rule-strong)", paddingTop: "var(--space-2)", textAlign: "center", fontSize: "var(--text-xs)" }}>
              स्वाक्षरी: ग्रामसभा अध्यक्ष / सरपंच<br />(Gram Sabha President)
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
