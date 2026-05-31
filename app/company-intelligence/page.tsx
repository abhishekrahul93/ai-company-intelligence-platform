"use client";

import { useMemo, useState } from "react";
import type { IntelligenceReport } from "@/lib/company-intelligence";

const demoReport: IntelligenceReport = {
  companyUrl: "https://www.topi.eu",
  companyName: "topi",
  generatedAt: new Date().toISOString(),
  confidence: 84,
  businessModel: "Subscription and asset-financing platform",
  targetCustomers: ["Small and medium-sized businesses", "Retail partners", "Technical platform partners"],
  products: ["Hardware subscription workflow", "API-first financing platform", "Retail checkout integration"],
  locations: ["Berlin", "Germany", "Europe"],
  competitors: [
    { name: "Grover", positioning: "Consumer and business tech rental", offering: "Device subscription marketplace", digitalPresence: "Strong" },
    { name: "Grenke", positioning: "SMB leasing specialist", offering: "Equipment leasing and financing", digitalPresence: "Developing" },
    { name: "BNP Paribas Leasing Solutions", positioning: "Enterprise asset finance", offering: "Vendor finance and leasing", digitalPresence: "Developing" }
  ],
  swot: {
    strengths: ["API-first subscription model", "Clear B2B hardware financing use case", "Strong Berlin fintech positioning"],
    weaknesses: ["Complex buyer education", "Trust and risk requirements are high", "Pricing transparency may need more public proof points"],
    opportunities: ["ROI calculator for SMB buyers", "Partner analytics for retailers", "AI-assisted risk and operations workflow"],
    threats: ["Large leasing incumbents", "Macroeconomic pressure on SMB hardware spend", "Regulatory and credit-risk complexity"]
  },
  marketGaps: [
    "Publish clearer benchmark content for total cost of ownership versus upfront hardware purchase.",
    "Add industry-specific landing pages for SMB verticals with high device needs.",
    "Create partner reporting that shows conversion, approval, and subscription performance."
  ],
  kpis: [
    { category: "Business", name: "Qualified pipeline value", why: "Shows whether partner and inbound demand can support growth.", formula: "Weighted opportunity value by stage", target: "+15% QoQ" },
    { category: "Business", name: "Approval-to-subscription rate", why: "Connects financing decisions to actual revenue conversion.", formula: "Started subscriptions / approved applications", target: "Improve by 10%" },
    { category: "Product", name: "Time to first approved offer", why: "Measures checkout and risk workflow friction.", formula: "Median time from application to approval", target: "< 5 minutes for standard cases" },
    { category: "Marketing", name: "Website-to-demo conversion", why: "Measures whether positioning converts high-intent visitors.", formula: "Qualified demos / website visitors", target: "2-5%" },
    { category: "Operations", name: "Manual review rate", why: "Highlights automation opportunity in risk operations.", formula: "Manual reviews / total applications", target: "-25% from baseline" }
  ],
  executiveSummary:
    "topi appears positioned as a Berlin-based B2B fintech for flexible business hardware subscriptions. The strongest opportunity is to connect partner acquisition, risk operations, and subscription activation into a single executive KPI layer while using AI to reduce manual review and improve decision speed.",
  revenueOpportunities: ["Build ROI calculators for SMB hardware subscriptions", "Create partner-specific performance reporting", "Segment retailers by approval and conversion quality"],
  operationalImprovements: ["Track application cycle time by partner", "Standardize missing-document reasons", "Monitor manual review queues and exception types"],
  dataStrategyRecommendations: ["Create a governed metrics layer across applications, approvals, subscriptions, churn, and partner performance", "Add data quality tests for partner IDs and application states", "Build weekly executive reporting for funnel health"],
  aiAdoptionRecommendations: ["Use AI to summarize application exceptions", "Generate partner performance briefs", "Flag inconsistent or missing application data for human review"],
  risks: ["Credit-risk complexity", "Public data may not reveal true unit economics", "Partner onboarding quality can affect conversion"],
  benchmarks: [
    { label: "Research cycle time", value: "2-3 hours -> 5 minutes", note: "Target analyst productivity gain" },
    { label: "Dashboard readiness", value: "84%", note: "Strong enough for first-pass executive review" },
    { label: "KPI coverage", value: "5 domains", note: "Revenue, product, risk, marketing, operations" }
  ]
};

function downloadFile(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function htmlReport(report: IntelligenceReport) {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${report.companyName} Intelligence Report</title><style>body{font-family:Arial,sans-serif;max-width:920px;margin:40px auto;line-height:1.55;color:#172033}h1,h2{color:#0f172a}.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.card{border:1px solid #dbe3ef;border-radius:12px;padding:16px;margin:12px 0}li{margin:6px 0}</style></head><body><h1>${report.companyName} Intelligence Report</h1><p><strong>URL:</strong> ${report.companyUrl}</p><p>${report.executiveSummary}</p><div class="grid"><div class="card"><h2>Business Model</h2><p>${report.businessModel}</p></div><div class="card"><h2>Confidence</h2><p>${report.confidence}%</p></div></div><h2>SWOT</h2>${Object.entries(report.swot).map(([key, values]) => `<div class="card"><h3>${key}</h3><ul>${values.map((item) => `<li>${item}</li>`).join("")}</ul></div>`).join("")}<h2>KPIs</h2><ul>${report.kpis.map((kpi) => `<li><strong>${kpi.name}</strong> (${kpi.category}) - ${kpi.why}</li>`).join("")}</ul><h2>Recommendations</h2><ul>${[...report.revenueOpportunities, ...report.operationalImprovements, ...report.dataStrategyRecommendations, ...report.aiAdoptionRecommendations].map((item) => `<li>${item}</li>`).join("")}</ul></body></html>`;
}

export default function CompanyIntelligencePage() {
  const [url, setUrl] = useState("https://www.topi.eu");
  const [report, setReport] = useState<IntelligenceReport>(demoReport);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("Demo report loaded for a Berlin fintech company.");

  const groupedKpis = useMemo(() => {
    return report.kpis.reduce<Record<string, typeof report.kpis>>((groups, kpi) => {
      groups[kpi.category] = [...(groups[kpi.category] || []), kpi];
      return groups;
    }, {});
  }, [report]);

  async function analyzeCompany() {
    setIsLoading(true);
    setMessage("Crawling website and building executive intelligence report...");
    try {
      const response = await fetch("/api/company-intelligence/analyze", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url })
      });
      const payload = (await response.json()) as { report?: IntelligenceReport; error?: string; fetchWarning?: string };
      if (!response.ok || !payload.report) {
        throw new Error(payload.error || "Analysis failed.");
      }
      setReport(payload.report);
      setMessage(payload.fetchWarning ? `Report generated with fallback crawler note: ${payload.fetchWarning}` : "Executive intelligence report generated.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to generate report.");
    } finally {
      setIsLoading(false);
    }
  }

  function exportHtml() {
    downloadFile(`${report.companyName.replace(/\W+/g, "-").toLowerCase()}-intelligence-report.html`, htmlReport(report), "text/html");
  }

  function exportPptOutline() {
    const slides = [
      `AI Company Intelligence Platform\n${report.companyName}`,
      `Executive Summary\n${report.executiveSummary}`,
      `Business Model\n${report.businessModel}\n\nTarget Customers\n${report.targetCustomers.join("\n")}`,
      `SWOT\nStrengths: ${report.swot.strengths.join("; ")}\nWeaknesses: ${report.swot.weaknesses.join("; ")}\nOpportunities: ${report.swot.opportunities.join("; ")}\nThreats: ${report.swot.threats.join("; ")}`,
      `Recommended KPIs\n${report.kpis.map((kpi) => `${kpi.category}: ${kpi.name} - ${kpi.why}`).join("\n")}`,
      `AI and Data Strategy\n${[...report.dataStrategyRecommendations, ...report.aiAdoptionRecommendations].join("\n")}`
    ].join("\n\n---\n\n");
    downloadFile(`${report.companyName.replace(/\W+/g, "-").toLowerCase()}-ppt-outline.md`, slides, "text/markdown");
  }

  return (
    <main className="cip-shell">
      <section className="cip-hero">
        <div className="cip-hero-copy">
          <p className="cip-eyebrow">Portfolio project for analytics, BI, product, and AI roles</p>
          <h1>AI Company Intelligence Platform</h1>
          <p>
            Enter a company URL and generate an executive research brief with website intelligence, SWOT, competitor context,
            KPI recommendations, growth opportunities, and AI adoption ideas.
          </p>
          <div className="cip-actions">
            <input value={url} onChange={(event) => setUrl(event.target.value)} aria-label="Company URL" />
            <button onClick={analyzeCompany} disabled={isLoading}>{isLoading ? "Analyzing..." : "Analyze company"}</button>
          </div>
          <p className="cip-status">{message}</p>
        </div>
        <div className="cip-hero-panel">
          <span>Executive readiness</span>
          <strong>{report.confidence}%</strong>
          <p>{report.businessModel}</p>
        </div>
      </section>

      <section className="cip-grid cip-metrics">
        {report.benchmarks.map((benchmark) => (
          <article key={benchmark.label} className="cip-card">
            <span>{benchmark.label}</span>
            <strong>{benchmark.value}</strong>
            <p>{benchmark.note}</p>
          </article>
        ))}
      </section>

      <section className="cip-report">
        <div>
          <p className="cip-eyebrow">Executive Summary</p>
          <h2>{report.companyName}</h2>
          <p>{report.executiveSummary}</p>
        </div>
        <div className="cip-export">
          <button onClick={exportHtml}>Export HTML</button>
          <button onClick={() => window.print()}>Print PDF</button>
          <button onClick={exportPptOutline}>PPT outline</button>
        </div>
      </section>

      <section className="cip-grid cip-two">
        <article className="cip-card">
          <h3>Products & Services</h3>
          <ul>{report.products.map((item) => <li key={item}>{item}</li>)}</ul>
        </article>
        <article className="cip-card">
          <h3>Target Customers</h3>
          <ul>{report.targetCustomers.map((item) => <li key={item}>{item}</li>)}</ul>
        </article>
      </section>

      <section className="cip-grid cip-four">
        {Object.entries(report.swot).map(([label, values]) => (
          <article key={label} className="cip-card">
            <h3>{label}</h3>
            <ul>{values.map((item) => <li key={item}>{item}</li>)}</ul>
          </article>
        ))}
      </section>

      <section className="cip-section">
        <div className="cip-section-title">
          <p className="cip-eyebrow">Competitor Intelligence</p>
          <h2>Market Positioning</h2>
        </div>
        <div className="cip-table">
          {report.competitors.map((competitor) => (
            <div key={competitor.name} className="cip-row">
              <strong>{competitor.name}</strong>
              <span>{competitor.positioning}</span>
              <span>{competitor.offering}</span>
              <em>{competitor.digitalPresence}</em>
            </div>
          ))}
        </div>
      </section>

      <section className="cip-section">
        <div className="cip-section-title">
          <p className="cip-eyebrow">KPI Recommendation Engine</p>
          <h2>Metrics the executive team should track</h2>
        </div>
        <div className="cip-grid cip-two">
          {Object.entries(groupedKpis).map(([category, kpis]) => (
            <article key={category} className="cip-card">
              <h3>{category}</h3>
              {kpis.map((kpi) => (
                <div key={kpi.name} className="cip-kpi">
                  <strong>{kpi.name}</strong>
                  <p>{kpi.why}</p>
                  <small>{kpi.formula} | Target: {kpi.target}</small>
                </div>
              ))}
            </article>
          ))}
        </div>
      </section>

      <section className="cip-grid cip-two">
        <article className="cip-card">
          <h3>Growth Opportunities</h3>
          <ul>{report.revenueOpportunities.map((item) => <li key={item}>{item}</li>)}</ul>
        </article>
        <article className="cip-card">
          <h3>Risks & Controls</h3>
          <ul>{report.risks.map((item) => <li key={item}>{item}</li>)}</ul>
        </article>
      </section>

      <section className="cip-architecture">
        <p className="cip-eyebrow">Technical Architecture</p>
        <h2>Built to show analyst-to-engineer range</h2>
        <div className="cip-flow">
          <span>Company URL</span>
          <span>Website crawler API</span>
          <span>Text extraction</span>
          <span>Report engine</span>
          <span>Dashboard + exports</span>
        </div>
      </section>
    </main>
  );
}
