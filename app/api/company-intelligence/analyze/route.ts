import { NextResponse } from "next/server";
import { buildIntelligenceReport, extractCompanyName } from "@/lib/company-intelligence";

export const runtime = "nodejs";

function normalizeUrl(value: unknown) {
  const raw = String(value || "").trim();
  if (!raw) {
    throw new Error("Company URL is required.");
  }
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  const url = new URL(withProtocol);
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Only HTTP and HTTPS URLs are supported.");
  }
  return url.toString();
}

function fallbackHtml(url: string) {
  const hostname = new URL(url).hostname.replace(/^www\./, "");
  return `<title>${extractCompanyName(url)}</title><main>${hostname}</main>`;
}

async function fetchWebsite(url: string) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 9000);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "user-agent": "AI Company Intelligence Platform portfolio crawler",
        accept: "text/html,application/xhtml+xml"
      }
    });
    if (!response.ok) {
      throw new Error(`Website returned ${response.status}.`);
    }
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
      throw new Error("URL did not return HTML content.");
    }
    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { url?: string };
    const url = normalizeUrl(body.url);
    let html = "";
    let fetchWarning = "";

    try {
      html = await fetchWebsite(url);
    } catch (error) {
      fetchWarning = error instanceof Error ? error.message : "Website fetch failed.";
      html = fallbackHtml(url);
    }

    const report = buildIntelligenceReport({ url, html });
    return NextResponse.json({ report, fetchWarning });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to analyze company." },
      { status: 400 }
    );
  }
}
