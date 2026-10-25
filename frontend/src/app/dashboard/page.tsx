"use client";

import React, { useState } from "react";
import Link from "next/link";
import { DashboardCharts } from "@/components/DashboardCharts";
import { TracePanel } from "@/components/TracePanel";
import { AlertCircle, CheckCircle, ArrowRight, ScanLine } from "lucide-react";

interface WorkerLedgerItem {
  id: string;
  worker_name: string;
  job_card_id: string;
  job_card_masked: string;
  panchayat: string;
  days_missing: number;
  unpaid_rupees: string;
  delay_comp_rupees: string;
  status: "due" | "clear";
  status_label: string;
  attention: boolean;
}

const LEDGER_DATA: WorkerLedgerItem[] = [
  {
    id: "w1",
    worker_name: "कमलाबाई रामचंद्र जाधव",
    job_card_id: "MH-04-002-019-001/4218",
    job_card_masked: "•••• 4218",
    panchayat: "बोरगाव (Borgaon)",
    days_missing: 6,
    unpaid_rupees: "₹1,800",
    delay_comp_rupees: "₹21.60",
    status: "due",
    status_label: "Wages Due",
    attention: true,
  },
  {
    id: "w2",
    worker_name: "संतोष बाळू म्हात्रे",
    job_card_id: "MH-04-002-019-002/1092",
    job_card_masked: "•••• 1092",
    panchayat: "बोरगाव (Borgaon)",
    days_missing: 4,
    unpaid_rupees: "₹1,200",
    delay_comp_rupees: "₹10.80",
    status: "due",
    status_label: "Wages Due",
    attention: true,
  },
  {
    id: "w3",
    worker_name: "आनंदीबाई ज्ञानेश्वर कांबळे",
    job_card_id: "MH-04-002-019-003/7731",
    job_card_masked: "•••• 7731",
    panchayat: "शिंदेवाडी (Shindewadi)",
    days_missing: 0,
    unpaid_rupees: "₹0",
    delay_comp_rupees: "₹0.00",
    status: "clear",
    status_label: "Audited & Verified",
    attention: false,
  },
  {
    id: "w4",
    worker_name: "प्रमोद तुकाराम साळुंखे",
    job_card_id: "MH-04-002-019-004/3394",
    job_card_masked: "•••• 3394",
    panchayat: "वडगाव (Vadgaon)",
    days_missing: 8,
    unpaid_rupees: "₹2,400",
    delay_comp_rupees: "₹33.60",
    status: "due",
    status_label: "Wages Due",
    attention: true,
  },
];

export default function DashboardPage() {
  const [search, setSearch] = useState("");
  const [selectedPanchayat, setSelectedPanchayat] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const filteredLedger = LEDGER_DATA.filter((item) => {
    const matchSearch =
      item.worker_name.toLowerCase().includes(search.toLowerCase()) ||
      item.job_card_masked.includes(search);
    const matchPanchayat =
      selectedPanchayat === "all" || item.panchayat.includes(selectedPanchayat);
    const matchStatus =
      selectedStatus === "all" || item.status === selectedStatus;
    return matchSearch && matchPanchayat && matchStatus;
  });

  return (
    <div>
      {/* 1. Stat Row: exactly 4 tiles, full rupee amount, exactly 1 attention element */}
      <section className="section">
        <div className="stat-row">
          <div className="stat-tile">
            <span className="stat-tile__label">Workers Audited This Cycle</span>
            <div className="stat-figure">1,284</div>
            <div className="stat-tile__note">
              <span className="delta" data-dir="up">142</span> vs last fortnight
            </div>
          </div>

          <div className="stat-tile">
            <span className="stat-tile__label">Discrepancies Found</span>
            <div className="stat-figure">86</div>
            <div className="stat-tile__note">
              <span className="delta" data-dir="up">12</span> requires Gram Sabha review
            </div>
          </div>

          {/* Reserved Attention Element */}
          <div className="stat-tile" data-attention="true">
            <span className="stat-tile__label">Total Unpaid Wages Identified</span>
            <div className="stat-figure">₹18,42,600</div>
            <div className="stat-tile__note">
              <span className="delta" data-dir="up">₹2,14,200</span> identified this cycle
            </div>
          </div>

          <div className="stat-tile">
            <span className="stat-tile__label">Grievances Filed</span>
            <div className="stat-figure">42</div>
            <div className="stat-tile__note">
              <span className="delta" data-dir="up">8</span> submitted to PO
            </div>
          </div>
        </div>
      </section>

      {/* 2. Filter Bar: ONE single row above content */}
      <section className="filters">
        <span className="filters__label">Filter Ledger:</span>
        <select
          className="select"
          value={selectedPanchayat}
          onChange={(e) => setSelectedPanchayat(e.target.value)}
          aria-label="Filter by Gram Panchayat"
        >
          <option value="all">All Panchayats (3)</option>
          <option value="Borgaon">बोरगाव (Borgaon)</option>
          <option value="Shindewadi">शिंदेवाडी (Shindewadi)</option>
          <option value="Vadgaon">वडगाव (Vadgaon)</option>
        </select>

        <select className="select" defaultValue="q3" aria-label="Select Work Period">
          <option value="q3">Current Fortnight (01 Aug - 15 Aug 2026)</option>
          <option value="q2">Previous Fortnight (16 Jul - 31 Jul 2026)</option>
        </select>

        <select
          className="select"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          aria-label="Filter by Status"
        >
          <option value="all">All Statuses</option>
          <option value="due">Wages Due</option>
          <option value="clear">Audited & Verified</option>
        </select>

        <input
          type="text"
          className="input"
          placeholder="Search worker or card ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search worker by name or ID"
          style={{ minWidth: "220px" }}
        />

        <div className="filters__spacer" />

        <Link href="/audit/new" className="btn btn--action" style={{ whiteSpace: "nowrap" }}>
          <ScanLine size={16} /> New Document Capture
        </Link>
      </section>

      {/* 3. Two side-by-side charts */}
      <DashboardCharts />

      {/* 4. Ruled Ledger Table */}
      <section className="section" id="ledger">
        <div className="section__head">
          <h2 className="section__title">Workers with Open Discrepancies</h2>
          <span className="section__meta">
            Showing {filteredLedger.length} of {LEDGER_DATA.length} records
          </span>
        </div>

        <div className="card card--flush">
          <div className="ledger-wrap">
            <table className="ledger">
              <thead>
                <tr>
                  <th>Worker</th>
                  <th>Job Card</th>
                  <th>Gram Panchayat</th>
                  <th className="num">Missing Days</th>
                  <th className="num">Unpaid Wages</th>
                  <th className="num">Delay Comp (0.05%)</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredLedger.map((row) => (
                  <tr
                    key={row.id}
                    data-attention={row.attention ? "true" : "false"}
                  >
                    <td className="ledger__primary">{row.worker_name}</td>
                    <td className="ledger__id">{row.job_card_masked}</td>
                    <td>{row.panchayat}</td>
                    <td className="num">{row.days_missing}</td>
                    <td className="num">{row.unpaid_rupees}</td>
                    <td className="num">{row.delay_comp_rupees}</td>
                    <td>
                      <span
                        className="pill"
                        data-status={row.status === "due" ? "critical" : "good"}
                      >
                        {row.status === "due" ? (
                          <AlertCircle size={12} />
                        ) : (
                          <CheckCircle size={12} />
                        )}
                        {row.status_label}
                      </span>
                    </td>
                    <td>
                      <Link
                        href={`/audit/${row.id}`}
                        className="btn btn--secondary"
                        style={{ padding: "4px 8px", fontSize: "var(--text-xs)" }}
                      >
                        Dossier <ArrowRight size={12} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="ledger__foot">
                  <td>Ledger Totals</td>
                  <td>4 Workers</td>
                  <td>3 Panchayats</td>
                  <td className="num">18 Days</td>
                  <td className="num">₹5,400</td>
                  <td className="num">₹66.00</td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </section>

      {/* 5. Live Gemma 4 Trace Panel */}
      <TracePanel />
    </div>
  );
}
