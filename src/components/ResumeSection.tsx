import { Download, Eye, FileText, Settings2 } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SKILL_CATEGORIES } from '../data/defaultPortfolio';
import { triggerResumeDownload } from '../lib/pdfResume';
import type { PortfolioDataBundle } from '../types/portfolio';

interface ResumeSectionProps {
  data: PortfolioDataBundle;
}

export function ResumeSection({ data }: ResumeSectionProps) {
  const [showFullPreview, setShowFullPreview] = useState(true);
  const { profile, education, skills, projects, experiences, certifications, resumeMeta } = data;

  return (
    <section id="resume" className="py-20 sm:py-24 border-t border-slate-200 dark:border-slate-800/80">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-cyan-400">
              Curriculum Vitae
            </p>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              Resume & Technical Summary
            </h2>
            <p className="mt-3 text-base text-slate-600 dark:text-slate-300">
              {resumeMeta.fileUrl
                ? `Uploaded Resume: ${resumeMeta.fileName}`
                : 'Preview the live resume structured directly from verified portfolio data, or download a formatted PDF copy.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => triggerResumeDownload(data)}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition-colors whitespace-nowrap shrink-0"
            >
              <Download className="h-4 w-4" />
              Download PDF Resume
            </button>

            <button
              type="button"
              onClick={() => setShowFullPreview((prev) => !prev)}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
            >
              <Eye className="h-4 w-4" />
              {showFullPreview ? 'Compact View' : 'Show Full Preview'}
            </button>

            <Link
              to="/admin"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
            >
              <Settings2 className="h-4 w-4" />
              Replace Resume
            </Link>
          </div>
        </div>

        {/* Uploaded PDF Embed Preview if custom PDF exists */}
        {resumeMeta.fileUrl && (
          <div className="mb-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1424] p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <FileText className="h-5 w-5 text-blue-600 dark:text-cyan-400" />
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {resumeMeta.fileName || 'Uploaded Resume PDF'}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Uploaded custom PDF resume
                  </div>
                </div>
              </div>
              <a
                href={resumeMeta.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-blue-600 dark:text-cyan-400 hover:underline"
              >
                Open PDF in New Tab
              </a>
            </div>
            <div className="mt-4 h-[480px] w-full overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950">
              <iframe
                src={resumeMeta.fileUrl}
                title="Omkar Sathe Uploaded Resume PDF"
                className="h-full w-full"
              />
            </div>
          </div>
        )}

        {/* Structured On-Page Resume Document */}
        {showFullPreview && (
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1424] p-6 sm:p-10 space-y-8">
            {/* Resume Header */}
            <div className="flex flex-col md:flex-row md:items-baseline justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-50">
                  {profile.name}
                </h3>
                <p className="mt-1 text-sm font-medium text-blue-600 dark:text-cyan-400">
                  {profile.title} · {profile.educationSummary}
                </p>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1 md:text-right font-mono">
                <div>{profile.location}</div>
                <div>{profile.email || 'Email configurable in Admin'}</div>
                <div>
                  {profile.githubUrl ? 'GitHub Linked' : 'GitHub: Editable in Admin'} ·{' '}
                  {profile.linkedinUrl ? 'LinkedIn Linked' : 'LinkedIn: Editable in Admin'}
                </div>
              </div>
            </div>

            {/* Education */}
            <div>
              <h4 className="font-display text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-3">
                Education
              </h4>
              <div className="space-y-3">
                {education.map((edu) => (
                  <div key={edu.id} className="flex flex-col sm:flex-row sm:justify-between gap-1">
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {edu.degree}
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        {edu.institution} · {edu.location}
                      </div>
                    </div>
                    <div className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400 shrink-0">
                      {edu.period}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills Summary */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
              <h4 className="font-display text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-3">
                Technical Skills
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {SKILL_CATEGORIES.map((cat) => {
                  const list = skills.filter((s) => s.category === cat).map((s) => s.name);
                  if (list.length === 0) return null;
                  return (
                    <div key={cat}>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">
                        {cat}:{' '}
                      </span>
                      <span className="text-slate-600 dark:text-slate-300">{list.join(', ')}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Projects Summary */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
              <h4 className="font-display text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-3">
                Key Projects
              </h4>
              <div className="space-y-4">
                {projects.map((proj) => (
                  <div key={proj.id}>
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {proj.title}
                      </span>
                      <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                        {proj.technologies.join(' · ')}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                      {proj.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Experience & Certifications */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-100 dark:border-slate-800">
              <div>
                <h4 className="font-display text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-3">
                  Experience Tracks
                </h4>
                <div className="space-y-3">
                  {experiences.slice(0, 4).map((exp) => (
                    <div key={exp.id}>
                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {exp.role}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {exp.organization} · {exp.period}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-display text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 mb-3">
                  Certifications
                </h4>
                <div className="space-y-3">
                  {certifications.map((cert) => (
                    <div key={cert.id}>
                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {cert.title}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {cert.issuer} · {cert.issueDate}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
