"use client";

import Link from "next/link";
import { resumeTemplates, selectedTemplateStorageKey, type ResumeTemplate } from "@/lib/templates";

function chooseTemplate(template: ResumeTemplate) {
  window.localStorage.setItem(selectedTemplateStorageKey, template.builderTemplate);
  window.location.href = "/";
}

function TemplatePreview({ template }: { template: ResumeTemplate }) {
  return (
    <div className={`largeTemplatePreview ${template.id}`} style={{ "--template-accent": template.accent } as React.CSSProperties}>
      <div className="previewPaper">
        <header>
          <div>
            <span />
            <strong />
          </div>
          <aside />
        </header>
        <main>
          <section>
            <b />
            <p />
            <p />
            <p />
          </section>
          <section>
            <b />
            <ul>
              <li />
              <li />
              <li />
            </ul>
          </section>
        </main>
        <footer>
          <span />
          <span />
          <span />
        </footer>
      </div>
    </div>
  );
}

export default function TemplatesPage() {
  return (
    <main className="templatesShell">
      <nav className="templatesNav">
        <Link href="/" className="brandLink">
          <span className="brandMark">CF</span>
          CareerForge
        </Link>
        <div>
          <Link className="secondaryButton" href="/">Builder</Link>
          <Link className="secondaryButton" href="/tailor">AI Tailor</Link>
          <Link className="secondaryButton" href="/dashboard">Dashboard</Link>
        </div>
      </nav>

      <section className="templatesHero">
        <p className="eyebrow">Resume templates</p>
        <h1>Choose a professional template before you start editing.</h1>
        <p>Pick a layout that matches your target role. You can switch templates later without losing your content.</p>
      </section>

      <section className="templateShowcase" aria-label="Choose resume template">
        {resumeTemplates.map((template) => (
          <article className="templateShowcaseCard" key={template.id}>
            <TemplatePreview template={template} />
            <div className="templateShowcaseBody">
              <span>{template.category}</span>
              <h2>{template.name}</h2>
              <p>{template.description}</p>
              <small>{template.bestFor}</small>
              <div className="templateFilterTags">
                {template.filters.slice(0, 4).map((filter) => <em key={filter}>{filter}</em>)}
              </div>
              <button className="primaryButton" type="button" onClick={() => chooseTemplate(template)}>
                Use this template
              </button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
