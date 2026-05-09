export type ResumeContact = {
  name: string;
  role: string;
  location: string;
  email: string;
  phone: string;
  links: string[];
};

export type ResumeExperienceItem = {
  id: string;
  role: string;
  company: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  bullets: string[];
};

export type ResumeEducationItem = {
  id: string;
  degree: string;
  institution: string;
  location?: string;
  dates?: string;
};

export type StructuredResume = {
  contact: ResumeContact;
  summary: string;
  experience: ResumeExperienceItem[];
  skills: string[];
  projects: string[];
  education: ResumeEducationItem[];
  certifications: string[];
  languages: string[];
};

export const emptyStructuredResume: StructuredResume = {
  contact: {
    name: "",
    role: "",
    location: "",
    email: "",
    phone: "",
    links: []
  },
  summary: "",
  experience: [],
  skills: [],
  projects: [],
  education: [],
  certifications: [],
  languages: []
};
