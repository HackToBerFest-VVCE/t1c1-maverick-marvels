"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("saakshi-theme") as "light" | "dark" | null;
      if (saved) {
        setTheme(saved);
        document.documentElement.setAttribute("data-theme", saved);
      } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        setTheme("dark");
        document.documentElement.setAttribute("data-theme", "dark");
      }
    } catch {
      // LocalStorage might fail in private windows
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    try {
      localStorage.setItem("saakshi-theme", nextTheme);
    } catch {
      // Ignore in private windows
    }
  };

  return (
    <button
      type="button"
      className="btn btn--ghost"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      style={{ padding: "6px 10px", color: "var(--ink-onDark)" }}
    >
      {theme === "light" ? (
        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
          <Moon size={16} /> Dark
        </span>
      ) : (
        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
          <Sun size={16} /> Light
        </span>
      )}
    </button>
  );
}
