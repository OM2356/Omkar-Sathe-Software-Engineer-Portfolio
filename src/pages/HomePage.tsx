import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDown,
  ArrowUp,
  Award,
  BookOpen,
  Briefcase,
  Download,
  ExternalLink,
  FileText,
  Github,
  GraduationCap,
  Linkedin,
  Mail,
  Moon,
  Search,
  Sun,
  User,
} from 'lucide-react';
import { ContactSection } from '../components/ContactSection';
import { GitHubShowcase } from '../components/GitHubShowcase';
import { ProjectCard } from '../components/ProjectCard';
import { ProjectModal } from '../components/ProjectModal';
import { ResumeSection } from '../components/ResumeSection';
import { SkillsVisualization } from '../components/SkillsVisualization';
import { usePortfolio } from '../context/PortfolioContext';
import { triggerResumeDownload } from '../lib/pdfResume';
import type { ProjectCategory, ProjectItem } from '../types/portfolio';

const PROJECT_FILTERS: Array<'All' | ProjectCategory> = [
  'All',
  'AI & ML',
  'Full-Stack',
  'Automation',
  'Backend',
  'Frontend',
];

export function HomePage() {
  const { data, theme, toggleTheme } = usePortfolio();
  const { profile, projects, skills, experiences, education, certifications, achievements } = data;

  const [projectFilter, setProjectFilter] = useState<'All' | ProjectCategory>('All');
  const [projectQuery, setProjectQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(null);
  const [avatarError, setAvatarError] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    setAvatarError(false);
  }, [profile.avatarUrl]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 520);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredProjects = useMemo(() => {
    return projects.filter((proj) => {
      const matchesCat = projectFilter === 'All' || proj.category === projectFilter;
      const q = projectQuery.trim().toLowerCase();
      if (!q) return matchesCat;
      const hay = `${proj.title} ${proj.description} ${proj.technologies.join(' ')}`.toLowerCase();
      return matchesCat && hay.includes(q);
    });
  }, [projects, projectFilter, projectQuery]);

  return (
    <main className="relative overflow-x-clip">
      {/* Subtle Ambient Architectural Grid Backdrop */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[760px] ambient-grid [mask-image:linear-gradient(to_bottom,black,transparent)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 right-1/4 h-96 w-96 rounded-full bg-blue-600/10 dark:bg-blue-500/15 blur-3xl animate-subtle-float"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-40 left-1/4 h-80 w-80 rounded-full bg-violet-600/10 dark:bg-violet-500/10 blur-3xl"
      />

      {/* A. HOME / HERO */}
      <section id="home" className="relative pt-14 pb-16 sm:pt-20 sm:pb-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            {/* Left Column: Typography & Actions */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-8">
              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                    <span className="text-blue-600 dark:text-cyan-400 font-semibold">
                      {profile.availabilityStatus}
                    </span>
                    <span aria-hidden="true"> · </span>
                    <span>{profile.location}</span>
                  </p>

                  <button
                    type="button"
                    onClick={toggleTheme}
                    aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                    className="inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-[#0D1424]/80 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                  </button>
                </div>

                <div className="space-y-2.5">
                  <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.4rem] font-bold tracking-tight leading-[1.08] text-slate-900 dark:text-slate-50 [text-wrap:balance]">
                    {profile.name}
                  </h1>
                  <p className="font-display text-lg sm:text-xl font-semibold text-blue-700 dark:text-cyan-300 leading-snug">
                    {profile.title}
                  </p>
                </div>

                <p className="text-base sm:text-lg font-medium leading-relaxed text-slate-700 dark:text-slate-200 max-w-2xl">
                  &ldquo;{profile.headline}&rdquo;
                </p>

                <p className="text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300 max-w-2xl">
                  {profile.bio}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href="#projects"
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition-all duration-200 hover:-translate-y-0.5 whitespace-nowrap shrink-0"
                  >
                    View My Projects
                    <ArrowDown className="h-4 w-4" />
                  </a>

                  <button
                    type="button"
                    onClick={() => triggerResumeDownload(data)}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1424] px-4 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 hover:-translate-y-0.5 whitespace-nowrap shrink-0"
                  >
                    <Download className="h-4 w-4" />
                    Download Resume
                  </button>

                  <a
                    href="#contact"
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 hover:-translate-y-0.5 whitespace-nowrap shrink-0"
                  >
                    <Mail className="h-4 w-4" />
                    Contact Me
                  </a>
                </div>

                {/* Professional GitHub & LinkedIn Profile Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <a
                    href={profile.githubUrl || 'https://github.com/OM2356'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[42px] items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700/90 bg-slate-100/80 dark:bg-slate-900/80 px-4 py-2 text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 hover:border-blue-500/60 dark:hover:border-cyan-400/60 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-all duration-200 hover:-translate-y-0.5 whitespace-nowrap shrink-0"
                  >
                    <Github className="h-4 w-4 text-slate-900 dark:text-white" />
                    View GitHub Profile
                    <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                  </a>

                  <a
                    href={profile.linkedinUrl || 'https://www.linkedin.com/in/omkar-sathe-1173b3319/'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-[42px] items-center gap-2 rounded-lg border border-blue-500/40 dark:border-blue-500/40 bg-blue-50/70 dark:bg-blue-950/35 px-4 py-2 text-xs sm:text-sm font-semibold text-blue-700 dark:text-cyan-300 hover:border-blue-500 dark:hover:border-cyan-400 hover:bg-blue-100/80 dark:hover:bg-blue-900/45 transition-all duration-200 hover:-translate-y-0.5 whitespace-nowrap shrink-0"
                  >
                    <Linkedin className="h-4 w-4" />
                    Connect on LinkedIn
                    <ExternalLink className="h-3.5 w-3.5 opacity-70" />
                  </a>
                </div>
              </div>
            </div>

            {/* Right Column: Profile Portrait */}
            <div className="lg:col-span-5 flex">
              <div className="relative w-full overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#0D1424] min-h-[340px]">
                {profile.avatarUrl && !avatarError ? (
                  <img
                    src={profile.avatarUrl}
                    alt={`${profile.name} portrait`}
                    referrerPolicy="no-referrer"
                    onError={() => setAvatarError(true)}
                    className="h-full w-full object-cover lg:absolute lg:inset-0"
                  />
                ) : (
                  <div className="flex h-full min-h-[340px] w-full flex-col items-center justify-center bg-gradient-to-br from-slate-800 via-[#0F1B33] to-slate-950 p-8 text-center">
                    <User className="mb-3 h-12 w-12 text-cyan-400" />
                    <span className="font-display text-lg font-semibold text-white">
                      {profile.name}
                    </span>
                    <span className="mt-1 text-xs text-slate-300">
                      Upload profile photo via Admin Dashboard
                    </span>
                  </div>
                )}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/75 via-black/30 to-transparent"
                />
                <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between gap-3 text-white">
                  <div>
                    <div className="font-display text-base font-semibold">{profile.name}</div>
                    <div className="text-xs text-slate-200">{profile.educationSummary}</div>
                  </div>
                  <Link
                    to="/admin"
                    className="rounded-md bg-white/15 backdrop-blur-md px-2.5 py-1 text-xs font-medium text-white hover:bg-white/25 transition-colors"
                  >
                    Update Photo
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Full-width 4-Column Summary Strip below Hero Split */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1424] p-6">
            <div className="space-y-1">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Education</div>
              <div className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
                {profile.educationSummary}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Bharati Vidyapeeth, Pune
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Core Engineering Focus
              </div>
              <div className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
                Full-Stack · Applied AI · QA
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                React, Python, Node.js, PostgreSQL
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Target Career Path
              </div>
              <div className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
                Software Development Engineer
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Microsoft & product-based teams
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Campus Leadership
              </div>
              <div className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100">
                Sports Club General Secretary
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Volleyball · Chess · Hackathons
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* B. ABOUT ME */}
      <section id="about" className="py-20 sm:py-24 border-t border-slate-200 dark:border-slate-800/80">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-cyan-400">
                Background & Engineering Philosophy
              </p>
              <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                About Me
              </h2>
              <p className="mt-3 text-base text-slate-600 dark:text-slate-300">
                {profile.college}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href={profile.githubUrl || 'https://github.com/OM2356'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[42px] items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1424] px-4 py-2 text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 hover:border-blue-500/60 dark:hover:border-cyan-400/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 hover:-translate-y-0.5 whitespace-nowrap shrink-0"
              >
                <Github className="h-4 w-4" />
                View GitHub Profile
                <ExternalLink className="h-3.5 w-3.5 opacity-70" />
              </a>

              <a
                href={profile.linkedinUrl || 'https://www.linkedin.com/in/omkar-sathe-1173b3319/'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[42px] items-center gap-2 rounded-lg border border-blue-500/40 bg-blue-50/70 dark:bg-blue-950/35 px-4 py-2 text-xs sm:text-sm font-semibold text-blue-700 dark:text-cyan-300 hover:border-blue-500 dark:hover:border-cyan-400 hover:bg-blue-100/80 dark:hover:bg-blue-900/45 transition-all duration-200 hover:-translate-y-0.5 whitespace-nowrap shrink-0"
              >
                <Linkedin className="h-4 w-4" />
                Connect on LinkedIn
                <ExternalLink className="h-3.5 w-3.5 opacity-70" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <article className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1424] p-6 space-y-2.5">
              <h3 className="font-display text-base font-semibold text-slate-900 dark:text-slate-50">
                01. Educational Background
              </h3>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {profile.aboutEducation}
              </p>
            </article>

            <article className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1424] p-6 space-y-2.5">
              <h3 className="font-display text-base font-semibold text-slate-900 dark:text-slate-50">
                02. Technical Interests
              </h3>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {profile.aboutInterests}
              </p>
            </article>

            <article className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1424] p-6 space-y-2.5">
              <h3 className="font-display text-base font-semibold text-slate-900 dark:text-slate-50">
                03. Career Objectives
              </h3>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {profile.aboutObjectives}
              </p>
            </article>

            <article className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1424] p-6 space-y-2.5 md:col-span-1 lg:col-span-1">
              <h3 className="font-display text-base font-semibold text-slate-900 dark:text-slate-50">
                04. Problem-Solving Approach
              </h3>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {profile.aboutProblemSolving}
              </p>
            </article>

            <article className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1424] p-6 space-y-2.5 md:col-span-2 lg:col-span-2">
              <h3 className="font-display text-base font-semibold text-slate-900 dark:text-slate-50">
                05. Interest in AI & Software Engineering
              </h3>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {profile.aboutAiApproach}
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* C. TECHNICAL SKILLS */}
      <section id="skills" className="py-20 sm:py-24 border-t border-slate-200 dark:border-slate-800/80">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl mb-10">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-cyan-400">
              Engineering Toolkit
            </p>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              Technical Skills
            </h2>
            <p className="mt-3 text-base text-slate-600 dark:text-slate-300">
              Languages, frameworks, databases, AI tooling, and computer science foundations applied across coursework and software builds.
            </p>
          </div>

          <SkillsVisualization skills={skills} />
        </div>
      </section>

      {/* D. FEATURED PROJECTS */}
      <section id="projects" className="py-20 sm:py-24 border-t border-slate-200 dark:border-slate-800/80">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-cyan-400">
                Selected Work
              </p>
              <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                Featured Projects
              </h2>
              <p className="mt-3 text-base text-slate-600 dark:text-slate-300">
                Real engineering builds spanning conversational AI for seniors, Playwright test automation, full-stack platforms, and Django REST backends.
              </p>
            </div>

            <div className="relative w-full lg:w-72">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={projectQuery}
                onChange={(e) => setProjectQuery(e.target.value)}
                placeholder="Search title or tech..."
                aria-label="Search projects"
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1424] pl-10 pr-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Interactive Filter Controls */}
          <div className="mb-8 flex flex-wrap items-center gap-1.5 p-1.5 rounded-xl bg-slate-200/70 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 w-fit max-w-full">
            {PROJECT_FILTERS.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setProjectFilter(cat)}
                className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  projectFilter === cat
                    ? 'bg-white dark:bg-blue-600 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {filteredProjects.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1424] p-10 text-center">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                No projects match the current filter.
              </p>
              <button
                type="button"
                onClick={() => {
                  setProjectFilter('All');
                  setProjectQuery('');
                }}
                className="mt-4 inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500"
              >
                Reset Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onInspect={setSelectedProject}
                />
              ))}
            </div>
          )}

          {/* GitHub API Live Feed */}
          <GitHubShowcase
            username={profile.githubUsername}
            githubUrl={profile.githubUrl}
          />
        </div>
      </section>

      {/* E. EXPERIENCE AND INTERNSHIPS */}
      <section id="experience" className="py-20 sm:py-24 border-t border-slate-200 dark:border-slate-800/80">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-cyan-400">
              Engineering Timeline
            </p>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              Experience & Technical Tracks
            </h2>
            <p className="mt-3 text-base text-slate-600 dark:text-slate-300">
              Transparent overview of active software engineering, AI integration, browser automation, and hackathon tracks. Editable in Admin as verified internships are added.
            </p>
          </div>

          <div className="space-y-6">
            {experiences.map((exp) => (
              <article
                key={exp.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1424] p-6 sm:p-8"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                      <span className="text-blue-600 dark:text-cyan-400 font-semibold">
                        {exp.category}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{exp.verifiedStatus}</span>
                      {exp.location && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{exp.location}</span>
                        </>
                      )}
                    </div>
                    <h3 className="mt-1.5 font-display text-xl font-semibold text-slate-900 dark:text-slate-50">
                      {exp.role}
                    </h3>
                    <div className="mt-0.5 flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                      <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                      <span>{exp.organization}</span>
                    </div>
                  </div>
                  <div className="font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400 shrink-0">
                    {exp.period}
                  </div>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {exp.description}
                </p>

                {exp.highlights.length > 0 && (
                  <ul className="mt-4 space-y-1.5 text-sm text-slate-600 dark:text-slate-300 list-disc pl-5">
                    {exp.highlights.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* F. EDUCATION */}
      <section id="education" className="py-20 sm:py-24 border-t border-slate-200 dark:border-slate-800/80">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-cyan-400">
              Academic Foundation
            </p>
            <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
              Education
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {education.map((edu) => (
              <article
                key={edu.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1424] p-6 sm:p-8 flex flex-col justify-between space-y-5"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-blue-600 dark:text-cyan-400">
                      {edu.yearLabel || 'Academic Degree'}
                    </span>
                    <span className="font-mono tabular-nums">{edu.period}</span>
                  </div>
                  <h3 className="font-display text-xl font-semibold text-slate-900 dark:text-slate-50">
                    {edu.degree}
                  </h3>
                  <div className="flex items-start gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                    <GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-cyan-400" />
                    <span>
                      {edu.institution} · {edu.location}
                    </span>
                  </div>
                  <p className="pt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {edu.description}
                  </p>
                </div>

                {edu.coursework.length > 0 && (
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                      <BookOpen className="h-3.5 w-3.5 text-blue-600 dark:text-cyan-400" />
                      Core Coursework
                    </div>
                    <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                      {edu.coursework.join(' · ')}
                    </p>
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* G. CERTIFICATIONS & H. ACHIEVEMENTS */}
      <section id="certifications" className="py-20 sm:py-24 border-t border-slate-200 dark:border-slate-800/80">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 space-y-20">
          {/* Certifications Gallery */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-cyan-400">
                  Verified Credentials
                </p>
                <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                  Certifications
                </h2>
                <p className="mt-3 text-base text-slate-600 dark:text-slate-300">
                  Includes coursework certificates with support for PDF and image uploads in the Admin Dashboard.
                </p>
              </div>
              <Link
                to="/admin"
                className="inline-flex min-h-[40px] items-center rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
              >
                Upload Certificate in Admin
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {certifications.map((cert) => {
                const isPdf =
                  cert.certificateFileType === 'application/pdf' ||
                  cert.certificateFileUrl.toLowerCase().endsWith('.pdf');
                return (
                  <article
                    key={cert.id}
                    className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1424] p-6 sm:p-8 flex flex-col justify-between space-y-5"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span className="font-semibold text-blue-600 dark:text-cyan-400">
                          {cert.issuer}
                        </span>
                        <span className="font-mono tabular-nums">{cert.issueDate}</span>
                      </div>
                      <h3 className="font-display text-xl font-semibold text-slate-900 dark:text-slate-50">
                        {cert.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                        {cert.description}
                      </p>
                    </div>

                    {cert.certificateFileUrl ? (
                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                        {!isPdf ? (
                          <img
                            src={cert.certificateFileUrl}
                            alt={`${cert.title} certificate`}
                            referrerPolicy="no-referrer"
                            className="w-full max-h-56 rounded-xl object-cover border border-slate-200 dark:border-slate-800"
                          />
                        ) : (
                          <div className="flex items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-3.5">
                            <FileText className="h-5 w-5 text-blue-600 dark:text-cyan-400 shrink-0" />
                            <span className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">
                              {cert.certificateFileName || 'Certificate PDF'}
                            </span>
                          </div>
                        )}
                        <div className="flex flex-wrap items-center gap-3">
                          <a
                            href={cert.certificateFileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-[38px] items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-500 transition-colors"
                          >
                            View Certificate
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                          {cert.credentialUrl && (
                            <a
                              href={cert.credentialUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-semibold text-blue-600 dark:text-cyan-400 hover:underline"
                            >
                              Verify Credential
                            </a>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span>Certificate PDF or image not yet uploaded</span>
                        <Link
                          to="/admin"
                          className="font-semibold text-blue-600 dark:text-cyan-400 hover:underline"
                        >
                          Attach File
                        </Link>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </div>

          {/* Achievements */}
          <div id="achievements">
            <div className="max-w-2xl mb-10">
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-cyan-400">
                Leadership, Sports & Engineering
              </p>
              <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                Achievements & Extracurriculars
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((ach) => (
                <article
                  key={ach.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1424] p-6 space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold text-blue-600 dark:text-cyan-400">
                      {ach.category}
                    </span>
                    <span>{ach.period}</span>
                  </div>
                  <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-50 flex items-start gap-2">
                    <Award className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-cyan-400" />
                    <span>{ach.title}</span>
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {ach.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* I. RESUME */}
      <ResumeSection data={data} />

      {/* J. CONTACT */}
      <ContactSection profile={profile} />

      {/* Project Detail Modal */}
      <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
          className="fixed bottom-6 right-6 z-30 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-300 dark:border-slate-700 bg-white/90 dark:bg-[#0D1424]/90 text-slate-800 dark:text-slate-100 shadow-lg backdrop-blur-md hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 transition-colors"
        >
          <ArrowUp className="h-4 w-4" />
        </button>
      )}
    </main>
  );
}
