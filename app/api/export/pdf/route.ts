import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";

type ExportExperience = {
  role?: string;
  company?: string;
  rewrittenBullets?: string[];
};

type ExportPayload = {
  fileName?: string;
  profile?: {
    name?: string;
    role?: string;
    location?: string;
    email?: string;
    phone?: string;
    links?: string[];
    workAuthorization?: string;
    education?: string[];
    certifications?: string[];
  };
  result?: {
    version?: {
      language?: string;
      format?: string;
      targetCountry?: string;
      tone?: string;
      designStyle?: string;
    };
    localizedHeadings?: {
      summary?: string;
      skills?: string;
      experience?: string;
      education?: string;
      projects?: string;
      certifications?: string;
      languages?: string;
    };
    professionalSummary?: string;
    skills?: {
      matched?: string[];
      recommended?: string[];
      missing?: string[];
    };
    experience?: ExportExperience[];
    projects?: string[];
  };
};

function sanitize(value = "") {
  return value.replace(/\s+/g, " ").trim();
}

function safeList(items?: string[]) {
  return (items || []).map(sanitize).filter(Boolean);
}

function confirmedSkills(payload: ExportPayload) {
  const missing = new Set(safeList(payload.result?.skills?.missing).map((item) => item.toLowerCase()));
  return Array.from(
    new Set(
      [...safeList(payload.result?.skills?.matched), ...safeList(payload.result?.skills?.recommended)]
        .filter((item) => !missing.has(item.toLowerCase()))
    )
  ).slice(0, 18);
}

function collectPdf(doc: PDFKit.PDFDocument) {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
}

function sectionTitle(doc: PDFKit.PDFDocument, title: string, accent: string) {
  doc.moveDown(0.85);
  doc
    .font("Helvetica-Bold")
    .fontSize(9)
    .fillColor(accent)
    .text(title.toUpperCase(), { characterSpacing: 0.8 });
  doc.moveTo(doc.x, doc.y + 2).lineTo(552, doc.y + 2).strokeColor("#d7dee8").lineWidth(0.7).stroke();
  doc.moveDown(0.55);
}

function bullet(doc: PDFKit.PDFDocument, text: string) {
  doc
    .font("Helvetica")
    .fontSize(9.4)
    .fillColor("#253044")
    .text(`• ${text}`, { indent: 8, lineGap: 2 });
  doc.moveDown(0.18);
}

export async function POST(request: Request) {
  const payload = (await request.json()) as ExportPayload;
  const profile = payload.profile || {};
  const result = payload.result || {};
  const headings = result.localizedHeadings || {};
  const accent = result.version?.designStyle === "European Formal" ? "#0f8f62" : result.version?.designStyle === "Executive" ? "#172033" : "#2f5bea";
  const doc = new PDFDocument({
    size: "A4",
    margin: 42,
    info: {
      Title: payload.fileName || "careerforge-resume",
      Author: sanitize(profile.name) || "CareerForge"
    }
  });
  const pdfPromise = collectPdf(doc);
  const contact = [profile.location, profile.email, profile.phone, ...(profile.links || [])].map(sanitize).filter(Boolean);

  doc.font("Helvetica-Bold").fontSize(22).fillColor("#111827").text(sanitize(profile.name) || "Candidate Name", { lineGap: 1 });
  doc.font("Helvetica-Bold").fontSize(10.5).fillColor(accent).text(sanitize(profile.role) || "Professional");
  if (contact.length) {
    doc.moveDown(0.25).font("Helvetica").fontSize(8.8).fillColor("#4b5563").text(contact.join(" | "), { lineGap: 1 });
  }
  if (profile.workAuthorization) {
    doc.moveDown(0.35).font("Helvetica-Bold").fontSize(8.8).fillColor("#253044").text(sanitize(profile.workAuthorization));
  }
  doc.moveDown(0.75).moveTo(42, doc.y).lineTo(552, doc.y).strokeColor("#111827").lineWidth(1.2).stroke();

  sectionTitle(doc, headings.summary || "Professional Summary", accent);
  doc.font("Helvetica").fontSize(9.6).fillColor("#253044").text(sanitize(result.professionalSummary), { lineGap: 2 });

  sectionTitle(doc, headings.experience || "Work Experience", accent);
  for (const item of result.experience || []) {
    const title = [item.role, item.company].map(sanitize).filter(Boolean).join(" | ") || "Experience";
    doc.moveDown(0.2).font("Helvetica-Bold").fontSize(10.2).fillColor("#111827").text(title);
    for (const itemBullet of safeList(item.rewrittenBullets).slice(0, 7)) {
      bullet(doc, itemBullet);
    }
  }

  const skills = confirmedSkills(payload);
  if (skills.length) {
    sectionTitle(doc, headings.skills || "Skills", accent);
    doc.font("Helvetica").fontSize(9.3).fillColor("#253044").text(skills.join(" | "), { lineGap: 2 });
  }

  const projects = safeList(result.projects);
  if (projects.length) {
    sectionTitle(doc, headings.projects || "Projects", accent);
    projects.slice(0, 4).forEach((item) => bullet(doc, item));
  }

  const education = safeList(profile.education);
  if (education.length) {
    sectionTitle(doc, headings.education || "Education", accent);
    education.slice(0, 4).forEach((item) => bullet(doc, item));
  }

  const certifications = safeList(profile.certifications);
  if (certifications.length) {
    sectionTitle(doc, headings.certifications || "Certifications", accent);
    certifications.slice(0, 4).forEach((item) => bullet(doc, item));
  }

  doc.end();
  const pdf = await pdfPromise;

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${sanitize(payload.fileName || "careerforge-resume.pdf")}"`
    }
  });
}
