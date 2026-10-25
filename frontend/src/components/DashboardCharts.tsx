"use client";

import React, { useState } from "react";
import { Table, BarChart2 } from "lucide-react";

interface MonthlyPoint {
  month: string;
  amount_rupees: number;
  label: string;
}

interface CategoryPoint {
  type: string;
  count: number;
  color: string;
}

const MONTHLY_DATA: MonthlyPoint[] = [
  { month: "May 2026", amount_rupees: 210000, label: "₹2,10,000" },
  { month: "Jun 2026", amount_rupees: 480000, label: "₹4,80,000" },
  { month: "Jul 2026", amount_rupees: 390000, label: "₹3,90,000" },
  { month: "Aug 2026", amount_rupees: 762600, label: "₹7,62,600" },
];

const CATEGORY_DATA: CategoryPoint[] = [
  { type: "Missing Muster Days", count: 48, color: "var(--series-1)" },
  { type: "Delayed Payment (>16d)", count: 22, color: "var(--series-2)" },
  { type: "Sub-floor Wage Rate", count: 10, color: "var(--series-3)" },
  { type: "Name Transliteration Mismatch", count: 4, color: "var(--series-4)" },
  { type: "Other Discrepancies", count: 2, color: "var(--ink-muted)" },
];

export function DashboardCharts() {
  const [showTable1, setShowTable1] = useState(false);
  const [showTable2, setShowTable2] = useState(false);
  const [hoveredMonth, setHoveredMonth] = useState<MonthlyPoint | null>(null);

  const maxMonthly = 800000;
  const maxCategory = 50;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "var(--space-5)", marginBottom: "var(--space-6)" }}>
      {/* Chart 1: Unpaid wages by month */}
      <div className="viz">
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "var(--space-4)" }}>
          <div>
            <h3 className="viz__title">Unpaid wages identified, by month</h3>
            <p className="viz__sub">Direct amounts in full rupees · Single value axis</p>
          </div>
          <button
            type="button"
            className="btn btn--ghost"
            style={{ padding: "4px 8px", fontSize: "var(--text-xs)" }}
            onClick={() => setShowTable1(!showTable1)}
            aria-label="Toggle accessible data table for monthly unpaid wages"
          >
            <Table size={14} /> {showTable1 ? "Chart view" : "Table view"}
          </button>
        </div>

        {showTable1 ? (
          <table className="ledger" style={{ marginTop: "var(--space-3)" }}>
            <thead>
              <tr>
                <th>Month</th>
                <th className="num">Unpaid Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {MONTHLY_DATA.map((d) => (
                <tr key={d.month}>
                  <td className="ledger__primary">{d.month}</td>
                  <td className="num">{d.label}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ position: "relative", paddingTop: "var(--space-4)", height: "220px", display: "flex", alignItems: "flex-end", gap: "var(--space-4)", borderBottom: "1px solid var(--chart-axis)" }}>
            {/* Gridlines */}
            <div style={{ position: "absolute", inset: 0, pointerEvents: "none", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div style={{ borderTop: "1px dashed var(--chart-grid)", width: "100%", fontSize: "var(--text-xs)", color: "var(--ink-muted)" }}>₹8,00,000</div>
              <div style={{ borderTop: "1px dashed var(--chart-grid)", width: "100%", fontSize: "var(--text-xs)", color: "var(--ink-muted)" }}>₹4,00,000</div>
              <div style={{ borderTop: "1px dashed var(--chart-grid)", width: "100%", fontSize: "var(--text-xs)", color: "var(--ink-muted)" }}>₹0</div>
            </div>

            {MONTHLY_DATA.map((d) => {
              const heightPercent = Math.round((d.amount_rupees / maxMonthly) * 100);
              return (
                <div
                  key={d.month}
                  style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", height: "100%", justifyContent: "flex-end", zIndex: 1 }}
                  onMouseEnter={() => setHoveredMonth(d)}
                  onMouseLeave={() => setHoveredMonth(null)}
                >
                  {/* Direct Label */}
                  <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-semi)", marginBottom: "4px", color: "var(--ink-secondary)" }}>
                    {d.label}
                  </span>
                  {/* Bar */}
                  <div
                    style={{
                      width: "80%",
                      maxWidth: "52px",
                      height: `${heightPercent}%`,
                      background: "var(--series-1)",
                      borderRadius: "4px 4px 0 0",
                      transition: "filter 120ms ease",
                      cursor: "pointer",
                      filter: hoveredMonth?.month === d.month ? "brightness(1.15)" : "none",
                    }}
                  />
                  {/* Axis Label */}
                  <span style={{ fontSize: "var(--text-xs)", color: "var(--ink-muted)", marginTop: "6px" }}>
                    {d.month.split(" ")[0]}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Chart 2: Discrepancies by type */}
      <div className="viz">
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "var(--space-4)" }}>
          <div>
            <h3 className="viz__title">Discrepancies by statutory category</h3>
            <p className="viz__sub">Direct labels on every bar · Max 5 categories</p>
          </div>
          <button
            type="button"
            className="btn btn--ghost"
            style={{ padding: "4px 8px", fontSize: "var(--text-xs)" }}
            onClick={() => setShowTable2(!showTable2)}
            aria-label="Toggle accessible data table for discrepancy categories"
          >
            <Table size={14} /> {showTable2 ? "Chart view" : "Table view"}
          </button>
        </div>

        {showTable2 ? (
          <table className="ledger" style={{ marginTop: "var(--space-3)" }}>
            <thead>
              <tr>
                <th>Category</th>
                <th className="num">Occurrences</th>
              </tr>
            </thead>
            <tbody>
              {CATEGORY_DATA.map((c) => (
                <tr key={c.type}>
                  <td className="ledger__primary">{c.type}</td>
                  <td className="num">{c.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)", marginTop: "var(--space-3)" }}>
            {CATEGORY_DATA.map((c) => {
              const widthPercent = Math.round((c.count / maxCategory) * 100);
              return (
                <div key={c.type}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs)", marginBottom: "3px" }}>
                    <span style={{ color: "var(--ink-primary)", fontWeight: "var(--weight-medium)" }}>{c.type}</span>
                    <span style={{ color: "var(--ink-secondary)", fontWeight: "var(--weight-semi)" }}>{c.count} cases</span>
                  </div>
                  <div style={{ width: "100%", height: "14px", background: "var(--surface-sunken)", borderRadius: "3px", overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${widthPercent}%`,
                        height: "100%",
                        background: c.color,
                        borderRadius: "3px",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
