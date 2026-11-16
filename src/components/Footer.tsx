import { Link } from 'react-router-dom';
import { ExternalLink, Github, Linkedin, Moon, Shield, Sun } from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';

export function Footer() {
  const { data, theme, toggleTheme } = usePortfolio();
  const year = new Date().getFullYear();
  const githubHref = data.profile.githubUrl || 'https://github.com/OM2356';
  const linkedinHref =
    data.profile.linkedinUrl || 'https://www.linkedin.com/in/omkar-sathe-1173b3319/';

  return (
    <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-slate-100/60 dark:bg-[#050811]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="font-display text-base font-bold text-slate-900 dark:text-slate-100">
            {data.profile.name}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            © {year} {data.profile.name} · {data.profile.educationSummary} · Pune, India
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-600 dark:text-slate-400">
          <a href="#about" className="hover:text-slate-900 dark:hover:text-white transition-colors px-1">
            About
          </a>
          <a href="#projects" className="hover:text-slate-900 dark:hover:text-white transition-colors px-1">
            Projects
          </a>
          <a href="#resume" className="hover:text-slate-900 dark:hover:text-white transition-colors px-1">
            Resume
          </a>
          <a href="#contact" className="hover:text-slate-900 dark:hover:text-white transition-colors px-1">
            Contact
          </a>

          <a
            href={githubHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View GitHub Profile"
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:border-blue-500/60 dark:hover:border-cyan-400/60 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-all duration-200 hover:-translate-y-0.5 whitespace-nowrap shrink-0"
          >
            <Github className="h-3.5 w-3.5" />
            GitHub
            <ExternalLink className="h-3 w-3 opacity-70" />
          </a>

          <a
            href={linkedinHref}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Connect on LinkedIn"
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-blue-500/40 bg-blue-50/70 dark:bg-blue-950/35 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:text-cyan-300 hover:border-blue-500 dark:hover:border-cyan-400 hover:bg-blue-100/80 dark:hover:bg-blue-900/45 transition-all duration-200 hover:-translate-y-0.5 whitespace-nowrap shrink-0"
          >
            <Linkedin className="h-3.5 w-3.5" />
            LinkedIn
            <ExternalLink className="h-3 w-3 opacity-70" />
          </a>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors"
          >
            {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            {theme === 'dark' ? 'Light' : 'Dark'}
          </button>

          <Link
            to="/admin"
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-cyan-400 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors"
          >
            <Shield className="h-3.5 w-3.5" />
            Admin Panel
          </Link>
        </div>
      </div>
    </footer>
  );
}
