import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { X, ExternalLink, FolderGit2, CheckCircle2, ArrowRight, Code2 } from 'lucide-react';
import type { ProjectItem } from '../types/portfolio';

interface ProjectModalProps {
  project: ProjectItem | null;
  onClose: () => void;
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [project?.id]);

  useEffect(() => {
    if (!project) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [project, onClose]);

  if (!project) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1424] shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close project details"
          className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900/75 text-white hover:bg-slate-900 transition-colors focus-visible:outline-2 focus-visible:outline-blue-400"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="aspect-[16/9] w-full overflow-hidden bg-slate-900">
          {project.imageUrl && !imgError ? (
            <img
              src={project.imageUrl}
              alt={`${project.title} preview`}
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-slate-800 via-[#0F1B33] to-slate-900">
              <Code2 className="mb-2 h-10 w-10 text-cyan-400" />
              <span className="font-display text-lg font-semibold text-white">
                {project.title}
              </span>
            </div>
          )}
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span className="text-blue-600 dark:text-cyan-400">{project.category}</span>
              {project.status && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{project.status}</span>
                </>
              )}
            </div>
            <h2
              id="project-modal-title"
              className="mt-2 font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50"
            >
              {project.title}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-slate-600 dark:text-slate-300">
              {project.description}
            </p>
          </div>

          {project.features.length > 0 && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <h3 className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
                Key Implemented Features
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {project.features.map((feat, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-cyan-400" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <h3 className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2">
              Technologies Used
            </h3>
            <p className="text-sm font-mono text-slate-600 dark:text-slate-300">
              {project.technologies.join(' · ')}
            </p>
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              {project.liveUrl ? (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
                >
                  Open Live Demo
                  <ExternalLink className="h-4 w-4" />
                </a>
              ) : (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Live demo URL not yet added (editable in Admin)
                </span>
              )}

              {project.githubUrl ? (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <FolderGit2 className="h-4 w-4" />
                  View Source
                </a>
              ) : (
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  GitHub link editable in Admin
                </span>
              )}
            </div>

            <Link
              to={`/projects/${project.slug}`}
              onClick={onClose}
              className="inline-flex min-h-[40px] items-center gap-1.5 text-sm font-semibold text-blue-600 dark:text-cyan-400 hover:underline"
            >
              Open Full Project Page
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
