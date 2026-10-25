"""Generate SAAKSHI_COMPLETE_DEEP_DIVE.pdf from SAAKSHI_COMPLETE_DEEP_DIVE.md using Edge Headless."""

import os
import subprocess
from markdown_it import MarkdownIt

def build_pdf():
    workspace_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    md_path = os.path.join(workspace_dir, "SAAKSHI_COMPLETE_DEEP_DIVE.md")
    html_path = os.path.join(workspace_dir, "SAAKSHI_COMPLETE_DEEP_DIVE.html")
    pdf_path = os.path.join(workspace_dir, "SAAKSHI_COMPLETE_DEEP_DIVE.pdf")

    with open(md_path, "r", encoding="utf-8") as f:
        md_text = f.read()

    md = MarkdownIt().enable("table").enable("strikethrough")
    body_html = md.render(md_text)

    full_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>SAAKSHI — The Complete Master Guide & Architecture Deep-Dive</title>
<style>
  @page {{
    size: A4;
    margin: 22mm 18mm 22mm 18mm;
    @bottom-right {{
      content: counter(page);
      font-size: 9pt;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #7c828c;
    }}
    @bottom-left {{
      content: "SAAKSHI — Official Social Audit Architecture Guide";
      font-size: 9pt;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #7c828c;
    }}
  }}

  body {{
    font-family: "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, "Noto Sans", sans-serif;
    font-size: 10.5pt;
    line-height: 1.6;
    color: #14161a;
    background: #ffffff;
    margin: 0;
    padding: 0;
  }}

  /* Cover Page */
  .cover-page {{
    page-break-after: always;
    min-height: 85vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    border-top: 6px solid #0f2740;
    border-bottom: 3px solid #c77d13;
    padding: 40px 0;
  }}

  .cover-tag {{
    font-size: 11pt;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #c77d13;
    margin-bottom: 12px;
  }}

  .cover-title {{
    font-size: 28pt;
    font-weight: 800;
    line-height: 1.2;
    color: #0f2740;
    margin: 0 0 16px 0;
  }}

  .cover-subtitle {{
    font-size: 13pt;
    color: #4a4f57;
    line-height: 1.5;
    margin-bottom: 36px;
    max-width: 650px;
  }}

  .cover-meta {{
    margin-top: auto;
    font-size: 10pt;
    color: #7c828c;
    border-top: 1px solid rgba(20, 22, 26, 0.12);
    padding-top: 18px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }}

  h1 {{
    font-size: 19pt;
    font-weight: 700;
    color: #0f2740;
    border-bottom: 2px solid #0f2740;
    padding-bottom: 6px;
    margin-top: 32px;
    margin-bottom: 14px;
    page-break-before: always;
  }}

  .no-break-first h1:first-of-type {{
    page-break-before: avoid;
  }}

  h2 {{
    font-size: 14pt;
    font-weight: 600;
    color: #1b3a5c;
    margin-top: 24px;
    margin-bottom: 10px;
    border-bottom: 1px solid rgba(20, 22, 26, 0.12);
    padding-bottom: 4px;
  }}

  h3 {{
    font-size: 12pt;
    font-weight: 600;
    color: #24507d;
    margin-top: 18px;
    margin-bottom: 8px;
  }}

  p, li {{
    text-align: justify;
    text-justify: inter-word;
  }}

  /* Tables */
  table {{
    width: 100%;
    border-collapse: collapse;
    margin: 18px 0;
    font-size: 9.5pt;
    page-break-inside: avoid;
  }}

  th {{
    background: #edebe4;
    color: #14161a;
    font-weight: 600;
    text-align: left;
    padding: 8px 10px;
    border: 1px solid #c5c3ba;
  }}

  td {{
    padding: 7px 10px;
    border: 1px solid #e3e1d9;
    vertical-align: top;
  }}

  tr:nth-child(even) td {{
    background: #faf9f6;
  }}

  /* Code & ASCII Diagrams */
  pre {{
    background: #15171a;
    color: #f2f1ec;
    padding: 12px 14px;
    border-radius: 4px;
    font-family: "Cascadia Mono", "Consolas", "Courier New", monospace;
    font-size: 8.5pt;
    line-height: 1.45;
    overflow-x: auto;
    page-break-inside: avoid;
    margin: 14px 0;
  }}

  code {{
    font-family: "Cascadia Mono", "Consolas", monospace;
    font-size: 9pt;
    background: #edebe4;
    padding: 2px 5px;
    border-radius: 3px;
    color: #0f2740;
  }}

  pre code {{
    background: transparent;
    padding: 0;
    color: inherit;
  }}

  /* Callouts & Blockquotes */
  blockquote {{
    margin: 16px 0;
    padding: 12px 18px;
    background: #fbf0dc;
    border-left: 4px solid #c77d13;
    border-radius: 0 4px 4px 0;
    font-size: 10pt;
    color: #14161a;
    page-break-inside: avoid;
  }}

  blockquote p {{
    margin: 0;
    font-style: italic;
  }}

  blockquote strong {{
    color: #a8620a;
  }}

  /* Key Metrics & Highlights */
  .highlight-box {{
    background: #e4edf8;
    border: 1px solid #2a78d6;
    border-radius: 4px;
    padding: 12px 16px;
    margin: 14px 0;
    page-break-inside: avoid;
  }}

  ul, ol {{
    padding-left: 20px;
    margin: 8px 0;
  }}

  li {{
    margin-bottom: 4px;
  }}

  hr {{
    border: none;
    border-top: 1px solid rgba(20, 22, 26, 0.15);
    margin: 24px 0;
  }}
</style>
</head>
<body>

<div class="cover-page">
  <div class="cover-tag">Google Gemma 4 Good · Challenge Submission</div>
  <div class="cover-title">SAAKSHI (साक्षी)</div>
  <div class="cover-title" style="font-size: 18pt; font-weight: 600; color: #24507d;">
    Social Audit Evidence Assembly for Rural Entitlement Verification
  </div>
  <div class="cover-subtitle">
    A comprehensive, non-technical to deep-architectural guide explaining the paper-to-database divide in rural jobs guarantee (VB-G RAM G), the multimodal vision capabilities of Gemma 4, deterministic arithmetic invariants, and court-ready Section 63 BSA evidence assembly.
  </div>

  <div class="cover-meta">
    <div>
      <strong>Governing Principle:</strong> "The AI reads. The code computes. The human decides."<br>
      <strong>Track:</strong> Challenge A: Best Use of Google Gemma 4<br>
      <strong>Models Enforced:</strong> <code>gemma-4-26b-a4b-it</code> & <code>gemma-4-31b-it</code>
    </div>
    <div style="text-align: right;">
      <strong>Repository:</strong> HackToBerFest-VVCE / t1c1-maverick-marvels<br>
      <strong>Version:</strong> Production 1.0.0 (All 16 Phases Complete)<br>
      <strong>Date:</strong> October 2026
    </div>
  </div>
</div>

<div class="content-body">
{body_html}
</div>

</body>
</html>
"""

    with open(html_path, "w", encoding="utf-8") as f:
        f.write(full_html)
    print(f"HTML written to: {html_path}")

    # Invoke Edge headless
    edge_exe = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    cmd = [
        edge_exe,
        "--headless=new",
        "--disable-gpu",
        "--no-pdf-header-footer",
        f"--print-to-pdf={pdf_path}",
        html_path,
    ]
    print(f"Generating PDF via Edge headless...")
    result = subprocess.run(cmd, capture_output=True, text=True)
    if os.path.exists(pdf_path):
        size_kb = os.path.getsize(pdf_path) / 1024
        print(f"SUCCESS: Generated PDF at {pdf_path} ({size_kb:.1f} KB)")
    else:
        print(f"ERROR: PDF generation failed:\n{result.stderr}")

if __name__ == "__main__":
    build_pdf()
