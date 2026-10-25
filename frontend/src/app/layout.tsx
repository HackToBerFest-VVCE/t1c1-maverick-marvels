import type { Metadata } from "next";
import "@/styles/tokens.css";
import "@/styles/dashboard.css";
import "@/styles/charts.css";
import { AppShellClient } from "./AppShellClient";

export const metadata: Metadata = {
  title: "Saakshi — Social Audit Support for VB-G RAM G",
  description: "Deterministic audit system for rural workers using Google Gemma 4 vision and text models.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="light">
      <body>
        <AppShellClient>{children}</AppShellClient>
      </body>
    </html>
  );
}
