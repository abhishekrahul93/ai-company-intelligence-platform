export type IntelligenceKpi = {
  name: string;
  category: "Business" | "Product" | "Marketing" | "Operations";
  why: string;
  formula: string;
  target: string;
};

export type IntelligenceReport = {
  companyUrl: string;
  companyName: string;
  generatedAt: string;
  confidence: number;
  businessModel: string;
  targetCustomers: string[];
  products: string[];
  locations: string[];
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  competitors: Array<{
    name: string;
    positioning: string;
    offering: string;
    digitalPresence: "Emerging" | "Developing" | "Strong";
  }>;
  marketGaps: string[];
  kpis: IntelligenceKpi[];
  executiveSummary: string;
  revenueOpportunities: string[];
  operationalImprovements: string[];
  dataStrategyRecommendations: string[];
  aiAdoptionRecommendations: string[];
  risks: string[];
  benchmarks: Array<{ label: string; value: string; note: string }>;
};

const stopWords = new Set([
  "about",
  "after",
  "also",
  "because",
  "company",
  "contact",
  "cookie",
  "data",
  "from",
  "have",
  "home",
  "into",
  "more",
  "only",
  "other",
  "over",
  "privacy",
  "product",
  "service",
  "solutions",
  "that",
  "their",
  "there",
  "these",
  "this",
  "with",
  "your"
]);

const industrySignals = [
  { match: ["subscription", "rental", "leasing", "hardware"], model: "Subscription and asset-financing platform" },
  { match: ["fintech", "payment", "invoice", "banking", "finance"], model: "B2B fintech platform" },
  { match: ["insurance", "claim", "policy", "underwriting"], model: "B2B insurance technology and risk operations" },
  { match: ["delivery", "restaurant", "food", "grocery", "quick commerce", "rider"], model: "Local delivery and quick-commerce marketplace" },
  { match: ["logistics", "warehouse", "fulfillment", "delivery"], model: "Logistics and operations platform" },
  { match: ["analytics", "dashboard", "intelligence", "insight"], model: "Analytics and intelligence software" },
  { match: ["saas", "api", "platform", "automation"], model: "B2B SaaS platform" }
];

function titleCase(value: string) {
  return value
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

export function extractCompanyName(url: string, html = "") {
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, " ").trim();
  const hostnameName = titleCase(new URL(url).hostname.replace(/^www\./, "").split(".")[0] || "Company");
  if (title && !/^(home|homepage|index)$/i.test(title)) {
    return title.split(/[|–-]/)[0]?.trim().slice(0, 60) || titleCase(new URL(url).hostname.split(".").at(-2) || "Company");
  }
  return hostnameName;
}

export function extractVisibleText(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 18000);
}

function keywordsFromText(text: string) {
  const counts = new Map<string, number>();
  for (const word of text.toLowerCase().match(/\b[a-z][a-z0-9-]{3,}\b/g) || []) {
    if (stopWords.has(word)) {
      continue;
    }
    counts.set(word, (counts.get(word) || 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 16).map(([word]) => word);
}

function detectBusinessModel(text: string) {
  const lower = text.toLowerCase();
  const matched = industrySignals.find((signal) => signal.match.some((term) => lower.includes(term)));
  return matched?.model || "Digital business with services, products, or platform-led revenue";
}

function extractProducts(text: string, keywords: string[]) {
  const productSignals = ["platform", "dashboard", "api", "automation", "analytics", "software", "subscription", "service", "tool", "reporting"];
  const products = keywords
    .filter((keyword) => productSignals.some((signal) => keyword.includes(signal) || text.toLowerCase().includes(`${keyword} ${signal}`)))
    .slice(0, 5)
    .map((keyword) => `${titleCase(keyword)} solution`);
  return products.length ? products : ["Core digital platform", "Customer-facing service workflow", "Analytics and reporting layer"];
}

function extractLocations(text: string) {
  const locations = ["Berlin", "Germany", "Europe", "Munich", "Hamburg", "Frankfurt", "London", "Paris", "Amsterdam"].filter((city) =>
    new RegExp(`\\b${city}\\b`, "i").test(text)
  );
  return locations.length ? [...new Set(locations)] : ["Germany / Europe"];
}

function targetCustomers(text: string) {
  const lower = text.toLowerCase();
  const customers = [
    lower.includes("smb") || lower.includes("small") ? "Small and medium-sized businesses" : "",
    lower.includes("enterprise") ? "Enterprise customers" : "",
    lower.includes("retailer") ? "Retail partners" : "",
    lower.includes("broker") || lower.includes("insurance") ? "Insurance and broker teams" : "",
    lower.includes("developer") || lower.includes("api") ? "Technical platform partners" : ""
  ].filter(Boolean);
  return customers.length ? customers : ["Business decision-makers", "Operations teams", "Commercial teams"];
}

function competitorSet(model: string) {
  if (/insurance/i.test(model)) {
    return [
      { name: "omni:us", positioning: "AI claims automation", offering: "Claims intake, triage, and automation", digitalPresence: "Strong" as const },
      { name: "Shift Technology", positioning: "Fraud and claims AI", offering: "Insurance decision automation", digitalPresence: "Strong" as const },
      { name: "FRISS", positioning: "Trust automation for insurers", offering: "Risk, fraud, and compliance scoring", digitalPresence: "Developing" as const }
    ];
  }
  if (/fintech|asset|subscription|leasing/i.test(model)) {
    return [
      { name: "Grover", positioning: "Consumer and business tech rental", offering: "Device subscription marketplace", digitalPresence: "Strong" as const },
      { name: "Grenke", positioning: "SMB leasing specialist", offering: "Equipment leasing and financing", digitalPresence: "Developing" as const },
      { name: "BNP Paribas Leasing Solutions", positioning: "Enterprise asset finance", offering: "Vendor finance and leasing", digitalPresence: "Developing" as const }
    ];
  }
  if (/delivery|commerce|marketplace/i.test(model)) {
    return [
      { name: "Uber Eats", positioning: "Global food delivery marketplace", offering: "Restaurant delivery, grocery, and ads", digitalPresence: "Strong" as const },
      { name: "Just Eat Takeaway", positioning: "European food ordering platform", offering: "Restaurant marketplace and logistics", digitalPresence: "Strong" as const },
      { name: "Wolt", positioning: "Premium local commerce delivery", offering: "Food, grocery, retail delivery, and merchant tools", digitalPresence: "Strong" as const }
    ];
  }
  return [
    { name: "Category leader", positioning: "Scaled incumbent", offering: "Broad product suite and brand trust", digitalPresence: "Strong" as const },
    { name: "Vertical SaaS challenger", positioning: "Focused workflow automation", offering: "Niche product with fast implementation", digitalPresence: "Developing" as const },
    { name: "Consulting-led alternative", positioning: "Custom implementation", offering: "Services-heavy delivery", digitalPresence: "Emerging" as const }
  ];
}

function kpiRecommendations(model: string): IntelligenceKpi[] {
  if (/delivery|commerce|marketplace/i.test(model)) {
    return [
      {
        category: "Business",
        name: "Gross merchandise value",
        why: "Shows total platform demand before commissions, discounts, and logistics costs.",
        formula: "Total value of completed orders",
        target: "+10-15% year-over-year in mature markets"
      },
      {
        category: "Business",
        name: "Contribution margin per order",
        why: "Connects growth with unit economics and profitability discipline.",
        formula: "Order revenue - rider cost - incentives - payment and support costs",
        target: "Positive and improving by market cohort"
      },
      {
        category: "Product",
        name: "Repeat order rate",
        why: "Measures whether customers build a habit after first purchase.",
        formula: "Customers with 2+ orders in period / active customers",
        target: "+5 percentage points from baseline"
      },
      {
        category: "Product",
        name: "Median delivery time",
        why: "Directly affects customer satisfaction, refund risk, and marketplace liquidity.",
        formula: "Median minutes from order confirmation to delivery",
        target: "Under 30 minutes for priority urban zones"
      },
      {
        category: "Marketing",
        name: "Customer acquisition payback",
        why: "Shows whether paid growth is economically sustainable.",
        formula: "Acquisition cost / average monthly contribution margin per customer",
        target: "Under 6 months by channel"
      },
      {
        category: "Operations",
        name: "Rider utilization",
        why: "Improves delivery economics without reducing service quality.",
        formula: "Active delivery time / paid available time",
        target: "Improve by 10% while maintaining SLA"
      }
    ];
  }
  return [
    {
      category: "Business",
      name: "Qualified pipeline value",
      why: "Shows whether demand generation is creating enough commercial opportunity for future growth.",
      formula: "Sum of open opportunities weighted by qualification stage",
      target: "+15% quarter-over-quarter"
    },
    {
      category: "Business",
      name: "Gross revenue retention",
      why: "Measures how reliably the existing customer base keeps paying before expansion revenue.",
      formula: "(Starting recurring revenue - churn - contraction) / starting recurring revenue",
      target: "90%+ for B2B recurring models"
    },
    {
      category: "Product",
      name: "Activation rate",
      why: "Indicates whether new customers reach the first meaningful product outcome quickly.",
      formula: "Activated accounts / new accounts",
      target: "60-75% depending on onboarding complexity"
    },
    {
      category: "Product",
      name: "Time to first value",
      why: "Shorter onboarding cycles improve conversion, retention, and customer satisfaction.",
      formula: "Median time from signup or contract start to first successful workflow",
      target: "Reduce by 20% in two quarters"
    },
    {
      category: "Marketing",
      name: "Website-to-lead conversion",
      why: "Connects digital positioning to measurable commercial demand.",
      formula: "Qualified inbound leads / unique website visitors",
      target: "2-5% for high-intent B2B pages"
    },
    {
      category: "Operations",
      name: model.includes("insurance") ? "Submission cycle time" : "Workflow automation rate",
      why: "Highlights process friction and the operational impact of automation.",
      formula: model.includes("insurance") ? "Median hours from intake to decision-ready file" : "Automated workflows / total workflows",
      target: "30% improvement from baseline"
    }
  ];
}

function fallbackTextForUrl(url: string) {
  const hostname = new URL(url).hostname.toLowerCase();
  if (hostname.includes("deliveryhero")) {
    return [
      "Delivery Hero is a Berlin headquartered global local delivery platform.",
      "The company operates food delivery, grocery delivery, quick commerce, restaurant marketplace, logistics, rider operations, advertising, and merchant services.",
      "Target customers include consumers, restaurants, grocery and retail merchants, riders, advertisers, and local commerce partners.",
      "The business model includes marketplace commission, delivery fees, subscription and loyalty programs, advertising revenue, and merchant tools.",
      "Key topics include order volume, gross merchandise value, contribution margin, delivery time, customer retention, rider utilization, restaurant activation, and operational efficiency.",
      "Locations include Berlin, Germany, Europe, Middle East, Asia, and global markets."
    ].join(" ");
  }
  if (hostname.includes("topi")) {
    return [
      "topi is a Berlin-based fintech enabling businesses to access IT hardware through subscription, rental, leasing, and flexible asset financing.",
      "The company supports SMBs, retailers, manufacturers, and API partners with hardware subscription workflows and risk-aware financing.",
      "Key topics include approval conversion, subscription activation, partner performance, checkout integration, manual review rate, and revenue retention.",
      "Locations include Berlin, Germany, and European markets."
    ].join(" ");
  }
  return `${hostname} company website platform services customers analytics operations growth revenue product marketing risks opportunities`;
}

export function buildIntelligenceReport(input: { url: string; html?: string; text?: string }): IntelligenceReport {
  const extractedText = input.text || extractVisibleText(input.html || "");
  const text = extractedText.length > 120 ? extractedText : fallbackTextForUrl(input.url);
  const keywords = keywordsFromText(text);
  const companyName = extractCompanyName(input.url, input.html);
  const businessModel = detectBusinessModel(text);
  const products = extractProducts(text, keywords);
  const customers = targetCustomers(text);
  const competitors = competitorSet(businessModel);
  const locations = extractLocations(text);
  const confidence = Math.min(92, Math.max(58, 45 + keywords.length * 2 + products.length * 4 + locations.length * 3));

  return {
    companyUrl: input.url,
    companyName,
    generatedAt: new Date().toISOString(),
    confidence,
    businessModel,
    targetCustomers: customers,
    products,
    locations,
    competitors,
    kpis: kpiRecommendations(businessModel),
    swot: {
      strengths: [
        "Clear opportunity to package website positioning into structured executive intelligence.",
        "Digital presence provides enough public signals for automated first-pass analysis.",
        "Business model can support repeatable KPI tracking and stakeholder reporting."
      ],
      weaknesses: [
        "Public website data may not expose pricing, retention, conversion, or unit economics.",
        "Messaging may require validation with sales, product, and customer success teams.",
        "Competitor comparison needs human review before strategic decisions."
      ],
      opportunities: [
        "Turn unstructured company research into repeatable sales, strategy, and analyst workflows.",
        "Create KPI dashboards that connect positioning, product adoption, and revenue operations.",
        "Use AI to reduce manual research time while preserving human validation."
      ],
      threats: [
        "Competitors with stronger category education may capture high-intent search demand.",
        "AI-generated insights can create false confidence without source review.",
        "Changing regulation, privacy requirements, or customer trust expectations may affect adoption."
      ]
    },
    marketGaps: [
      "Create sharper proof points around ROI, implementation time, and measurable customer outcomes.",
      "Add comparison pages or use-case landing pages for high-intent buyer segments.",
      "Publish practical benchmarks and calculators to convert website traffic into qualified leads."
    ],
    executiveSummary: `${companyName} appears to operate as a ${businessModel.toLowerCase()}. The strongest near-term opportunity is to convert public positioning and operational workflows into measurable KPIs, clearer market differentiation, and AI-assisted analyst workflows. The analysis should be treated as a decision-support brief and validated with internal performance data.`,
    revenueOpportunities: [
      "Package top use cases into role-specific landing pages for decision-makers and technical evaluators.",
      "Introduce ROI calculators or benchmark reports to improve lead quality and sales conversations.",
      "Use customer segmentation to prioritize accounts with the highest urgency and implementation fit."
    ],
    operationalImprovements: [
      "Standardize intake, qualification, and reporting workflows with clear ownership and service-level targets.",
      "Create a weekly KPI review layer covering conversion, cycle time, activation, and retention signals.",
      "Document data definitions so teams use consistent metrics across sales, product, and operations."
    ],
    dataStrategyRecommendations: [
      "Build a governed metrics layer with agreed definitions for revenue, product, marketing, and operations KPIs.",
      "Centralize source data from CRM, product analytics, support, billing, and website analytics.",
      "Add data quality tests for freshness, completeness, uniqueness, and accepted values before reporting."
    ],
    aiAdoptionRecommendations: [
      "Start with human-in-the-loop research summaries, account briefs, and KPI explanations.",
      "Store sources and generated outputs for auditability and reviewer feedback.",
      "Use AI for analyst acceleration first, not autonomous strategic decisions."
    ],
    risks: [
      "Public-data-only analysis can miss commercial realities.",
      "Pricing and competitor insights require validation from trusted sources.",
      "AI outputs need review to avoid unsupported conclusions."
    ],
    benchmarks: [
      { label: "Research cycle time", value: "2-3 hours -> 5 minutes", note: "Target impact for analyst workflow automation" },
      { label: "Dashboard readiness", value: `${confidence}%`, note: "Heuristic score based on available public signals" },
      { label: "KPI coverage", value: "4 functions", note: "Business, product, marketing, and operations" }
    ]
  };
}
