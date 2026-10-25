"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ScanLine,
  FileSpreadsheet,
  Cpu,
  Layers,
  Settings,
  Menu,
  Server,
  Cloud,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function Masthead({ onToggleSidebar }: { onToggleSidebar: () => void }) {
  const [provider, setProvider] = useState<string>("gemini_api");
  const [switching, setSwitching] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  React.useEffect(() => {
    fetch("http://127.0.0.1:8000/api/gemma/provider")
      .then((res) => res.json())
      .then((data) => {
        if (data?.active_provider) {
          setProvider(data.active_provider);
        }
      })
      .catch(() => {});
  }, []);

  const handleToggleProvider = async () => {
    const nextProvider = provider === "gemini_api" ? "ollama" : "gemini_api";
    setSwitching(true);
    setErrorMsg(null);
    try {
      const res = await fetch("http://127.0.0.1:8000/api/gemma/provider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: nextProvider }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Provider switch failed");
      }
      setProvider(data.active_provider);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(null), 5000);
    } finally {
      setSwitching(false);
    }
  };

  return (
    <header className="masthead">
      <button
        type="button"
        className="btn btn--ghost"
        onClick={onToggleSidebar}
        style={{ color: "var(--ink-onDark)", padding: "4px 8px", marginRight: "4px" }}
        aria-label="Toggle navigation menu"
      >
        <Menu size={20} />
      </button>

      <div className="masthead__mark">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
        <span>SAAKSHI</span>
      </div>

      <div className="masthead__sub">
        Social audit support · VB-G RAM G
      </div>

      <div className="masthead__spacer" />

      {/* Runtime Gemma Provider Toggle (Phase 15) */}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", marginRight: "var(--space-3)" }}>
        {errorMsg && (
          <span style={{ fontSize: "11px", color: "var(--status-critical)", background: "rgba(208, 59, 59, 0.2)", padding: "2px 6px", borderRadius: "var(--radius-xs)" }}>
            {errorMsg}
          </span>
        )}
        <button
          type="button"
          onClick={handleToggleProvider}
          disabled={switching}
          className="btn btn--ghost"
          style={{
            color: "var(--ink-onDark)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            padding: "3px 8px",
            fontSize: "11px",
            fontFamily: "var(--font-mono)",
            background: provider === "ollama" ? "rgba(217, 89, 38, 0.25)" : "rgba(42, 120, 214, 0.25)",
            cursor: switching ? "wait" : "pointer",
          }}
          title="Click to toggle between Google Gemini API and Local Ollama inference"
        >
          {provider === "ollama" ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
              <Server size={13} color="#f0b429" />
              <strong>[LOCAL OLLAMA]</strong>
            </span>
          ) : (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
              <Cloud size={13} color="#5ddb5d" />
              <strong>[GEMINI API]</strong>
            </span>
          )}
        </button>
      </div>

      <ThemeToggle />
    </header>
  );
}

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();

  const navLinks = [
    { href: "/dashboard", label: "SARP Dashboard", icon: LayoutDashboard, count: "86", attention: true },
    { href: "/audit/new", label: "Capture & Verify", icon: ScanLine },
    { href: "/reconcile/borgaon", label: "Muster Reconciler", icon: Layers },
    { href: "/dashboard#ledger", label: "Discrepancy Ledger", icon: FileSpreadsheet },
    { href: "/demo/reader", label: "Hardware Reader (NFC)", icon: Cpu },
    { href: "/settings", label: "Inference Settings", icon: Settings },
  ];

  return (
    <aside className="sidebar" style={{ transform: isOpen ? "translateX(0)" : undefined }}>
      <div className="sidebar__group">
        <div className="sidebar__label">Auditing Navigation</div>
        <nav>
          {navLinks.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.href === "/dashboard" && pathname === "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className="nav-item"
                aria-current={active ? "page" : undefined}
                onClick={onClose}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.count && (
                  <span
                    className="nav-item__count"
                    data-attention={item.attention ? "true" : "false"}
                  >
                    {item.count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="sidebar__group" style={{ marginTop: "auto", borderTop: "1px solid var(--rule-hair)", paddingTop: "var(--space-4)" }}>
        <div className="sidebar__label">Gemma 4 Models</div>
        <div style={{ padding: "0 var(--space-5)", fontSize: "var(--text-xs)", color: "var(--ink-muted)", lineHeight: "1.5" }}>
          <div><strong style={{ color: "var(--ink-secondary)" }}>Vision:</strong> gemma-4-26b-a4b-it</div>
          <div><strong style={{ color: "var(--ink-secondary)" }}>Drafting:</strong> gemma-4-31b-it</div>
          <div style={{ marginTop: "6px", color: "var(--status-good-ink)" }}>● Free tier / Strict allowlist</div>
        </div>
      </div>
    </aside>
  );
}
