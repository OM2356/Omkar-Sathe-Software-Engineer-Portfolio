import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Database,
  FileText,
  LogIn,
  LogOut,
  Mail,
  Plus,
  Save,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Upload,
} from 'lucide-react';
import { usePortfolio } from '../context/PortfolioContext';
import { SKILL_CATEGORIES } from '../data/defaultPortfolio';
import { ADMIN_EMAIL, isFirebaseConfigured } from '../lib/firebase';
import {
  deleteAchievement,
  deleteCertification,
  deleteContactMessage,
  deleteEducation,
  deleteExperience,
  deleteProject,
  deleteSkill,
  saveAchievement,
  saveCertification,
  saveEducation,
  saveExperience,
  saveProfile,
  saveProject,
  saveResumeMeta,
  saveSkill,
  seedDefaultPortfolioToFirestore,
  subscribeToContactMessages,
  updateContactMessageStatus,
  uploadPortfolioAsset,
} from '../lib/portfolioService';
import type {
  AchievementCategory,
  AchievementItem,
  CertificationItem,
  ContactMessage,
  EducationItem,
  ExperienceCategory,
  ExperienceItem,
  PortfolioProfile,
  ProjectCategory,
  ProjectItem,
  SkillCategory,
  SkillItem,
} from '../types/portfolio';

type AdminTab =
  | 'profile'
  | 'projects'
  | 'skills'
  | 'experience'
  | 'education'
  | 'certifications'
  | 'achievements'
  | 'resume'
  | 'messages';

const TABS: Array<{ id: AdminTab; label: string }> = [
  { id: 'profile', label: 'Profile & About' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'experience', label: 'Experience' },
  { id: 'education', label: 'Education' },
  { id: 'certifications', label: 'Certifications' },
  { id: 'achievements', label: 'Achievements' },
  { id: 'resume', label: 'Resume PDF' },
  { id: 'messages', label: 'Inbox' },
];

export function AdminPage() {
  const {
    data,
    user,
    authLoading,
    isAdmin,
    authError,
    signInWithGoogle,
    logout,
  } = usePortfolio();

  const [activeTab, setActiveTab] = useState<AdminTab>('profile');
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Profile form
  const [profileForm, setProfileForm] = useState<PortfolioProfile>(data.profile);
  useEffect(() => {
    setProfileForm(data.profile);
  }, [data.profile]);

  // Project editor
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [featuresText, setFeaturesText] = useState('');
  const [techText, setTechText] = useState('');

  // Skill editor
  const [editingSkill, setEditingSkill] = useState<SkillItem | null>(null);

  // Experience editor
  const [editingExp, setEditingExp] = useState<ExperienceItem | null>(null);
  const [expHighlightsText, setExpHighlightsText] = useState('');

  // Education editor
  const [editingEdu, setEditingEdu] = useState<EducationItem | null>(null);
  const [eduCourseworkText, setEduCourseworkText] = useState('');

  // Certification editor
  const [editingCert, setEditingCert] = useState<CertificationItem | null>(null);

  // Achievement editor
  const [editingAch, setEditingAch] = useState<AchievementItem | null>(null);

  // Contact Messages (Admin only)
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  useEffect(() => {
    if (!isAdmin) {
      setMessages([]);
      return;
    }
    const unsub = subscribeToContactMessages(
      (items) => setMessages(items),
      (err) => setNotice({ type: 'error', text: err.message }),
    );
    return () => unsub();
  }, [isAdmin]);

  const showSuccess = (text: string) => {
    setNotice({ type: 'success', text });
    setTimeout(() => setNotice(null), 5000);
  };

  const showError = (err: unknown) => {
    setNotice({
      type: 'error',
      text: err instanceof Error ? err.message : 'Operation failed.',
    });
  };

  const handleSeedDefaults = async (force: boolean) => {
    setBusy(true);
    try {
      const res = await seedDefaultPortfolioToFirestore(force);
      showSuccess(
        res.seeded
          ? 'Portfolio data seeded to Firestore.'
          : 'Firestore already contains your portfolio profile.',
      );
    } catch (err) {
      showError(err);
    } finally {
      setBusy(false);
    }
  };

  if (authLoading) {
    return (
      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-24 text-center">
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Verifying authentication session...
        </p>
      </main>
    );
  }

  if (!isFirebaseConfigured) {
    return (
      <main className="mx-auto max-w-2xl px-4 sm:px-6 py-24">
        <div className="rounded-2xl border border-amber-500/30 bg-white dark:bg-[#0D1424] p-8 space-y-4">
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-50">
            Firebase Not Configured
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            The portfolio is running in local preview mode because Firebase credentials are not configured. Configure Firebase Authentication and Firestore in <code className="font-mono">firebase-applet-config.json</code> to enable Admin login and persistence.
          </p>
          <Link
            to="/"
            className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Portfolio
          </Link>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-lg px-4 sm:px-6 py-24">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1424] p-8 space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-cyan-400">
              <ShieldCheck className="h-4 w-4" />
              Protected Route
            </div>
            <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-slate-50">
              Portfolio Admin Sign-In
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Sign in with the verified portfolio owner Google account (<span className="font-mono">{ADMIN_EMAIL}</span>). All write operations are validated both by Firestore security rules and server-side Firebase ID token verification.
            </p>
          </div>

          {authError && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs text-rose-700 dark:text-rose-300">
              {authError}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={signInWithGoogle}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition-colors"
            >
              <LogIn className="h-4 w-4" />
              Sign in with Google
            </button>
            <Link
              to="/"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Back to Portfolio
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="mx-auto max-w-lg px-4 sm:px-6 py-24">
        <div className="rounded-2xl border border-rose-500/30 bg-white dark:bg-[#0D1424] p-8 space-y-5">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <ShieldAlert className="h-5 w-5" />
            <h1 className="font-display text-xl font-bold">403 — Unauthorized Account</h1>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            You are signed in as <span className="font-mono font-semibold">{user.email}</span>, which is not authorized to modify Omkar Sathe&apos;s portfolio.
          </p>
          {authError && (
            <p className="text-xs text-rose-600 dark:text-rose-400">{authError}</p>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={logout}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-slate-900 dark:bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
            >
              <LogOut className="h-4 w-4" />
              Sign Out & Switch Account
            </button>
            <Link
              to="/"
              className="inline-flex min-h-[40px] items-center rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200"
            >
              Return Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6 py-10 space-y-8">
      {/* Top Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
            <span>Verified Admin · {user.email}</span>
          </div>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50">
            Portfolio Admin Dashboard
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            disabled={busy}
            onClick={() => handleSeedDefaults(false)}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50"
          >
            <Database className="h-3.5 w-3.5" />
            Sync Defaults to Firestore
          </button>

          <Link
            to="/"
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            View Live Site
          </Link>

          <button
            type="button"
            onClick={logout}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-slate-900 dark:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-700"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </div>

      {notice && (
        <div
          role="status"
          className={`rounded-xl border p-4 text-sm flex items-center gap-2.5 ${
            notice.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200'
              : 'border-rose-500/30 bg-rose-500/10 text-rose-800 dark:text-rose-200'
          }`}
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{notice.text}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-1.5 p-1.5 rounded-xl bg-slate-200/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setActiveTab(tab.id);
              setConfirmDeleteId(null);
            }}
            className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === tab.id
                ? 'bg-white dark:bg-blue-600 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
            {tab.id === 'messages' && messages.filter((m) => m.status === 'unread').length > 0
              ? ` (${messages.filter((m) => m.status === 'unread').length})`
              : ''}
          </button>
        ))}
      </div>

      {/* TAB 1: PROFILE & ABOUT */}
      {activeTab === 'profile' && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            try {
              await saveProfile(profileForm);
              showSuccess('Profile and About Me details saved to Firestore.');
            } catch (err) {
              showError(err);
            } finally {
              setBusy(false);
            }
          }}
          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1424] p-6 sm:p-8 space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-4">
              <img
                src={profileForm.avatarUrl || '/src/assets/images/omkar_portrait_1794833302772.jpg'}
                alt="Profile avatar preview"
                referrerPolicy="no-referrer"
                className="h-16 w-16 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
              />
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Profile Photograph
                </div>
                <label className="mt-1.5 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <Upload className="h-3.5 w-3.5" />
                  Upload New Photo
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setBusy(true);
                      try {
                        const uploaded = await uploadPortfolioAsset(file, 'avatars');
                        const next = { ...profileForm, avatarUrl: uploaded.url };
                        setProfileForm(next);
                        await saveProfile(next);
                        showSuccess('Profile photo uploaded and saved.');
                      } catch (err) {
                        showError(err);
                      } finally {
                        setBusy(false);
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="inline-flex min-h-[42px] items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              Save Profile
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Full Name" value={profileForm.name} onChange={(v) => setProfileForm({ ...profileForm, name: v })} />
            <Field label="Professional Title" value={profileForm.title} onChange={(v) => setProfileForm({ ...profileForm, title: v })} />
            <Field label="Education Summary" value={profileForm.educationSummary} onChange={(v) => setProfileForm({ ...profileForm, educationSummary: v })} />
            <Field label="Availability Status" value={profileForm.availabilityStatus} onChange={(v) => setProfileForm({ ...profileForm, availabilityStatus: v })} />
            <Field label="Location" value={profileForm.location} onChange={(v) => setProfileForm({ ...profileForm, location: v })} />
            <Field label="Contact Email" value={profileForm.email} onChange={(v) => setProfileForm({ ...profileForm, email: v })} />
            <Field label="GitHub Profile URL" value={profileForm.githubUrl} onChange={(v) => setProfileForm({ ...profileForm, githubUrl: v })} placeholder="https://github.com/username" />
            <Field label="GitHub Username (for live repo feed)" value={profileForm.githubUsername} onChange={(v) => setProfileForm({ ...profileForm, githubUsername: v })} placeholder="e.g. omkarsathe" />
            <Field label="LinkedIn Profile URL" value={profileForm.linkedinUrl} onChange={(v) => setProfileForm({ ...profileForm, linkedinUrl: v })} placeholder="https://linkedin.com/in/username" />
            <Field label="Career Goal" value={profileForm.careerGoal} onChange={(v) => setProfileForm({ ...profileForm, careerGoal: v })} />
          </div>

          <TextAreaField label="Hero Headline" rows={2} value={profileForm.headline} onChange={(v) => setProfileForm({ ...profileForm, headline: v })} />
          <TextAreaField label="Professional Introduction (Bio)" rows={3} value={profileForm.bio} onChange={(v) => setProfileForm({ ...profileForm, bio: v })} />
          <TextAreaField label="College / Institution" rows={2} value={profileForm.college} onChange={(v) => setProfileForm({ ...profileForm, college: v })} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <TextAreaField label="About: Educational Background" rows={3} value={profileForm.aboutEducation} onChange={(v) => setProfileForm({ ...profileForm, aboutEducation: v })} />
            <TextAreaField label="About: Technical Interests" rows={3} value={profileForm.aboutInterests} onChange={(v) => setProfileForm({ ...profileForm, aboutInterests: v })} />
            <TextAreaField label="About: Career Objectives" rows={3} value={profileForm.aboutObjectives} onChange={(v) => setProfileForm({ ...profileForm, aboutObjectives: v })} />
            <TextAreaField label="About: Problem-Solving Approach" rows={3} value={profileForm.aboutProblemSolving} onChange={(v) => setProfileForm({ ...profileForm, aboutProblemSolving: v })} />
          </div>
          <TextAreaField label="About: Interest in AI & Software Engineering" rows={3} value={profileForm.aboutAiApproach} onChange={(v) => setProfileForm({ ...profileForm, aboutAiApproach: v })} />
        </form>
      )}

      {/* TAB 2: PROJECTS */}
      {activeTab === 'projects' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-100">
              Manage Projects ({data.projects.length})
            </h2>
            <button
              type="button"
              onClick={() => {
                const newProj: ProjectItem = {
                  id: `proj_${Date.now()}`,
                  title: '',
                  slug: `project-${Date.now()}`,
                  category: 'Full-Stack',
                  summary: '',
                  description: '',
                  features: [],
                  technologies: [],
                  imageUrl: '',
                  githubUrl: '',
                  liveUrl: '',
                  featured: true,
                  sortOrder: data.projects.length + 1,
                  status: 'In Progress',
                };
                setEditingProject(newProj);
                setFeaturesText('');
                setTechText('');
              }}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500"
            >
              <Plus className="h-4 w-4" />
              Add Project
            </button>
          </div>

          {editingProject && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setBusy(true);
                try {
                  const cleanSlug =
                    editingProject.slug
                      .toLowerCase()
                      .replace(/[^a-z0-9-]+/g, '-')
                      .replace(/^-|-$/g, '') || `project-${Date.now()}`;
                  await saveProject({
                    ...editingProject,
                    slug: cleanSlug,
                    features: featuresText
                      .split('\n')
                      .map((s) => s.trim())
                      .filter(Boolean)
                      .slice(0, 12),
                    technologies: techText
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean)
                      .slice(0, 20),
                  });
                  setEditingProject(null);
                  showSuccess('Project saved to Firestore.');
                } catch (err) {
                  showError(err);
                } finally {
                  setBusy(false);
                }
              }}
              className="rounded-2xl border border-blue-500/40 bg-white dark:bg-[#0D1424] p-6 space-y-4"
            >
              <h3 className="font-display text-base font-bold text-slate-900 dark:text-slate-50">
                {editingProject.title ? `Edit: ${editingProject.title}` : 'New Project'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Title" value={editingProject.title} onChange={(v) => setEditingProject({ ...editingProject, title: v })} required />
                <Field label="URL Slug" value={editingProject.slug} onChange={(v) => setEditingProject({ ...editingProject, slug: v })} required />
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={editingProject.category}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        category: e.target.value as ProjectCategory,
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#070B14] px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                  >
                    {(['AI & ML', 'Full-Stack', 'Automation', 'Backend', 'Frontend'] as ProjectCategory[]).map(
                      (c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ),
                    )}
                  </select>
                </div>
                <Field label="Status Label" value={editingProject.status} onChange={(v) => setEditingProject({ ...editingProject, status: v })} />
                <Field label="GitHub URL" value={editingProject.githubUrl} onChange={(v) => setEditingProject({ ...editingProject, githubUrl: v })} placeholder="https://github.com/..." />
                <Field label="Live Demo URL" value={editingProject.liveUrl} onChange={(v) => setEditingProject({ ...editingProject, liveUrl: v })} placeholder="https://..." />
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[240px]">
                  <Field label="Image URL" value={editingProject.imageUrl} onChange={(v) => setEditingProject({ ...editingProject, imageUrl: v })} />
                </div>
                <label className="mt-5 inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <Upload className="h-3.5 w-3.5" />
                  Upload Screenshot
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setBusy(true);
                      try {
                        const up = await uploadPortfolioAsset(file, 'projects');
                        setEditingProject({ ...editingProject, imageUrl: up.url });
                        showSuccess('Project image uploaded. Click Save Project to apply.');
                      } catch (err) {
                        showError(err);
                      } finally {
                        setBusy(false);
                      }
                    }}
                  />
                </label>
              </div>

              <TextAreaField label="Short Card Summary" rows={2} value={editingProject.summary} onChange={(v) => setEditingProject({ ...editingProject, summary: v })} />
              <TextAreaField label="Full Description" rows={3} value={editingProject.description} onChange={(v) => setEditingProject({ ...editingProject, description: v })} />
              <TextAreaField label="Features (one per line, max 12)" rows={4} value={featuresText} onChange={setFeaturesText} />
              <Field label="Technologies (comma-separated, max 20)" value={techText} onChange={setTechText} />

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={busy}
                  className="inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500"
                >
                  <Save className="h-3.5 w-3.5" />
                  Save Project
                </button>
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="inline-flex min-h-[40px] items-center rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.projects.map((p) => (
              <div
                key={p.id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1424] p-5 flex items-start justify-between gap-4"
              >
                <div>
                  <div className="text-xs text-blue-600 dark:text-cyan-400 font-semibold">
                    {p.category} · #{p.sortOrder}
                  </div>
                  <div className="font-display text-base font-bold text-slate-900 dark:text-slate-50">
                    {p.title}
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {p.description}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProject(p);
                      setFeaturesText(p.features.join('\n'));
                      setTechText(p.technologies.join(', '));
                    }}
                    className="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Edit
                  </button>
                  {confirmDeleteId === p.id ? (
                    <button
                      type="button"
                      onClick={async () => {
                        setBusy(true);
                        try {
                          await deleteProject(p.id);
                          setConfirmDeleteId(null);
                          showSuccess('Project deleted.');
                        } catch (err) {
                          showError(err);
                        } finally {
                          setBusy(false);
                        }
                      }}
                      className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      Confirm
                    </button>
                  ) : (
                    <button
                      type="button"
                      aria-label={`Delete ${p.title}`}
                      onClick={() => setConfirmDeleteId(p.id)}
                      className="rounded-lg border border-rose-300 dark:border-rose-800 p-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SKILLS */}
      {activeTab === 'skills' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-100">
              Manage Skills ({data.skills.length})
            </h2>
            <button
              type="button"
              onClick={() =>
                setEditingSkill({
                  id: `skill_${Date.now()}`,
                  name: '',
                  category: 'Programming',
                  context: '',
                  sortOrder: data.skills.length + 1,
                })
              }
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500"
            >
              <Plus className="h-4 w-4" />
              Add Skill
            </button>
          </div>

          {editingSkill && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setBusy(true);
                try {
                  await saveSkill(editingSkill);
                  setEditingSkill(null);
                  showSuccess('Skill saved.');
                } catch (err) {
                  showError(err);
                } finally {
                  setBusy(false);
                }
              }}
              className="rounded-2xl border border-blue-500/40 bg-white dark:bg-[#0D1424] p-6 space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Skill Name" value={editingSkill.name} onChange={(v) => setEditingSkill({ ...editingSkill, name: v })} required />
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={editingSkill.category}
                    onChange={(e) =>
                      setEditingSkill({ ...editingSkill, category: e.target.value as SkillCategory })
                    }
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#070B14] px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                  >
                    {SKILL_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <Field label="Practical Usage Context" value={editingSkill.context} onChange={(v) => setEditingSkill({ ...editingSkill, context: v })} placeholder="e.g. Used in Buddy Elder AI" />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={busy} className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white">
                  Save Skill
                </button>
                <button type="button" onClick={() => setEditingSkill(null)} className="rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs">
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.skills.map((s) => (
              <div
                key={s.id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1424] p-4 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="text-xs text-blue-600 dark:text-cyan-400 font-medium">{s.category}</div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{s.name}</div>
                  {s.context && <div className="text-xs text-slate-500 truncate">{s.context}</div>}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setEditingSkill(s)}
                    className="rounded-md border border-slate-300 dark:border-slate-700 px-2.5 py-1 text-xs font-medium"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${s.name}`}
                    onClick={async () => {
                      setBusy(true);
                      try {
                        await deleteSkill(s.id);
                        showSuccess('Skill deleted.');
                      } catch (err) {
                        showError(err);
                      } finally {
                        setBusy(false);
                      }
                    }}
                    className="rounded-md border border-rose-300 dark:border-rose-800 p-1 text-rose-600 dark:text-rose-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: EXPERIENCE */}
      {activeTab === 'experience' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-100">
              Experience & Internships ({data.experiences.length})
            </h2>
            <button
              type="button"
              onClick={() => {
                setEditingExp({
                  id: `exp_${Date.now()}`,
                  role: '',
                  organization: '',
                  category: 'Internship',
                  period: '',
                  location: 'Pune, India',
                  description: '',
                  highlights: [],
                  verifiedStatus: 'Verified Experience',
                  sortOrder: data.experiences.length + 1,
                });
                setExpHighlightsText('');
              }}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white"
            >
              <Plus className="h-4 w-4" />
              Add Experience
            </button>
          </div>

          {editingExp && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setBusy(true);
                try {
                  await saveExperience({
                    ...editingExp,
                    highlights: expHighlightsText.split('\n').map((s) => s.trim()).filter(Boolean).slice(0, 10),
                  });
                  setEditingExp(null);
                  showSuccess('Experience saved.');
                } catch (err) {
                  showError(err);
                } finally {
                  setBusy(false);
                }
              }}
              className="rounded-2xl border border-blue-500/40 bg-white dark:bg-[#0D1424] p-6 space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Role" value={editingExp.role} onChange={(v) => setEditingExp({ ...editingExp, role: v })} required />
                <Field label="Organization" value={editingExp.organization} onChange={(v) => setEditingExp({ ...editingExp, organization: v })} required />
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select
                    value={editingExp.category}
                    onChange={(e) => setEditingExp({ ...editingExp, category: e.target.value as ExperienceCategory })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#070B14] px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                  >
                    {(['Internship', 'Software Development', 'AI Engineering', 'Automation Testing', 'Hackathons & Events'] as ExperienceCategory[]).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <Field label="Period" value={editingExp.period} onChange={(v) => setEditingExp({ ...editingExp, period: v })} required />
                <Field label="Location" value={editingExp.location} onChange={(v) => setEditingExp({ ...editingExp, location: v })} />
                <Field label="Verification / Track Status" value={editingExp.verifiedStatus} onChange={(v) => setEditingExp({ ...editingExp, verifiedStatus: v })} required />
              </div>
              <TextAreaField label="Description" rows={3} value={editingExp.description} onChange={(v) => setEditingExp({ ...editingExp, description: v })} />
              <TextAreaField label="Highlights (one per line)" rows={3} value={expHighlightsText} onChange={setExpHighlightsText} />
              <div className="flex gap-3">
                <button type="submit" disabled={busy} className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white">Save Experience</button>
                <button type="button" onClick={() => setEditingExp(null)} className="rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs">Cancel</button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {data.experiences.map((exp) => (
              <div key={exp.id} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1424] p-5 flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs text-blue-600 dark:text-cyan-400 font-semibold">{exp.category} · {exp.period}</div>
                  <div className="font-display text-base font-bold text-slate-900 dark:text-slate-50">{exp.role}</div>
                  <div className="text-xs text-slate-500">{exp.organization}</div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingExp(exp);
                      setExpHighlightsText(exp.highlights.join('\n'));
                    }}
                    className="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${exp.role}`}
                    onClick={async () => {
                      setBusy(true);
                      try {
                        await deleteExperience(exp.id);
                        showSuccess('Experience deleted.');
                      } catch (err) {
                        showError(err);
                      } finally {
                        setBusy(false);
                      }
                    }}
                    className="rounded-lg border border-rose-300 dark:border-rose-800 p-1.5 text-rose-600 dark:text-rose-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: EDUCATION */}
      {activeTab === 'education' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-100">
              Education Timeline ({data.education.length})
            </h2>
            <button
              type="button"
              onClick={() => {
                setEditingEdu({
                  id: `edu_${Date.now()}`,
                  degree: '',
                  yearLabel: '',
                  institution: '',
                  period: '',
                  location: 'Pune, Maharashtra',
                  description: '',
                  coursework: [],
                  sortOrder: data.education.length + 1,
                });
                setEduCourseworkText('');
              }}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white"
            >
              <Plus className="h-4 w-4" />
              Add Education
            </button>
          </div>

          {editingEdu && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setBusy(true);
                try {
                  await saveEducation({
                    ...editingEdu,
                    coursework: eduCourseworkText.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 15),
                  });
                  setEditingEdu(null);
                  showSuccess('Education saved.');
                } catch (err) {
                  showError(err);
                } finally {
                  setBusy(false);
                }
              }}
              className="rounded-2xl border border-blue-500/40 bg-white dark:bg-[#0D1424] p-6 space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Degree" value={editingEdu.degree} onChange={(v) => setEditingEdu({ ...editingEdu, degree: v })} required />
                <Field label="Year / Stage Label" value={editingEdu.yearLabel} onChange={(v) => setEditingEdu({ ...editingEdu, yearLabel: v })} />
                <Field label="Institution" value={editingEdu.institution} onChange={(v) => setEditingEdu({ ...editingEdu, institution: v })} required />
                <Field label="Period" value={editingEdu.period} onChange={(v) => setEditingEdu({ ...editingEdu, period: v })} required />
                <Field label="Location" value={editingEdu.location} onChange={(v) => setEditingEdu({ ...editingEdu, location: v })} />
              </div>
              <TextAreaField label="Description" rows={3} value={editingEdu.description} onChange={(v) => setEditingEdu({ ...editingEdu, description: v })} />
              <Field label="Coursework (comma-separated)" value={eduCourseworkText} onChange={setEduCourseworkText} />
              <div className="flex gap-3">
                <button type="submit" disabled={busy} className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white">Save Education</button>
                <button type="button" onClick={() => setEditingEdu(null)} className="rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs">Cancel</button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {data.education.map((edu) => (
              <div key={edu.id} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1424] p-5 flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs text-blue-600 dark:text-cyan-400 font-semibold">{edu.yearLabel} · {edu.period}</div>
                  <div className="font-display text-base font-bold text-slate-900 dark:text-slate-50">{edu.degree}</div>
                  <div className="text-xs text-slate-500">{edu.institution}</div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingEdu(edu);
                      setEduCourseworkText(edu.coursework.join(', '));
                    }}
                    className="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${edu.degree}`}
                    onClick={async () => {
                      setBusy(true);
                      try {
                        await deleteEducation(edu.id);
                        showSuccess('Education deleted.');
                      } catch (err) {
                        showError(err);
                      } finally {
                        setBusy(false);
                      }
                    }}
                    className="rounded-lg border border-rose-300 dark:border-rose-800 p-1.5 text-rose-600 dark:text-rose-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: CERTIFICATIONS */}
      {activeTab === 'certifications' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-100">
              Certifications ({data.certifications.length})
            </h2>
            <button
              type="button"
              onClick={() =>
                setEditingCert({
                  id: `cert_${Date.now()}`,
                  title: '',
                  issuer: '',
                  issueDate: '',
                  credentialUrl: '',
                  certificateFileUrl: '',
                  certificateFileName: '',
                  certificateFileType: '',
                  description: '',
                  sortOrder: data.certifications.length + 1,
                })
              }
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white"
            >
              <Plus className="h-4 w-4" />
              Add Certification
            </button>
          </div>

          {editingCert && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setBusy(true);
                try {
                  await saveCertification(editingCert);
                  setEditingCert(null);
                  showSuccess('Certification saved.');
                } catch (err) {
                  showError(err);
                } finally {
                  setBusy(false);
                }
              }}
              className="rounded-2xl border border-blue-500/40 bg-white dark:bg-[#0D1424] p-6 space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Certification Title" value={editingCert.title} onChange={(v) => setEditingCert({ ...editingCert, title: v })} required />
                <Field label="Issuer" value={editingCert.issuer} onChange={(v) => setEditingCert({ ...editingCert, issuer: v })} required />
                <Field label="Issue Date" value={editingCert.issueDate} onChange={(v) => setEditingCert({ ...editingCert, issueDate: v })} required />
                <Field label="Credential Verification URL" value={editingCert.credentialUrl} onChange={(v) => setEditingCert({ ...editingCert, credentialUrl: v })} />
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <Upload className="h-3.5 w-3.5" />
                  Upload Certificate (PDF or Image)
                  <input
                    type="file"
                    accept="application/pdf,image/*"
                    className="sr-only"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setBusy(true);
                      try {
                        const up = await uploadPortfolioAsset(file, 'certificates');
                        setEditingCert({
                          ...editingCert,
                          certificateFileUrl: up.url,
                          certificateFileName: up.fileName,
                          certificateFileType: file.type || 'application/octet-stream',
                        });
                        showSuccess('Certificate file uploaded. Click Save Certification to apply.');
                      } catch (err) {
                        showError(err);
                      } finally {
                        setBusy(false);
                      }
                    }}
                  />
                </label>
                {editingCert.certificateFileName && (
                  <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400">
                    Attached: {editingCert.certificateFileName}
                  </span>
                )}
              </div>

              <TextAreaField label="Description" rows={3} value={editingCert.description} onChange={(v) => setEditingCert({ ...editingCert, description: v })} />
              <div className="flex gap-3">
                <button type="submit" disabled={busy} className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white">Save Certification</button>
                <button type="button" onClick={() => setEditingCert(null)} className="rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs">Cancel</button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {data.certifications.map((c) => (
              <div key={c.id} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1424] p-5 flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs text-blue-600 dark:text-cyan-400 font-semibold">{c.issuer} · {c.issueDate}</div>
                  <div className="font-display text-base font-bold text-slate-900 dark:text-slate-50">{c.title}</div>
                  <div className="text-xs text-slate-500">
                    {c.certificateFileName ? `File: ${c.certificateFileName}` : 'No certificate file attached yet'}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button type="button" onClick={() => setEditingCert(c)} className="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold">Edit</button>
                  <button
                    type="button"
                    aria-label={`Delete ${c.title}`}
                    onClick={async () => {
                      setBusy(true);
                      try {
                        await deleteCertification(c.id);
                        showSuccess('Certification deleted.');
                      } catch (err) {
                        showError(err);
                      } finally {
                        setBusy(false);
                      }
                    }}
                    className="rounded-lg border border-rose-300 dark:border-rose-800 p-1.5 text-rose-600 dark:text-rose-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: ACHIEVEMENTS */}
      {activeTab === 'achievements' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-100">
              Achievements ({data.achievements.length})
            </h2>
            <button
              type="button"
              onClick={() =>
                setEditingAch({
                  id: `ach_${Date.now()}`,
                  title: '',
                  category: 'Leadership',
                  period: '',
                  description: '',
                  sortOrder: data.achievements.length + 1,
                })
              }
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white"
            >
              <Plus className="h-4 w-4" />
              Add Achievement
            </button>
          </div>

          {editingAch && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setBusy(true);
                try {
                  await saveAchievement(editingAch);
                  setEditingAch(null);
                  showSuccess('Achievement saved.');
                } catch (err) {
                  showError(err);
                } finally {
                  setBusy(false);
                }
              }}
              className="rounded-2xl border border-blue-500/40 bg-white dark:bg-[#0D1424] p-6 space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Title" value={editingAch.title} onChange={(v) => setEditingAch({ ...editingAch, title: v })} required />
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select
                    value={editingAch.category}
                    onChange={(e) => setEditingAch({ ...editingAch, category: e.target.value as AchievementCategory })}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#070B14] px-3 py-2 text-sm text-slate-900 dark:text-slate-100"
                  >
                    {(['Leadership', 'Sports', 'Strategy & Chess', 'Hackathon', 'Technical'] as AchievementCategory[]).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <Field label="Period" value={editingAch.period} onChange={(v) => setEditingAch({ ...editingAch, period: v })} required />
              </div>
              <TextAreaField label="Description" rows={3} value={editingAch.description} onChange={(v) => setEditingAch({ ...editingAch, description: v })} />
              <div className="flex gap-3">
                <button type="submit" disabled={busy} className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white">Save Achievement</button>
                <button type="button" onClick={() => setEditingAch(null)} className="rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs">Cancel</button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {data.achievements.map((ach) => (
              <div key={ach.id} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1424] p-5 flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs text-blue-600 dark:text-cyan-400 font-semibold">{ach.category} · {ach.period}</div>
                  <div className="font-display text-base font-bold text-slate-900 dark:text-slate-50">{ach.title}</div>
                  <p className="mt-1 text-xs text-slate-500">{ach.description}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button type="button" onClick={() => setEditingAch(ach)} className="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold">Edit</button>
                  <button
                    type="button"
                    aria-label={`Delete ${ach.title}`}
                    onClick={async () => {
                      setBusy(true);
                      try {
                        await deleteAchievement(ach.id);
                        showSuccess('Achievement deleted.');
                      } catch (err) {
                        showError(err);
                      } finally {
                        setBusy(false);
                      }
                    }}
                    className="rounded-lg border border-rose-300 dark:border-rose-800 p-1.5 text-rose-600 dark:text-rose-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: RESUME PDF */}
      {activeTab === 'resume' && (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1424] p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-slate-50">
              Upload or Replace Custom Resume PDF
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              When a custom PDF is uploaded, the portfolio&apos;s Download Resume button serves your exact PDF file. Otherwise, it dynamically generates a formatted PDF from your live profile.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500">
              <Upload className="h-4 w-4" />
              Upload Resume PDF
              <input
                type="file"
                accept="application/pdf"
                className="sr-only"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setBusy(true);
                  try {
                    const up = await uploadPortfolioAsset(file, 'resume');
                    await saveResumeMeta({
                      fileName: up.fileName,
                      fileUrl: up.url,
                      mimeType: file.type || 'application/pdf',
                      fileSizeBytes: file.size,
                      summaryNote: 'Custom uploaded PDF resume active.',
                    });
                    showSuccess('Custom PDF resume uploaded and published.');
                  } catch (err) {
                    showError(err);
                  } finally {
                    setBusy(false);
                  }
                }}
              />
            </label>

            {data.resumeMeta.fileUrl && (
              <button
                type="button"
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    await saveResumeMeta({
                      fileName: '',
                      fileUrl: '',
                      mimeType: 'application/pdf',
                      fileSizeBytes: 0,
                      summaryNote: 'Auto-generated PDF from live portfolio data.',
                    });
                    showSuccess('Reverted to dynamic generated PDF resume.');
                  } catch (err) {
                    showError(err);
                  } finally {
                    setBusy(false);
                  }
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200"
              >
                Clear Custom PDF
              </button>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex items-center gap-3">
            <FileText className="h-5 w-5 text-blue-600 dark:text-cyan-400 shrink-0" />
            <div className="text-sm">
              <div className="font-semibold text-slate-900 dark:text-slate-100">
                {data.resumeMeta.fileUrl
                  ? `Active Custom File: ${data.resumeMeta.fileName}`
                  : 'Mode: Auto-generated PDF from live portfolio sections'}
              </div>
              {data.resumeMeta.fileUrl && (
                <a
                  href={data.resumeMeta.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 dark:text-cyan-400 hover:underline"
                >
                  Open uploaded PDF
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 9: CONTACT MESSAGES INBOX */}
      {activeTab === 'messages' && (
        <div className="space-y-4">
          <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-100">
            Contact Inbox ({messages.length})
          </h2>

          {messages.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1424] p-10 text-center text-sm text-slate-500">
              No contact inquiries received yet.
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1424] p-6 space-y-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-medium">
                        <Mail className="h-3.5 w-3.5 text-blue-600 dark:text-cyan-400" />
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{msg.name}</span>
                        <span className="text-slate-500">({msg.email})</span>
                        <span aria-hidden="true">·</span>
                        <span className="uppercase font-mono text-blue-600 dark:text-cyan-400">
                          {msg.status}
                        </span>
                      </div>
                      <h3 className="mt-1 font-display text-base font-bold text-slate-900 dark:text-slate-50">
                        {msg.subject}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={msg.status}
                        aria-label="Update message status"
                        onChange={async (e) => {
                          try {
                            await updateContactMessageStatus(
                              msg.id,
                              e.target.value as 'unread' | 'read' | 'replied',
                            );
                            showSuccess('Message status updated.');
                          } catch (err) {
                            showError(err);
                          }
                        }}
                        className="rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#070B14] px-2.5 py-1 text-xs"
                      >
                        <option value="unread">Unread</option>
                        <option value="read">Read</option>
                        <option value="replied">Replied</option>
                      </select>

                      <button
                        type="button"
                        aria-label="Delete message"
                        onClick={async () => {
                          try {
                            await deleteContactMessage(msg.id);
                            showSuccess('Message deleted.');
                          } catch (err) {
                            showError(err);
                          }
                        }}
                        className="rounded-lg border border-rose-300 dark:border-rose-800 p-1.5 text-rose-600 dark:text-rose-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                    {msg.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
        {label}
      </label>
      <input
        type="text"
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#070B14] px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
      />
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  rows,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  rows: number;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
        {label}
      </label>
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#070B14] px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:outline-none"
      />
    </div>
  );
}
