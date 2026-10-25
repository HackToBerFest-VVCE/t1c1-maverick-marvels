"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ScanLine,
  FileSpreadsheet,
  Cpu,
  Activity,
  Menu,
  X,
  ShieldAlert,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function Masthead({ onToggleSidebar }: { onToggleSidebar: () => void }) {
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

      <ThemeToggle />
    </header>
  );
}

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();

  const navLinks = [
    { href: "/dashboard", label: "SARP Dashboard", icon: LayoutDashboard, count: "86", attention: true },
    { href: "/audit/new", label: "Capture & Verify", icon: ScanLine },
    { href: "/dashboard#ledger", label: "Discrepancy Ledger", icon: FileSpreadsheet },
    { href: "/demo/reader", label: "Hardware Reader (NFC)", icon: Cpu },
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
