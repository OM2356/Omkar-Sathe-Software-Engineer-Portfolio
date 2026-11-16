import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 sm:px-6 py-28 text-center space-y-6">
      <p className="font-mono text-sm font-semibold text-blue-600 dark:text-cyan-400">
        Error 404
      </p>
      <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
        Page Not Found
      </h1>
      <p className="text-base text-slate-600 dark:text-slate-300 max-w-md mx-auto">
        The route you requested does not exist on this portfolio. Return to the main showcase to explore projects, skills, and resume details.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Link
          to="/"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Portfolio Home
        </Link>
      </div>
    </main>
  );
}
