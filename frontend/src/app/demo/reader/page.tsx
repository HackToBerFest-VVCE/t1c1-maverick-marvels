"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Cpu, Smartphone, Radio, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";

export default function DemoReaderPage() {
  const [cardNumber, setCardNumber] = useState("MH-04-002-019-001/4218");
  const [loading, setLoading] = useState(false);
  const [tftState, setTftState] = useState<{
    line1: string;
    line2: string;
    line3: string;
    line4: string;
    statusColor: string;
  }>({
    line1: "SAAKSHI AUDIT",
    line2: "TAP NTAG213 CARD",
    line3: "READY TO SCAN",
    line4: "VB-G RAM G",
    statusColor: "#c5c3ba",
  });

  const handleSimulateTap = async (cardVal: string) => {
    setLoading(true);
    setTftState({
      line1: "CARD DETECTED",
      line2: `ID: •••• ${cardVal.slice(-4)}`,
      line3: "RESOLVING...",
      line4: "PLEASE WAIT",
      statusColor: "#fab219",
    });

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/nfc/resolve?job_card=${encodeURIComponent(cardVal)}`, {
        headers: {
          Authorization: "Bearer demo-device-secret-123",
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.found) {
          setTftState({
            line1: data.name_latin.toUpperCase(),
            line2: `GP: ${data.panchayat_latin.toUpperCase()}`,
            line3: `MISSING: ${data.days_missing} DAYS`,
            line4: `UNPAID: ₹${(data.unpaid_paise / 100).toFixed(2)}`,
            statusColor: "#d03b3b",
          });
        } else {
          setTftState({
            line1: "AUDIT RESOLVED",
            line2: "NO RECORD ON FILE",
            line3: "RUN AUDIT FIRST",
            line4: "VB-G RAM G",
            statusColor: "#7c828c",
          });
        }
      } else {
        throw new Error("HTTP error");
      }
    } catch {
      // Offline fallback simulation
      setTimeout(() => {
        if (cardVal.includes("4218")) {
          setTftState({
            line1: "KAMLABAI JADHAV",
            line2: "GP: BORGAON",
            line3: "MISSING: 6 DAYS",
            line4: "UNPAID: ₹1800.00",
            statusColor: "#d03b3b",
          });
        } else {
          setTftState({
            line1: "SANTOSH MHATRE",
            line2: "GP: BORGAON",
            line3: "MISSING: 4 DAYS",
            line4: "UNPAID: ₹1200.00",
            statusColor: "#d03b3b",
          });
        }
      }, 350);
    } finally {
      setLoading(false);
    }
  };

  const handleWebNfcScan = async () => {
    if (!("NDEFReader" in window)) {
      alert("Web NFC is only supported on Chrome for Android over HTTPS.");
      return;
    }

    try {
      // @ts-ignore
      const ndef = new window.NDEFReader();
      await ndef.scan();
      // @ts-ignore
      ndef.onreading = (event: any) => {
        const decoder = new TextDecoder();
        for (const record of event.message.records) {
          const text = decoder.decode(record.data);
          setCardNumber(text);
          handleSimulateTap(text);
        }
      };
    } catch (err) {
      alert(`NFC Scan error: ${err}`);
    }
  };

  return (
    <div>
      <div className="section__head">
        <h2 className="section__title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Cpu size={20} /> Hardware Demo Prop: ESP32 + NTAG213 Reader
        </h2>
        <span className="section__meta">
          Demo Safety Net Simulation & Web NFC
        </span>
      </div>

      {/* Scope Discipline Alert */}
      <div
        className="card"
        style={{
          background: "var(--surface-sunken)",
          borderLeft: "3px solid var(--brand-500)",
          marginBottom: "var(--space-6)",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: "var(--space-3)" }}>
          <ShieldCheck size={20} color="var(--brand-500)" style={{ flexShrink: 0, marginTop: "2px" }} />
          <div style={{ fontSize: "var(--text-sm)", lineHeight: "1.6" }}>
            <strong>NFC Card Storage Policy:</strong> The NTAG213 card holds <strong>only 18 bytes</strong> — the worker's Job Card number. An NTAG213 has only 144 bytes of user memory, while a document photo exceeds 300,000 bytes. <em>No documents or personal identifiers are stored on the card.</em>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "var(--space-6)" }}>
        {/* Left: Simulated 1.8" ST7735 TFT Screen */}
        <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <h3 className="card__title" style={{ marginBottom: "var(--space-4)" }}>
            ESP32 1.8" TFT Display Readout
          </h3>

          {/* Physical Device Enclosure Mock */}
          <div
            style={{
              width: "240px",
              height: "300px",
              background: "#1c1e22",
              borderRadius: "12px",
              padding: "20px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
              border: "3px solid #2e3238",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            {/* TFT Screen Glass */}
            <div
              style={{
                width: "200px",
                height: "220px",
                background: "#080c10",
                borderRadius: "4px",
                border: `2px solid ${tftState.statusColor}`,
                padding: "16px",
                fontFamily: "var(--font-mono)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-around",
                color: "#e6eaf0",
                fontSize: "12px",
                textShadow: "0 0 4px rgba(255,255,255,0.4)",
              }}
            >
              <div style={{ color: tftState.statusColor, fontWeight: "bold", borderBottom: "1px solid rgba(255,255,255,0.2)", paddingBottom: "4px" }}>
                {tftState.line1}
              </div>
              <div style={{ fontSize: "11px", color: "#a0a8b4" }}>
                {tftState.line2}
              </div>
              <div style={{ fontWeight: "bold", color: "#fab219" }}>
                {tftState.line3}
              </div>
              <div style={{ fontSize: "13px", fontWeight: "bold", color: "#ff6b6b" }}>
                {tftState.line4}
              </div>
            </div>

            <div style={{ fontSize: "10px", color: "#666", letterSpacing: "1px" }}>
              SAAKSHI ESP32 READER
            </div>
          </div>
        </div>

        {/* Right: Simulation Controls & Android Web NFC */}
        <div className="card">
          <h3 className="card__title" style={{ marginBottom: "var(--space-4)" }}>
            Virtual Card Tap & Web NFC
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
            <div>
              <label className="filters__label" style={{ display: "block", marginBottom: "6px" }}>
                Select Demo NTAG213 Card:
              </label>
              <div style={{ display: "flex", gap: "var(--space-3)" }}>
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={() => {
                    setCardNumber("MH-04-002-019-001/4218");
                    handleSimulateTap("MH-04-002-019-001/4218");
                  }}
                  disabled={loading}
                >
                  <Radio size={14} /> Tap Card 4218 (Kamlabai)
                </button>
                <button
                  type="button"
                  className="btn btn--secondary"
                  onClick={() => {
                    setCardNumber("MH-04-002-019-002/1092");
                    handleSimulateTap("MH-04-002-019-002/1092");
                  }}
                  disabled={loading}
                >
                  <Radio size={14} /> Tap Card 1092 (Santosh)
                </button>
              </div>
            </div>

            <div style={{ borderTop: "1px solid var(--rule-ledger)", paddingTop: "var(--space-4)" }}>
              <label className="filters__label" style={{ display: "block", marginBottom: "6px" }}>
                Manual Job Card Entry:
              </label>
              <div style={{ display: "flex", gap: "var(--space-2)" }}>
                <input
                  type="text"
                  className="input"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  style={{ width: "100%", fontFamily: "var(--font-mono)" }}
                />
                <button
                  type="button"
                  className="btn btn--action"
                  onClick={() => handleSimulateTap(cardNumber)}
                  disabled={loading}
                >
                  Simulate Tap
                </button>
              </div>
            </div>

            <div style={{ borderTop: "1px solid var(--rule-ledger)", paddingTop: "var(--space-4)" }}>
              <button
                type="button"
                className="btn btn--primary"
                style={{ width: "100%" }}
                onClick={handleWebNfcScan}
              >
                <Smartphone size={16} /> Scan Physical Card with Android Web NFC
              </button>
              <p style={{ fontSize: "var(--text-xs)", color: "var(--ink-muted)", marginTop: "6px" }}>
                Requires Android Chrome with NFC turned on. If Web NFC is unsupported, use the virtual buttons above.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
