export type ResumeTemplateId =
  | "ats"
  | "euro"
  | "executive"
  | "minimal"
  | "classic"
  | "tech"
  | "data"
  | "german"
  | "compact"
  | "creative"
  | "academic"
  | "consulting";

export type BuilderTemplateId = "ats" | "euro" | "executive";

export type ResumeTemplate = {
  id: ResumeTemplateId;
  builderTemplate: BuilderTemplateId;
  name: string;
  category: string;
  description: string;
  bestFor: string;
  filters: string[];
  accent: string;
};

export const resumeTemplates: ResumeTemplate[] = [
  {
    id: "ats",
    builderTemplate: "ats",
    name: "ATS Professional",
    category: "Most popular",
    description: "A clean recruiter-safe resume for job boards, ATS systems, and corporate roles.",
    bestFor: "Data, business, operations, finance, and general professional applications.",
    filters: ["ATS", "One Column", "Professional", "Without Photo"],
    accent: "#2f5bea"
  },
  {
    id: "euro",
    builderTemplate: "euro",
    name: "European CV",
    category: "EU friendly",
    description: "A formal European-style CV with calm structure and strong readability.",
    bestFor: "Germany, Netherlands, France, Spain, Italy, Austria, Switzerland, and EU roles.",
    filters: ["European", "Formal", "Two Page", "Without Photo"],
    accent: "#0f8f62"
  },
  {
    id: "executive",
    builderTemplate: "executive",
    name: "Modern Executive",
    category: "Premium",
    description: "A modern senior-level layout with sharper visual hierarchy and compact sections.",
    bestFor: "Managers, senior analysts, consultants, founders, and leadership applications.",
    filters: ["Executive", "Modern", "Senior", "Two Column"],
    accent: "#172033"
  },
  {
    id: "minimal",
    builderTemplate: "ats",
    name: "Minimalist",
    category: "Simple",
    description: "A quiet, whitespace-heavy resume for conservative applications.",
    bestFor: "Finance, administration, operations, and traditional corporate roles.",
    filters: ["Simple", "One Column", "ATS", "Without Photo"],
    accent: "#475467"
  },
  {
    id: "classic",
    builderTemplate: "ats",
    name: "Classic Professional",
    category: "Traditional",
    description: "A familiar HR-friendly format with clear headings and polished spacing.",
    bestFor: "Mid-career professionals, business roles, and general applications.",
    filters: ["Traditional", "Professional", "One Page", "ATS"],
    accent: "#2563eb"
  },
  {
    id: "tech",
    builderTemplate: "executive",
    name: "Tech Resume",
    category: "Tech",
    description: "A skills-forward design for engineers, analysts, and technical specialists.",
    bestFor: "Software, data, analytics, product, engineering, and AI-adjacent roles.",
    filters: ["IT & Engineering", "Modern", "Skills", "ATS"],
    accent: "#7c3aed"
  },
  {
    id: "data",
    builderTemplate: "ats",
    name: "Data Analyst CV",
    category: "Analytics",
    description: "Built around tools, projects, dashboards, metrics, and business impact.",
    bestFor: "Data analyst, BI analyst, analytics engineer, and product analytics roles.",
    filters: ["Data", "Analytics", "Projects", "ATS"],
    accent: "#0891b2"
  },
  {
    id: "german",
    builderTemplate: "euro",
    name: "German Lebenslauf",
    category: "Germany",
    description: "A formal German-market CV structure with localized section style.",
    bestFor: "Germany, Austria, and Switzerland applications.",
    filters: ["German", "European", "Formal", "With Photo Optional"],
    accent: "#0f766e"
  },
  {
    id: "compact",
    builderTemplate: "ats",
    name: "Compact One-Page",
    category: "One page",
    description: "A dense but readable layout for candidates who need a crisp one-page resume.",
    bestFor: "Early career, students, internships, and focused applications.",
    filters: ["One Page", "Entry Level", "ATS", "Compact"],
    accent: "#ea580c"
  },
  {
    id: "creative",
    builderTemplate: "executive",
    name: "Creative Professional",
    category: "Creative",
    description: "A tasteful modern layout with personality while keeping recruiter readability.",
    bestFor: "Marketing, design, content, product, and startup roles.",
    filters: ["Creative", "Modern", "Two Column", "Color"],
    accent: "#db2777"
  },
  {
    id: "academic",
    builderTemplate: "euro",
    name: "Academic CV",
    category: "Academic",
    description: "A longer-form CV for education, research, publications, and teaching history.",
    bestFor: "Universities, research, PhD, teaching, and academic applications.",
    filters: ["Academic", "Two Page", "Formal", "European"],
    accent: "#4f46e5"
  },
  {
    id: "consulting",
    builderTemplate: "executive",
    name: "Consulting",
    category: "Business",
    description: "A sharp business template emphasizing outcomes, clients, and leadership.",
    bestFor: "Consulting, strategy, project management, and leadership roles.",
    filters: ["Business", "Executive", "Professional", "Metrics"],
    accent: "#111827"
  }
];

export const selectedTemplateStorageKey = "careerforge.selectedTemplate";
