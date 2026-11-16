import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Code2, ExternalLink, FolderGit2 } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

export function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data } = usePortfolio();
  const [imgError, setImgError] = useState(false);

  const project = data.projects.find((p) => p.slug === slug);

  if (!project) {
    return (
      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-24 text-center space-y-5">
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-slate-50">
          Project Not Found
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          The requested project could not be located in the portfolio catalog.
        </p>
        <Link
          to="/"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Return to Portfolio
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 sm:px-6 py-12 sm:py-16 space-y-10">
      <div>
        <Link
          to="/#projects"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Featured Projects
        </Link>
      </div>

      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-blue-600 dark:text-cyan-400">{project.category}</span>
          {project.status && (
            <>
              <span aria-hidden="true">·</span>
              <span>{project.status}</span>
            </>
          )}
        </div>
        <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          {project.title}
        </h1>
        <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300">
          {project.description}
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          {project.liveUrl ? (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
            >
              Open Live Demo
              <ExternalLink className="h-4 w-4" />
            </a>
          ) : (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Live deployment URL editable in Admin
            </span>
          )}

          {project.githubUrl ? (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <FolderGit2 className="h-4 w-4" />
              GitHub Repository
            </a>
          ) : (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              GitHub repository URL editable in Admin
            </span>
          )}
        </div>
      </header>

      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-900 aspect-[16/9]">
        {project.imageUrl && !imgError ? (
          <img
            src={project.imageUrl}
            alt={`${project.title} full preview`}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-800 via-[#0F1B33] to-slate-900">
            <Code2 className="mb-3 h-10 w-10 text-cyan-400" />
            <span className="font-display text-lg font-semibold text-white">{project.title}</span>
          </div>
        )}
      </div>

      <section className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-4">
        <div className="md:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1424] p-6 sm:p-8 space-y-4">
          <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-slate-50">
            Implemented Capabilities
          </h2>
          {project.features.length > 0 ? (
            <ul className="space-y-3">
              {project.features.map((feat, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-cyan-400" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">Feature details editable in Admin.</p>
          )}
        </div>

        <div className="md:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1424] p-6 sm:p-8 space-y-4">
          <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-slate-50">
            Technology Stack
          </h2>
          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {project.technologies.map((tech, idx) => (
              <li
                key={idx}
                className="py-2.5 first:pt-0 last:pb-0 font-mono text-sm text-slate-700 dark:text-slate-200"
              >
                {tech}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
