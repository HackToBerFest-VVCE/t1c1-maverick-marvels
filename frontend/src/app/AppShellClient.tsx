"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Masthead, Sidebar } from "@/components/Navigation";
import { ChevronRight } from "lucide-react";

export function AppShellClient({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname.startsWith("/audit/new")) return "Document Capture & Verification";
    if (pathname.startsWith("/audit/")) return "Audit Findings & Evidence Dossier";
    if (pathname.startsWith("/demo/reader")) return "Hardware Reader & NFC Tap";
    return "Social Audit Resource Person (SARP) Overview";
  };

  return (
    <div className="app" data-sidebar={sidebarOpen ? "open" : "default"}>
      <Masthead onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <header className="topbar">
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/dashboard">Saakshi</Link>
            <ChevronRight size={12} />
            <span>VB-G RAM G Cycle 2026-Q3</span>
          </nav>
          <h1 className="topbar__title">{getPageTitle()}</h1>
        </div>
        <div className="topbar__spacer" />
      </header>

      <main className="main">
        {children}
      </main>
    </div>
  );
}
