"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  Camera,
  Check,
  AlertTriangle,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  FileText,
  RotateCcw,
} from "lucide-react";

interface FieldState {
  key: string;
  label: string;
  value: string;
  confidence: number;
  confirmed: boolean;
  touched: boolean;
  isIdentifier?: boolean;
}

const INITIAL_JOB_CARD_FIELDS: FieldState[] = [
  {
    key: "days_worked",
    label: "Days Worked on Card",
    value: "6",
    confidence: 0.68, // Low confidence (<0.75), sorts to top
    confirmed: false,
    touched: false,
  },
  {
    key: "job_card_id",
    label: "Job Card Number",
    value: "MH-04-002-019-001/4218",
    confidence: 0.94,
    confirmed: false,
    touched: false,
    isIdentifier: true,
  },
  {
    key: "worker_name",
    label: "Worker Name",
    value: "कमलाबाई रामचंद्र जाधव",
    confidence: 0.88,
    confirmed: false,
    touched: false,
  },
  {
    key: "village_panchayat",
    label: "Gram Panchayat",
    value: "बोरगाव (Borgaon)",
    confidence: 0.92,
    confirmed: false,
    touched: false,
  },
  {
    key: "muster_roll_no",
    label: "Muster Roll Ref",
    value: "MR-2026-0819",
    confidence: 0.91,
    confirmed: false,
    touched: false,
  },
  {
    key: "wage_rate_rupees",
    label: "Daily Wage Rate (₹)",
    value: "300",
    confidence: 0.98,
    confirmed: false,
    touched: false,
  },
];

const CROP_MAP: Record<string, { top: string; height: string; label: string }> = {
  job_card_id: { top: "72px", height: "36px", label: "Job Card Number" },
  worker_name: { top: "114px", height: "36px", label: "Worker Name" },
  village_panchayat: { top: "156px", height: "36px", label: "Gram Panchayat" },
  muster_roll_no: { top: "220px", height: "36px", label: "Muster Roll Ref" },
  days_worked: { top: "264px", height: "42px", label: "Days Worked (Smudged)" },
  wage_rate_rupees: { top: "312px", height: "36px", label: "Daily Wage Rate" },
};

export default function CaptureAndVerifyPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [docType, setDocType] = useState("job_card");
  const [activeKey, setActiveKey] = useState<string>("days_worked");
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});
  const [fields, setFields] = useState<FieldState[]>(INITIAL_JOB_CARD_FIELDS);
  const [uploadedImageSrc, setUploadedImageSrc] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Client-side EXIF stripping via Canvas re-encode
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadStatus("Processing image on device (stripping EXIF & optimizing)...");
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const maxDim = 1600;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        // Re-encoding to JPEG cleanly strips EXIF/GPS metadata
        canvas.toBlob((blob) => {
          if (blob) {
            const cleanUrl = URL.createObjectURL(blob);
            setUploadedImageSrc(cleanUrl);
            setUploadStatus("Photo loaded & stripped. Ready for human verification.");
          }
        }, "image/jpeg", 0.90);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFieldChange = (key: string, val: string) => {
    setFields((prev) =>
      prev.map((f) => (f.key === key ? { ...f, value: val, touched: true } : f))
    );
  };

  const handleConfirmField = (key: string) => {
    setFields((prev) =>
      prev.map((f) => {
        if (f.key === key) {
          // Cannot confirm empty
          if (!f.value.trim()) return f;
          return { ...f, confirmed: true, touched: true };
        }
        return f;
      })
    );
  };

  const flaggedFields = fields.filter((f) => f.confidence < 0.75);
  const allFlaggedTouched = flaggedFields.every((f) => f.touched || f.confirmed);

  const handleConfirmAllRemaining = () => {
    if (!allFlaggedTouched) return;
    setFields((prev) =>
      prev.map((f) => (f.value.trim() ? { ...f, confirmed: true } : f))
    );
  };

  const unconfirmedCount = fields.filter((f) => !f.confirmed).length;
  const isAuditReady = unconfirmedCount === 0;

  const handleRunAudit = async () => {
    if (!isAuditReady) return;
    setSubmitting(true);

    try {
      const workerRecord = {
        worker_name: fields.find((f) => f.key === "worker_name")?.value || "Kamlabai",
        job_card_id: fields.find((f) => f.key === "job_card_id")?.value || "JC-4218",
        days_worked: parseInt(fields.find((f) => f.key === "days_worked")?.value || "6", 10),
        muster_roll_no: fields.find((f) => f.key === "muster_roll_no")?.value || "MR-2026-0819",
        confirmed: true,
      };

      const musterRecord = {
        muster_roll_id: "MR-2026-0819",
        worker_name: "Kamlabai Jadhav",
        job_card_id: "MH-04-002-019-001/4218",
        days_attended: 0,
        muster_close_date: "2026-08-07",
        confirmed: true,
      };

      await fetch("http://127.0.0.1:8000/api/audit/reconcile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          worker_records: [workerRecord],
          muster_records: [musterRecord],
          wage_records: [],
          rate_paise: 30000,
          use_orchestrator: true,
        }),
      });

      router.push("/audit/w1");
    } catch {
      router.push("/audit/w1");
    } finally {
      setSubmitting(false);
    }
  };

  // Sort fields: flagged low confidence first
  const sortedFields = [...fields].sort((a, b) => {
    if (a.confidence < 0.75 && b.confidence >= 0.75) return -1;
    if (a.confidence >= 0.75 && b.confidence < 0.75) return 1;
    return 0;
  });

  const activeCrop = CROP_MAP[activeKey] || CROP_MAP["days_worked"];

  return (
    <div>
      {/* Step 1: Capture Bar */}
      <section className="card" style={{ marginBottom: "var(--space-5)" }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--space-4)" }}>
          <div>
            <label className="filters__label" style={{ display: "block", marginBottom: "4px" }}>
              Document Type:
            </label>
            <select
              className="select"
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              aria-label="Select document type"
            >
              <option value="job_card">Job Card Page</option>
              <option value="passbook">Bank Passbook</option>
              <option value="muster_roll">Muster Roll Printout</option>
              <option value="worksite_board">Worksite Citizen Board</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: "var(--space-3)", marginTop: "16px" }}>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileUpload}
            />
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={16} /> Choose Photo / File
            </button>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera size={16} /> Camera Capture
            </button>
            {uploadedImageSrc && (
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => setUploadedImageSrc(null)}
                style={{ fontSize: "var(--text-xs)" }}
              >
                <RotateCcw size={14} /> Reset to Sample Card
              </button>
            )}
          </div>

          <div style={{ marginLeft: "auto", fontSize: "var(--text-xs)", color: "var(--ink-muted)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <ShieldCheck size={14} color="var(--status-good)" />
              <span>Client-side EXIF/GPS Strip Active</span>
            </div>
          </div>
        </div>
        {uploadStatus && (
          <div style={{ marginTop: "var(--space-3)", fontSize: "var(--text-xs)", color: "var(--brand-700)" }}>
            {uploadStatus}
          </div>
        )}
      </section>

      {/* Step 2: Verification Pane (.verify) */}
      <section className="verify">
        {/* Left: Sticky Image Preview with Precise Active Field Crop */}
        <div className="verify__crop">
          <div
            style={{
              padding: "var(--space-3)",
              background: "var(--surface-sunken)",
              borderBottom: "1px solid var(--rule-hair)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-semi)" }}>
              Source Document Photo
            </span>
            <span
              style={{
                fontSize: "var(--text-xs)",
                color: "var(--accent-600)",
                fontWeight: "var(--weight-semi)",
                background: "var(--accent-100)",
                padding: "2px 8px",
                borderRadius: "var(--radius-pill)",
              }}
            >
              Target: {fields.find((f) => f.key === activeKey)?.label}
            </span>
          </div>

          <div
            style={{
              position: "relative",
              width: "100%",
              minHeight: "460px",
              background: "var(--surface-sunken)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "flex-start",
              padding: "var(--space-3)",
              overflow: "hidden",
            }}
          >
            {uploadedImageSrc ? (
              /* User Uploaded Document View */
              <div style={{ position: "relative", width: "100%", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
                <img
                  src={uploadedImageSrc}
                  alt="Uploaded document"
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
                {/* Scaled Crop Overlay */}
                <div
                  style={{
                    position: "absolute",
                    top: activeCrop.top,
                    left: "4%",
                    width: "92%",
                    height: activeCrop.height,
                    border: "2px solid var(--accent-500)",
                    background: "rgba(199, 125, 19, 0.18)",
                    borderRadius: "3px",
                    boxShadow: "0 0 0 1px rgba(0,0,0,0.5)",
                    pointerEvents: "none",
                    transition: "all 200ms var(--ease-out)",
                  }}
                />
              </div>
            ) : (
              /* Authentic Government Job Card Sheet */
              <div
                style={{
                  width: "100%",
                  background: "#faf9f6",
                  color: "#1a1d20",
                  borderRadius: "4px",
                  border: "1px solid #d5d1c8",
                  padding: "16px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  position: "relative",
                  fontFamily: "var(--font-ui)",
                }}
              >
                {/* Official Register Header */}
                <div
                  style={{
                    borderBottom: "2px solid #0f2740",
                    paddingBottom: "8px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "11px", fontWeight: "bold", color: "#0f2740", letterSpacing: "0.5px" }}>
                      महाराष्ट्र शासन · ग्रामीण विकास विभाग
                    </div>
                    <div style={{ fontSize: "13px", fontWeight: "bold", color: "#1a1d20" }}>
                      महात्मा गांधी / VB-G RAM G रोजगार हमी योजना
                    </div>
                  </div>
                  <div
                    style={{
                      border: "1.5px solid #6b21a8",
                      color: "#6b21a8",
                      fontSize: "9px",
                      fontWeight: "bold",
                      padding: "2px 6px",
                      borderRadius: "2px",
                      textTransform: "uppercase",
                      transform: "rotate(-4deg)",
                    }}
                  >
                    प्रमाणित / VERIFIED
                  </div>
                </div>

                {/* Structured Document Register Entries */}
                <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  {/* Row 1: Job Card ID */}
                  <div
                    onClick={() => setActiveKey("job_card_id")}
                    style={{
                      padding: "6px 8px",
                      borderRadius: "3px",
                      background: activeKey === "job_card_id" ? "rgba(199,125,19,0.08)" : "transparent",
                      cursor: "pointer",
                      fontSize: "12px",
                    }}
                  >
                    <span style={{ color: "#555", fontSize: "11px" }}>जॉब कार्ड क्र. / Job Card No: </span>
                    <strong style={{ fontFamily: "var(--font-mono)" }}>MH-04-002-019-001/4218</strong>
                  </div>

                  {/* Row 2: Worker Name */}
                  <div
                    onClick={() => setActiveKey("worker_name")}
                    style={{
                      padding: "6px 8px",
                      borderRadius: "3px",
                      background: activeKey === "worker_name" ? "rgba(199,125,19,0.08)" : "transparent",
                      cursor: "pointer",
                      fontSize: "12px",
                    }}
                  >
                    <span style={{ color: "#555", fontSize: "11px" }}>कामगाराचे नाव / Worker Name: </span>
                    <strong>कमलाबाई रामचंद्र जाधव</strong>
                  </div>

                  {/* Row 3: Gram Panchayat */}
                  <div
                    onClick={() => setActiveKey("village_panchayat")}
                    style={{
                      padding: "6px 8px",
                      borderRadius: "3px",
                      background: activeKey === "village_panchayat" ? "rgba(199,125,19,0.08)" : "transparent",
                      cursor: "pointer",
                      fontSize: "12px",
                    }}
                  >
                    <span style={{ color: "#555", fontSize: "11px" }}>ग्राम पंचायत / Panchayat: </span>
                    <strong>बोरगाव (Borgaon)</strong>
                  </div>

                  {/* Section: Muster & Days (Ruled Table Box) */}
                  <div
                    style={{
                      marginTop: "4px",
                      border: "1px solid #c5c1b8",
                      borderRadius: "3px",
                      background: "#f4f1ea",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      onClick={() => setActiveKey("muster_roll_no")}
                      style={{
                        padding: "6px 8px",
                        borderBottom: "1px solid #c5c1b8",
                        cursor: "pointer",
                        fontSize: "11px",
                        background: activeKey === "muster_roll_no" ? "rgba(199,125,19,0.08)" : "transparent",
                      }}
                    >
                      <span style={{ color: "#555" }}>मस्टर रोल क्र: </span>
                      <strong style={{ fontFamily: "var(--font-mono)" }}>MR-2026-0819</strong> (01-08-2026 ते 07-08-2026)
                    </div>

                    <div
                      onClick={() => setActiveKey("days_worked")}
                      style={{
                        padding: "8px",
                        borderBottom: "1px solid #c5c1b8",
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        background: activeKey === "days_worked" ? "rgba(199,125,19,0.12)" : "transparent",
                      }}
                    >
                      <span style={{ color: "#555", fontSize: "11px" }}>एकूण उपस्थित दिवस / Days Worked:</span>
                      <span
                        style={{
                          color: "#92400e",
                          fontWeight: "bold",
                          fontSize: "14px",
                          fontFamily: "var(--font-mono)",
                          padding: "1px 6px",
                          background: "#fef3c7",
                          borderRadius: "2px",
                          border: "1px dashed #d97706",
                        }}
                      >
                        [ ६ दिवस / 6 Days ]
                      </span>
                    </div>

                    <div
                      onClick={() => setActiveKey("wage_rate_rupees")}
                      style={{
                        padding: "6px 8px",
                        cursor: "pointer",
                        fontSize: "11px",
                        background: activeKey === "wage_rate_rupees" ? "rgba(199,125,19,0.08)" : "transparent",
                      }}
                    >
                      <span style={{ color: "#555" }}>दैनिक मजुरी दर / Daily Rate: </span>
                      <strong>₹300.00 प्रति दिवस (Section 5(3) Floor)</strong>
                    </div>
                  </div>
                </div>

                {/* Animated Dynamic Crop Highlight Box */}
                <div
                  style={{
                    position: "absolute",
                    top: activeCrop.top,
                    left: "8px",
                    right: "8px",
                    height: activeCrop.height,
                    border: "2px solid var(--accent-500)",
                    background: "rgba(199, 125, 19, 0.14)",
                    borderRadius: "3px",
                    boxShadow: "0 0 0 1px rgba(0,0,0,0.25)",
                    pointerEvents: "none",
                    transition: "all 180ms cubic-bezier(0.22, 1, 0.36, 1)",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      right: "6px",
                      top: "-18px",
                      background: "var(--accent-500)",
                      color: "#fff",
                      fontSize: "9px",
                      padding: "1px 4px",
                      borderRadius: "2px",
                      fontWeight: "bold",
                    }}
                  >
                    TARGET
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Extracted Fields */}
        <div className="card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "var(--space-4)",
            }}
          >
            <div>
              <h3 className="card__title">Human Verification Gate</h3>
              <p style={{ margin: "2px 0 0", fontSize: "var(--text-xs)", color: "var(--ink-muted)" }}>
                You take responsibility for verified figures before audit computation.
              </p>
            </div>
            <button
              type="button"
              className="btn btn--secondary"
              style={{ fontSize: "var(--text-xs)", padding: "4px 8px" }}
              disabled={!allFlaggedTouched}
              onClick={handleConfirmAllRemaining}
              title={
                allFlaggedTouched
                  ? "Confirm all remaining unflagged fields"
                  : "Touch all flagged fields first before confirming remaining"
              }
            >
              Confirm all remaining
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            {sortedFields.map((field) => {
              const isFlagged = field.confidence < 0.75;
              const isRevealed = revealedIds[field.key];
              const displayVal =
                field.isIdentifier && !isRevealed
                  ? `•••• ${field.value.slice(-4)}`
                  : field.value;

              const isCurrent = activeKey === field.key;

              return (
                <div
                  key={field.key}
                  className="verify__field"
                  data-flagged={isFlagged ? "true" : "false"}
                  onClick={() => setActiveKey(field.key)}
                  style={{
                    border: isCurrent ? "1px solid var(--brand-500)" : undefined,
                    borderRadius: "4px",
                    padding: "8px",
                    cursor: "pointer",
                    transition: "border-color 150ms ease",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                      <span className="verify__key">{field.label}</span>
                      {isFlagged && (
                        <span
                          style={{
                            fontSize: "11px",
                            color: "var(--accent-600)",
                            fontWeight: "var(--weight-semi)",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "2px",
                          }}
                        >
                          <AlertTriangle size={11} /> Please check this field
                        </span>
                      )}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <input
                        type="text"
                        className="input"
                        value={displayVal}
                        onChange={(e) => handleFieldChange(field.key, e.target.value)}
                        style={{
                          width: "100%",
                          fontWeight: "var(--weight-semi)",
                          fontSize: "var(--text-sm)",
                          borderColor: field.confirmed ? "var(--status-good)" : undefined,
                        }}
                      />
                      {field.isIdentifier && (
                        <button
                          type="button"
                          className="btn btn--ghost"
                          style={{ padding: "4px" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setRevealedIds((prev) => ({ ...prev, [field.key]: !prev[field.key] }));
                          }}
                          aria-label={isRevealed ? "Mask identifier" : "Reveal identifier"}
                        >
                          {isRevealed ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
                    {/* Confidence Meter */}
                    <div
                      className="conf"
                      data-level={
                        field.confidence >= 0.85
                          ? "high"
                          : field.confidence >= 0.75
                          ? "medium"
                          : "low"
                      }
                      title={`Model confidence: ${Math.round(field.confidence * 100)}%`}
                    >
                      <span>{Math.round(field.confidence * 100)}%</span>
                      <div className="conf__track">
                        <div className="conf__fill" />
                      </div>
                    </div>

                    {/* Explicit Confirm Button */}
                    <button
                      type="button"
                      className={`btn ${field.confirmed ? "btn--secondary" : "btn--action"}`}
                      style={{ padding: "4px 8px", fontSize: "var(--text-xs)" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConfirmField(field.key);
                      }}
                    >
                      {field.confirmed ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "var(--status-good-ink)" }}>
                          <Check size={14} /> Confirmed
                        </span>
                      ) : (
                        "Confirm"
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Step 3: Gate */}
          <div
            style={{
              marginTop: "var(--space-6)",
              paddingTop: "var(--space-4)",
              borderTop: "1px solid var(--rule-strong)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              {!isAuditReady ? (
                <span style={{ fontSize: "var(--text-xs)", color: "var(--accent-600)", fontWeight: "var(--weight-semi)" }}>
                  {unconfirmedCount} {unconfirmedCount === 1 ? "field" : "fields"} still need checking before computation
                </span>
              ) : (
                <span
                  style={{
                    fontSize: "var(--text-xs)",
                    color: "var(--status-good-ink)",
                    fontWeight: "var(--weight-semi)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <Check size={14} /> All fields confirmed by auditor
                </span>
              )}
            </div>

            <button
              type="button"
              className="btn btn--primary"
              disabled={!isAuditReady || submitting}
              onClick={handleRunAudit}
            >
              {submitting ? "Computing with Engine..." : "Run Deterministic Audit"} <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
