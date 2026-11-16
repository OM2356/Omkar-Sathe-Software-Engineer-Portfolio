import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Code2, ExternalLink, FolderGit2 } from 'lucide-react';
import type { ProjectItem } from '../types/portfolio';

interface ProjectCardProps {
  project: ProjectItem;
  onInspect: (project: ProjectItem) => void;
}

export function ProjectCard({ project, onInspect }: ProjectCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800/90 bg-white dark:bg-[#0D1424] transition-transform duration-200 hover:-translate-y-1">
      <div
        onClick={() => onInspect(project)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onInspect(project);
          }
        }}
        aria-label={`Inspect details for ${project.title}`}
        className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-900 cursor-pointer focus-visible:outline-2 focus-visible:outline-blue-500"
      >
        {project.imageUrl && !imgError ? (
          <img
            src={project.imageUrl}
            alt={`${project.title} showcase visual`}
            referrerPolicy="no-referrer"
            loading="lazy"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-800 via-[#0F1B33] to-slate-900 p-6 text-center">
            <Code2 className="mb-3 h-9 w-9 text-cyan-400" />
            <span className="font-display text-base font-semibold text-slate-100">
              {project.title}
            </span>
          </div>
        )}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60"
        />
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <span className="text-blue-600 dark:text-cyan-400">{project.category}</span>
          {project.status && (
            <>
              <span aria-hidden="true">·</span>
              <span>{project.status}</span>
            </>
          )}
        </div>

        <h3 className="font-display text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          <button
            type="button"
            onClick={() => onInspect(project)}
            className="text-left hover:text-blue-600 dark:hover:text-cyan-400 transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 rounded-sm"
          >
            {project.title}
          </button>
        </h3>

        <p className="mt-2.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300 line-clamp-3">
          {project.summary || project.description}
        </p>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          {project.technologies.join(' · ')}
        </div>

        <div className="mt-auto pt-5 flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => onInspect(project)}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-slate-900 dark:bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:hover:bg-blue-500 transition-colors whitespace-nowrap shrink-0"
          >
            Details
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>

          {project.liveUrl ? (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
            >
              Live Demo
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : (
            <Link
              to={`/projects/${project.slug}`}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 px-3.5 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors whitespace-nowrap shrink-0"
            >
              Case Study
            </Link>
          )}

          {project.githubUrl ? (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
            >
              <FolderGit2 className="h-3.5 w-3.5" />
              GitHub
            </a>
          ) : (
            <span className="text-xs text-slate-400 dark:text-slate-500">
              GitHub URL editable in Admin
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
