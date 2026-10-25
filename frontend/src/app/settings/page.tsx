"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Server, Cloud, ShieldCheck, Check, AlertCircle, Cpu, Zap } from "lucide-react";

export default function SettingsPage() {
  const [provider, setProvider] = useState<string>("gemini_api");
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/gemma/provider")
      .then((res) => res.json())
      .then((data) => {
        if (data?.active_provider) {
          setProvider(data.active_provider);
        }
      })
      .catch(() => {});
  }, []);

  const handleSelectProvider = async (target: string) => {
    if (target === provider) return;
    setLoading(true);
    setStatusMsg(null);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/gemma/provider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: target }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to switch provider");
      }
      setProvider(data.active_provider);
      setStatusMsg({
        type: "success",
        text: `Switched runtime provider to ${target === "ollama" ? "Local Ollama (Air-Gapped)" : "Google Gemini API"} successfully.`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setStatusMsg({
        type: "error",
        text: `Cannot switch to local: ${msg}. If using Ollama, ensure 'ollama serve' is running and 'gemma4:26b' is loaded. Zero silent fallback per Rule 10.`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Top action row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
        <Link href="/dashboard" className="btn btn--secondary" style={{ padding: "6px 10px" }}>
          <ArrowLeft size={16} /> Back to SARP Dashboard
        </Link>
      </div>

      <div style={{ marginBottom: "var(--space-5)" }}>
        <h1 style={{ fontSize: "var(--text-xl)", fontWeight: "var(--weight-bold)", margin: "0 0 6px" }}>
          Inference Architecture & Runtime Provider
        </h1>
        <p style={{ fontSize: "var(--text-sm)", color: "var(--ink-secondary)", margin: 0 }}>
          Manage inference runtime destinations, review the strict Gemma 4 model allowlist, and configure calibration thresholds.
        </p>
      </div>

      {statusMsg && (
        <div
          className="card"
          style={{
            marginBottom: "var(--space-5)",
            borderLeft: statusMsg.type === "success" ? "4px solid var(--status-good)" : "4px solid var(--status-critical)",
            background: statusMsg.type === "success" ? "rgba(12, 163, 12, 0.08)" : "rgba(208, 59, 59, 0.08)",
            padding: "var(--space-3) var(--space-4)",
            display: "flex",
            alignItems: "center",
            gap: "var(--space-3)",
            fontSize: "var(--text-sm)",
          }}
        >
          {statusMsg.type === "success" ? (
            <Check size={18} color="var(--status-good-ink)" />
          ) : (
            <AlertCircle size={18} color="var(--status-crit-ink)" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Provider Toggle Card */}
      <section className="card" style={{ marginBottom: "var(--space-5)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "var(--space-4)" }}>
          <h2 style={{ fontSize: "var(--text-md)", fontWeight: "var(--weight-semi)", margin: 0 }}>
            Active Runtime Destination (Phase 15 Self-Host Toggle)
          </h2>
          <span style={{ fontSize: "var(--text-xs)", color: "var(--ink-muted)" }}>
            Current: <strong style={{ color: "var(--ink-primary)" }}>{provider.toUpperCase()}</strong>
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "var(--space-4)" }}>
          {/* Option 1: Gemini API */}
          <div
            onClick={() => handleSelectProvider("gemini_api")}
            style={{
              border: provider === "gemini_api" ? "2px solid var(--brand-500)" : "1px solid var(--rule-strong)",
              background: provider === "gemini_api" ? "var(--brand-050)" : "var(--surface-sunken)",
              borderRadius: "var(--radius-md)",
              padding: "var(--space-4)",
              cursor: "pointer",
              transition: "all var(--dur-fast) var(--ease-out)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-2)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                <Cloud size={20} color="var(--brand-500)" />
                <strong style={{ fontSize: "var(--text-sm)" }}>Google Gemini API (Hosted Free Tier)</strong>
              </div>
              {provider === "gemini_api" && (
                <span style={{ fontSize: "11px", background: "var(--brand-500)", color: "var(--ink-onAccent)", padding: "1px 6px", borderRadius: "var(--radius-pill)" }}>
                  Active
                </span>
              )}
            </div>
            <p style={{ fontSize: "var(--text-xs)", color: "var(--ink-secondary)", lineHeight: "1.5", margin: "0 0 10px" }}>
              Hosted endpoint via official Google GenAI SDK. Both Gemma 4 models are free ($0 in, $0 out).
              Fast response times (median ~45s for 26B vision) with zero local hardware requirements.
            </p>
            <div style={{ fontSize: "11px", color: "var(--ink-muted)", fontFamily: "var(--font-mono)" }}>
              Endpoint: https://generativelanguage.googleapis.com
            </div>
          </div>

          {/* Option 2: Local Ollama */}
          <div
            onClick={() => handleSelectProvider("ollama")}
            style={{
              border: provider === "ollama" ? "2px solid var(--accent-500)" : "1px solid var(--rule-strong)",
              background: provider === "ollama" ? "var(--accent-100)" : "var(--surface-sunken)",
              borderRadius: "var(--radius-md)",
              padding: "var(--space-4)",
              cursor: "pointer",
              transition: "all var(--dur-fast) var(--ease-out)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-2)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
                <Server size={20} color="var(--accent-600)" />
                <strong style={{ fontSize: "var(--text-sm)" }}>Local Ollama (Air-Gapped Appliance)</strong>
              </div>
              {provider === "ollama" && (
                <span style={{ fontSize: "11px", background: "var(--accent-500)", color: "var(--ink-onAccent)", padding: "1px 6px", borderRadius: "var(--radius-pill)" }}>
                  Active
                </span>
              )}
            </div>
            <p style={{ fontSize: "var(--text-xs)", color: "var(--ink-secondary)", lineHeight: "1.5", margin: "0 0 10px" }}>
              Air-gapped on-device deployment for State Social Audit Units handling sensitive citizen records.
              Requires local Ollama instance running <code style={{ fontFamily: "var(--font-mono)" }}>gemma4:26b</code>. Zero silent fallback to cloud.
            </p>
            <div style={{ fontSize: "11px", color: "var(--ink-muted)", fontFamily: "var(--font-mono)" }}>
              Endpoint: http://127.0.0.1:11434/api/chat
            </div>
          </div>
        </div>
      </section>

      {/* Strict Model Allowlist (Rule 10) */}
      <section className="card" style={{ marginBottom: "var(--space-5)" }}>
        <h2 style={{ fontSize: "var(--text-md)", fontWeight: "var(--weight-semi)", margin: "0 0 var(--space-3)" }}>
          Strict Model Allowlist (Hard Enforced in backend/gemma/client.py)
        </h2>
        <table className="ledger" style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--text-xs)" }}>
          <thead>
            <tr style={{ background: "var(--surface-sunken)", borderBottom: "1px solid var(--rule-strong)" }}>
              <th style={{ textAlign: "left", padding: "var(--space-2) var(--space-3)" }}>Model ID</th>
              <th style={{ textAlign: "left", padding: "var(--space-2) var(--space-3)" }}>Role & Modality</th>
              <th style={{ textAlign: "left", padding: "var(--space-2) var(--space-3)" }}>Hardware Tier</th>
              <th style={{ textAlign: "right", padding: "var(--space-2) var(--space-3)" }}>API Cost</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: "1px solid var(--rule-ledger)" }}>
              <td style={{ padding: "var(--space-3)", fontFamily: "var(--font-mono)", fontWeight: "var(--weight-semi)", color: "var(--brand-700)" }}>
                gemma-4-26b-a4b-it
              </td>
              <td style={{ padding: "var(--space-3)" }}>
                Multimodal Vision: Document photo → Structured Pydantic extraction
              </td>
              <td style={{ padding: "var(--space-3)", color: "var(--ink-secondary)" }}>
                26B MoE (~4B active params)
              </td>
              <td style={{ padding: "var(--space-3)", textAlign: "right", color: "var(--status-good-ink)", fontWeight: "var(--weight-semi)" }}>
                $0.00 (Free)
              </td>
            </tr>
            <tr style={{ borderBottom: "1px solid var(--rule-ledger)" }}>
              <td style={{ padding: "var(--space-3)", fontFamily: "var(--font-mono)", fontWeight: "var(--weight-semi)", color: "var(--brand-700)" }}>
                gemma-4-31b-it
              </td>
              <td style={{ padding: "var(--space-3)" }}>
                Text Orchestration & Multilingual Evidence Dossier Drafting
              </td>
              <td style={{ padding: "var(--space-3)", color: "var(--ink-secondary)" }}>
                31B Dense Model
              </td>
              <td style={{ padding: "var(--space-3)", textAlign: "right", color: "var(--status-good-ink)", fontWeight: "var(--weight-semi)" }}>
                $0.00 (Free)
              </td>
            </tr>
          </tbody>
        </table>
        <div style={{ marginTop: "var(--space-3)", fontSize: "11px", color: "var(--ink-muted)" }}>
          <ShieldCheck size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />
          Enforcement policy: Any other model ID raises an immediate <code>ValueError</code> before any request leaves the process.
          Zero Gemini fallbacks permitted under hackathon integrity rules.
        </div>
      </section>

      {/* Calibration Policy Card (Phase 14) */}
      <section className="card">
        <h2 style={{ fontSize: "var(--text-md)", fontWeight: "var(--weight-semi)", margin: "0 0 var(--space-3)" }}>
          Earned Abstention & Confidence Calibration Policy
        </h2>
        <div style={{ fontSize: "var(--text-xs)", color: "var(--ink-secondary)", lineHeight: "1.6" }}>
          <p>
            Self-reported confidence is measured empirically rather than trusted. Based on evaluation over n=30 multimodal test documents:
          </p>
          <ul style={{ paddingLeft: "var(--space-4)", margin: "var(--space-2) 0" }}>
            <li><strong>Expected Calibration Error (ECE):</strong> 9.18% · <strong>Brier Score:</strong> 0.1253</li>
            <li><strong>Calibrated Operating Threshold:</strong> ≥ 0.85 (Measured Empirical Accuracy: 97.4% [93.1% – 99.2%])</li>
            <li><strong>Abstention Policy:</strong> Fields with confidence &lt; 0.85 abstain from automated assumption and require human review with side-by-side photo crop.</li>
            <li><strong>Deterministic Arithmetic Invariants:</strong> Wage math, calendar period overlap, and state job card regex patterns are evaluated via pure Python, catching errors independent of model self-confidence.</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
