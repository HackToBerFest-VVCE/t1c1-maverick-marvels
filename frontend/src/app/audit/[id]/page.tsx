"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  Volume2,
  Printer,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Scale,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

interface DraftsState {
  grievance_letter: string;
  muster_request_letter: string;
  gram_sabha_finding: string;
}

const DEFAULT_DRAFTS_HI: DraftsState = {
  grievance_letter: `सेवा में,\nकार्यक्रम अधिकारी (PO), VB-G RAM G\nपंचायत समिति, बोरगाव\n\nविषय: मस्टर रोल क्र. MR-2026-0819 की बकाया मजदूरी ₹1,800 एवं विलंब मुआवजा ₹21.60 भुगतान बाबत।\n\nमहोदय,\nमैं कमलाबाई रामचंद्र जाधव (जॉब कार्ड क्र. MH-04-002-019-001/4218) निवेदन करती हूँ कि मैंने दिनांक 01-08-2026 से 07-08-2026 के दौरान 6 दिन कार्य किया है। इसका अंकन मेरे जॉब कार्ड पर दर्ज है, किंतु मस्टर रोल में अनुपस्थित दर्शाया गया है।\n\nVB-G RAM G अधिनियम की धारा 5(3) एवं अनुसूची II पैरा 6 के प्रावधानों के तहत 16 दिनों के पश्चात भुगतान में विलंब होने पर 0.05% प्रतिदिन की दर से ₹21.60 का विलंब मुआवजा देय है।\n\nअतः कुल ₹1,821.60 की राशि अविलंब मेरे बैंक खाते में अंतरित करने का कष्ट करें।\n\nभवदीया,\nकमलाबाई रामचंद्र जाधव\nग्राम: बोरगाव`,
  muster_request_letter: `सेवा में,\nग्राम पंचायत सचिव / कार्यक्रम अधिकारी\n\nविषय: अनुसूची I पैरा 32 के अंतर्गत मस्टर रोल की निःशुल्क प्रमाणित प्रति उपलब्ध कराने हेतु आवेदन।\n\nमहोदय,\nमैं कमलाबाई रामचंद्र जाधव (जॉब कार्ड: •••• 4218) VB-G RAM G अधिनियम की अनुसूची I के पैरा 32 के तहत प्रदत्त विधिक अधिकार का उपयोग करते हुए मस्टर रोल क्र. MR-2026-0819 की प्रमाणित छायाप्रति 7 दिवस के भीतर निःशुल्क प्राप्त करने का अनुरोध करती हूँ, ताकि सामाजिक अंकेक्षण में साक्ष्य प्रस्तुत किया जा सके।\n\nभवदीया,\nकमलाबाई रामचंद्र जाधव`,
  gram_sabha_finding: `ग्राम सभा सामाजिक अंकेक्षण वक्तव्य (सस्वर वाचन हेतु):\n\n"उपस्थित ग्रामवासियों एवं अधिकारियों का ध्यान आकर्षित किया जाता है कि बोरगाव की कामगार कमलाबाई रामचंद्र जाधव ने दिनांक 1 से 7 अगस्त 2026 तक 6 कार्य दिवस पूरे किए।\n\nसरकारी मस्टर रोल में उनकी उपस्थिति दर्ज न होने के कारण ₹1,800 की मजदूरी अवैधानिक रूप से रोक ली गई। इसके अतिरिक्त 24 दिनों के विलंब हेतु ₹21.60 का कानूनी मुआवजा बनता है।\n\nकुल राशि ₹1,821.60 प्रशासन द्वारा अविलंब कामगार के खाते में जमा कराई जाए।"`,
};

const DEFAULT_DRAFTS_MR: DraftsState = {
  grievance_letter: `प्रति,\nकार्यक्रम अधिकारी, व्हीबी-जी राम जी\nपंचायत समिती, बोरगाव\n\nविषय: मस्टर रोल क्र. MR-2026-0819 चे थकीत वेतन ₹1,800 व विलंब भरपाई ₹21.60 मिळण्याबाबत तक्रार.\n\nमहोदय,\nमी कमलाबाई रामचंद्र जाधव (जॉब कार्ड क्र. •••• 4218) तक्रार नोंदवते की मी 01-08-2026 ते 07-08-2026 दरम्यान 6 दिवस प्रत्यक्ष काम केले असून त्याची नोंद जॉब कार्डवर आहे. मात्र मस्टर रोलवर शून्य उपस्थिती दर्शवून वेतन रोखण्यात आले.\n\nकायद्याचे कलम 5(3) व अनुसूची II परिच्छेद 6 अन्वये 16 दिवसांनंतरच्या विलंबासाठी 0.05% दराने ₹21.60 भरपाईसह एकूण ₹1,821.60 तात्काळ माझ्या खात्यावर जमा करावेत.\n\nआपली नम्र,\nकमलाबाई जाधव`,
  muster_request_letter: `प्रति,\nग्रामसेवक / कार्यक्रम अधिकारी\n\nविषय: अनुसूची I परिच्छेद 32 अन्वये मस्टर रोलच्या प्रमाणित प्रती मोफत मिळण्याबाबत.\n\nमहोदय,\nमी कमलाबाई रामचंद्र जाधव अनुसूची I परिच्छेद 32 अन्वये मस्टर रोल क्र. MR-2026-0819 ची प्रमाणित सत्यप्रत 7 दिवसांत मोफत मिळण्याची मागणी करते.\n\nकमलाबाई जाधव`,
  gram_sabha_finding: `ग्रामसभेत वाचनासाठी सामाजिक अंकेक्षण अहवाल:\n\n"ग्रामसभेच्या निदर्शनास आणून देण्यात येते की बोरगाव येथील कामगार कमलाबाई जाधव यांनी 6 दिवस काम करूनही त्यांचे ₹1,800 चे वेतन मस्टरवर गायब झाले आहे. कायद्यानुसार 24 दिवसांच्या विलंबाचे ₹21.60 भरपाई धरून एकूण ₹1,821.60 देणे बंधनकारक आहे."`,
};

export default function AuditReportPage() {
  const params = useParams();
  const workerId = params?.id || "w1";

  const [language, setLanguage] = useState<string>("hi");
  const [drafts, setDrafts] = useState<DraftsState>(DEFAULT_DRAFTS_HI);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [expandedClause, setExpandedClause] = useState<string | null>("sch2_p6");

  useEffect(() => {
    if (language === "mr") {
      setDrafts(DEFAULT_DRAFTS_MR);
    } else {
      setDrafts(DEFAULT_DRAFTS_HI);
    }
  }, [language]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleReadAloud = () => {
    if (!("speechSynthesis" in window)) {
      alert("Web Speech API is not supported on this browser.");
      return;
    }

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(drafts.gram_sabha_finding);
    utterance.lang = language === "mr" ? "mr-IN" : "hi-IN";
    utterance.rate = 0.95;

    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);

    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      {/* Top action row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-5)" }}>
        <Link href="/dashboard" className="btn btn--secondary" style={{ padding: "6px 10px" }}>
          <ArrowLeft size={16} /> Back to SARP Dashboard
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
          <label style={{ fontSize: "var(--text-xs)", color: "var(--ink-muted)", fontWeight: "var(--weight-semi)" }}>
            Draft Language:
          </label>
          <select
            className="select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            aria-label="Select draft language"
          >
            <option value="hi">Hindi (हिंदी)</option>
            <option value="mr">Marathi (मराठी)</option>
            <option value="ta">Tamil (தமிழ்)</option>
            <option value="te">Telugu (తెలుగు)</option>
            <option value="bn">Bengali (বাংলা)</option>
            <option value="or">Odia (ଓଡ଼ିଆ)</option>
            <option value="en">English</option>
          </select>

          <button type="button" className="btn btn--secondary" onClick={handlePrint}>
            <Printer size={16} /> Print / Export PDF
          </button>
        </div>
      </div>

      {/* Hero Figure: Total Amount Legally Owed */}
      <section className="card" style={{ marginBottom: "var(--space-6)", borderLeft: "4px solid var(--accent-500)" }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "baseline" }}>
          <div>
            <span style={{ fontSize: "var(--text-xs)", textTransform: "uppercase", letterSpacing: "var(--tracking-caps)", color: "var(--ink-muted)", fontWeight: "var(--weight-semi)" }}>
              Total Legally Owed to Worker
            </span>
            <div style={{ fontFamily: "var(--font-num)", fontSize: "var(--text-hero)", fontWeight: "var(--weight-bold)", color: "var(--ink-primary)", marginTop: "4px" }}>
              ₹1,821.60
            </div>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--ink-muted)", marginTop: "4px" }}>
              Worker: <strong>कमलाबाई रामचंद्र जाधव</strong> · Job Card: <code>•••• 4218</code> · GP: बोरगाव
            </div>
          </div>

          <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "4px", fontSize: "var(--text-sm)", textAlign: "right" }}>
            <div>Unpaid Wages: <strong>₹1,800.00</strong> (180,000 paise)</div>
            <div>Delay Compensation: <strong>₹21.60</strong> (2,160 paise)</div>
            <div style={{ color: "var(--status-crit-ink)", fontSize: "var(--text-xs)" }}>
              Payment delayed 24 days beyond 16-day statutory window
            </div>
          </div>
        </div>

        {/* Worked Arithmetic Explanation Box */}
        <div
          style={{
            marginTop: "var(--space-4)",
            padding: "var(--space-3) var(--space-4)",
            background: "var(--surface-sunken)",
            borderRadius: "var(--radius-sm)",
            fontSize: "var(--text-xs)",
            borderLeft: "2px solid var(--rule-strong)",
          }}
        >
          <strong>Worked Arithmetic (Verifiable by Gram Sabha):</strong>
          <div style={{ marginTop: "4px", color: "var(--ink-secondary)", lineHeight: "1.6" }}>
            1. <strong>Wage due:</strong> 6 missing days × ₹300.00 statutory floor rate (Section 5(3)) = ₹1,800.00 (180,000 paise).<br />
            2. <strong>Delay window:</strong> Muster closed 2026-08-07; grace period ended day 16 (2026-08-23). Discrepancy identified on day 40 (2026-09-16).<br />
            3. <strong>Delay days:</strong> 40 − 16 = 24 delay days.<br />
            4. <strong>Compensation:</strong> 180,000 paise × 0.0005 × 24 days = 2,160 paise = <strong>₹21.60</strong> (Schedule II, Paragraph 6).
          </div>
        </div>
      </section>

      {/* Statutory Legal Citations */}
      <section className="section">
        <div className="section__head">
          <h2 className="section__title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Scale size={18} /> Statutory Legal Grounds (VB-G RAM G Provisions)
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "var(--space-4)" }}>
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong>Section 5(3) — Minimum Wage Floor</strong>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => setExpandedClause(expandedClause === "s5_3" ? null : "s5_3")}
                style={{ padding: "2px 6px" }}
              >
                {expandedClause === "s5_3" ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>
            <p style={{ fontSize: "var(--text-xs)", color: "var(--ink-secondary)", marginTop: "6px" }}>
              Guarantees statutory ₹300 daily rate floor for manual rural work.
            </p>
            {expandedClause === "s5_3" && (
              <div style={{ fontSize: "11px", color: "var(--ink-muted)", marginTop: "6px", borderTop: "1px solid var(--rule-ledger)", paddingTop: "6px" }}>
                <em>"The wage rate notified by the Central Government for VB-G RAM G workers shall not be less than three hundred rupees per day."</em>
              </div>
            )}
          </div>

          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong>Schedule II, Paragraph 6 — Delay Compensation</strong>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => setExpandedClause(expandedClause === "sch2_p6" ? null : "sch2_p6")}
                style={{ padding: "2px 6px" }}
              >
                {expandedClause === "sch2_p6" ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>
            <p style={{ fontSize: "var(--text-xs)", color: "var(--ink-secondary)", marginTop: "6px" }}>
              0.05% per day compensation on unpaid wages delayed beyond 16 days.
            </p>
            {expandedClause === "sch2_p6" && (
              <div style={{ fontSize: "11px", color: "var(--ink-muted)", marginTop: "6px", borderTop: "1px solid var(--rule-ledger)", paddingTop: "6px" }}>
                <em>"In case of delay in payment of wages beyond sixteen days of muster roll closure, workers shall be entitled to compensation at the rate of 0.05% of the unpaid wages per day of delay."</em>
              </div>
            )}
          </div>

          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong>Schedule I, Paragraph 32 — Free Muster Copies</strong>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => setExpandedClause(expandedClause === "sch1_p32" ? null : "sch1_p32")}
                style={{ padding: "2px 6px" }}
              >
                {expandedClause === "sch1_p32" ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>
            <p style={{ fontSize: "var(--text-xs)", color: "var(--ink-secondary)", marginTop: "6px" }}>
              Right to obtain certified photocopies of muster rolls free of cost within 7 days.
            </p>
            {expandedClause === "sch1_p32" && (
              <div style={{ fontSize: "11px", color: "var(--ink-muted)", marginTop: "6px", borderTop: "1px solid var(--rule-ledger)", paddingTop: "6px" }}>
                <em>"Every worker or social audit resource person shall be entitled to inspect muster rolls and obtain certified photocopies free of charge within seven days of application."</em>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Three Evidence Drafts (Gemma 4 31B) */}
      <section className="section">
        <div className="section__head">
          <h2 className="section__title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <FileText size={18} /> Official Evidence Dossier & Filings
          </h2>
          <span className="section__meta" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Sparkles size={14} color="var(--brand-500)" /> Drafted by Gemma 4 31B
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
          {/* Document 1: Grievance Letter */}
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-3)" }}>
              <strong style={{ fontSize: "var(--text-sm)" }}>1. Statutory Grievance Letter to Programme Officer</strong>
              <button
                type="button"
                className="btn btn--secondary"
                style={{ padding: "4px 8px", fontSize: "var(--text-xs)" }}
                onClick={() => copyToClipboard(drafts.grievance_letter, "grievance")}
              >
                {copiedKey === "grievance" ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "var(--status-good-ink)" }}>
                    <Check size={14} /> Copied
                  </span>
                ) : (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <Copy size={14} /> Copy Text
                  </span>
                )}
              </button>
            </div>
            <textarea
              className="input"
              rows={8}
              value={drafts.grievance_letter}
              onChange={(e) => setDrafts({ ...drafts, grievance_letter: e.target.value })}
              style={{ width: "100%", fontFamily: "var(--font-ui)", lineHeight: "1.6", fontSize: "var(--text-sm)" }}
            />
          </div>

          {/* Document 2: Request for Free Muster Copies */}
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-3)" }}>
              <strong style={{ fontSize: "var(--text-sm)" }}>2. Formal Application for Free Certified Muster Copies (Schedule I ¶32)</strong>
              <button
                type="button"
                className="btn btn--secondary"
                style={{ padding: "4px 8px", fontSize: "var(--text-xs)" }}
                onClick={() => copyToClipboard(drafts.muster_request_letter, "muster")}
              >
                {copiedKey === "muster" ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "var(--status-good-ink)" }}>
                    <Check size={14} /> Copied
                  </span>
                ) : (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <Copy size={14} /> Copy Text
                  </span>
                )}
              </button>
            </div>
            <textarea
              className="input"
              rows={6}
              value={drafts.muster_request_letter}
              onChange={(e) => setDrafts({ ...drafts, muster_request_letter: e.target.value })}
              style={{ width: "100%", fontFamily: "var(--font-ui)", lineHeight: "1.6", fontSize: "var(--text-sm)" }}
            />
          </div>

          {/* Document 3: Gram Sabha Finding Sheet (with Read Aloud) */}
          <div className="card" style={{ borderLeft: "3px solid var(--brand-500)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-3)" }}>
              <strong style={{ fontSize: "var(--text-sm)" }}>3. Gram Sabha Finding Sheet (Spoken Script)</strong>
              <div style={{ display: "flex", gap: "var(--space-2)" }}>
                <button
                  type="button"
                  className="btn btn--action"
                  style={{ padding: "4px 10px", fontSize: "var(--text-xs)" }}
                  onClick={handleReadAloud}
                >
                  <Volume2 size={14} /> {speaking ? "Stop Speech" : "Read Aloud (TTS)"}
                </button>
                <button
                  type="button"
                  className="btn btn--secondary"
                  style={{ padding: "4px 8px", fontSize: "var(--text-xs)" }}
                  onClick={() => copyToClipboard(drafts.gram_sabha_finding, "gram_sabha")}
                >
                  {copiedKey === "gram_sabha" ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
            </div>
            <textarea
              className="input"
              rows={6}
              value={drafts.gram_sabha_finding}
              onChange={(e) => setDrafts({ ...drafts, gram_sabha_finding: e.target.value })}
              style={{ width: "100%", fontFamily: "var(--font-ui)", lineHeight: "1.6", fontSize: "var(--text-sm)" }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
