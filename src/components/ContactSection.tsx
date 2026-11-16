import { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Github,
  Linkedin,
  Loader2,
  Mail,
  Send,
  Share2,
  X,
} from 'lucide-react';
import { submitContactInquiry } from '../lib/portfolioService';
import type { PortfolioProfile } from '../types/portfolio';

interface ContactSectionProps {
  profile: PortfolioProfile;
}

interface FieldErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

export function ContactSection({ profile }: ContactSectionProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    type: 'success' | 'info' | 'error';
    title: string;
    detail: string;
  } | null>(null);
  const [shareCopied, setShareCopied] = useState(false);

  const validate = (): FieldErrors => {
    const next: FieldErrors = {};
    const n = name.trim();
    const em = email.trim();
    const sub = subject.trim();
    const msg = message.trim();

    if (n.length < 2 || n.length > 120) {
      next.name = 'Please enter your name (2–120 characters).';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em) || em.length > 160) {
      next.email = 'Please enter a valid email address.';
    }
    if (sub.length < 2 || sub.length > 200) {
      next.subject = 'Please enter a subject (2–200 characters).';
    }
    if (msg.length < 10 || msg.length > 4000) {
      next.message = 'Please write a message between 10 and 4000 characters.';
    }
    return next;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitResult(null);
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const res = await submitContactInquiry({
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
      });

      if (res.emailSent) {
        setSubmitResult({
          type: 'success',
          title: 'Message sent successfully',
          detail: res.savedToFirestore
            ? 'Your inquiry was delivered directly to Omkar via Gmail SMTP and archived in the portfolio inbox.'
            : 'Your inquiry was delivered directly to Omkar via Gmail SMTP.',
        });
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
      } else if (res.serverError) {
        setSubmitResult({
          type: 'error',
          title: res.savedToFirestore
            ? 'Saved to Inbox — Email Delivery Failed'
            : 'Email Delivery Failed',
          detail: res.savedToFirestore
            ? `${res.serverError} Your inquiry was still saved to the portfolio inbox.`
            : res.serverError,
        });
        if (res.savedToFirestore) {
          setName('');
          setEmail('');
          setSubject('');
          setMessage('');
        }
      } else if (res.savedToFirestore) {
        setSubmitResult({
          type: 'info',
          title: 'Saved to Portfolio Inbox',
          detail:
            res.serverMessage ||
            'Your message is stored in Firestore for Omkar to review in /admin. Configure Gmail SMTP credentials in .env to enable direct email forwarding.',
        });
        setName('');
        setEmail('');
        setSubject('');
        setMessage('');
      } else {
        setSubmitResult({
          type: 'error',
          title: 'Delivery incomplete',
          detail: res.serverMessage || 'Unable to store or forward your message.',
        });
      }
    } catch (err) {
      setSubmitResult({
        type: 'error',
        title: 'Submission failed',
        detail: err instanceof Error ? err.message : 'Unable to submit your inquiry.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `${profile.name} — Software Engineer Portfolio`,
      text: profile.headline,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2500);
      }
    } catch {
      // user cancelled share
    }
  };

  return (
    <section id="contact" className="py-20 sm:py-24 border-t border-slate-200 dark:border-slate-800/80">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          <div className="lg:col-span-5 space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-cyan-400">
                Get In Touch
              </p>
              <h2 className="mt-2 font-display text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
                Contact & Opportunities
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300">
                Interested in discussing Software Development Engineer internships, collaborative builds, or AI engineering projects? Send a direct message below.
              </p>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-blue-600 dark:text-cyan-400 shrink-0" />
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Email</div>
                  {profile.email ? (
                    <a
                      href={`mailto:${profile.email}`}
                      className="font-medium text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-cyan-400"
                    >
                      {profile.email}
                    </a>
                  ) : (
                    <span className="text-slate-500">Professional email editable in Admin</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <Github className="h-4 w-4 text-blue-600 dark:text-cyan-400 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs text-slate-500 dark:text-slate-400">GitHub</div>
                  <a
                    href={profile.githubUrl || 'https://github.com/OM2356'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-cyan-400 break-all"
                  >
                    {profile.githubUrl || 'https://github.com/OM2356'}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <Linkedin className="h-4 w-4 text-blue-600 dark:text-cyan-400 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs text-slate-500 dark:text-slate-400">LinkedIn</div>
                  <a
                    href={profile.linkedinUrl || 'https://www.linkedin.com/in/omkar-sathe-1173b3319/'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-cyan-400 break-all"
                  >
                    {profile.linkedinUrl || 'https://www.linkedin.com/in/omkar-sathe-1173b3319/'}
                  </a>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href={profile.githubUrl || 'https://github.com/OM2356'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0D1424] px-3.5 py-2 text-xs font-semibold text-slate-900 dark:text-slate-100 hover:border-blue-500/60 dark:hover:border-cyan-400/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 hover:-translate-y-0.5 whitespace-nowrap shrink-0"
              >
                <Github className="h-3.5 w-3.5" />
                View GitHub Profile
              </a>

              <a
                href={profile.linkedinUrl || 'https://www.linkedin.com/in/omkar-sathe-1173b3319/'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-blue-500/40 bg-blue-50/70 dark:bg-blue-950/35 px-3.5 py-2 text-xs font-semibold text-blue-700 dark:text-cyan-300 hover:border-blue-500 dark:hover:border-cyan-400 hover:bg-blue-100/80 dark:hover:bg-blue-900/45 transition-all duration-200 hover:-translate-y-0.5 whitespace-nowrap shrink-0"
              >
                <Linkedin className="h-3.5 w-3.5" />
                Connect on LinkedIn
              </a>

              <button
                type="button"
                onClick={handleShare}
                className="inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
              >
                <Share2 className="h-3.5 w-3.5" />
                {shareCopied ? 'Link Copied' : 'Share'}
              </button>
            </div>
          </div>

          <div className="lg:col-span-7">
            <form
              onSubmit={handleSubmit}
              noValidate
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1424] p-6 sm:p-8 space-y-5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    Name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    value={name}
                    disabled={submitting}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                    }}
                    placeholder="Recruiter or collaborator name"
                    aria-invalid={Boolean(errors.name)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#070B14] px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none disabled:opacity-60"
                  />
                  {errors.name && (
                    <p role="alert" className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                  >
                    Email
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    value={email}
                    disabled={submitting}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    placeholder="you@company.com"
                    aria-invalid={Boolean(errors.email)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#070B14] px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none disabled:opacity-60"
                  />
                  {errors.email && (
                    <p role="alert" className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="contact-subject"
                  className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
                >
                  Subject
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  value={subject}
                  disabled={submitting}
                  onChange={(e) => {
                    setSubject(e.target.value);
                    if (errors.subject) setErrors((prev) => ({ ...prev, subject: undefined }));
                  }}
                  placeholder="SDE Internship Opportunity / Project Collaboration"
                  aria-invalid={Boolean(errors.subject)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#070B14] px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none disabled:opacity-60"
                />
                {errors.subject && (
                  <p role="alert" className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                    {errors.subject}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="contact-message"
                    className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Message
                  </label>
                  <span className="font-mono text-[11px] tabular-nums text-slate-400">
                    {message.length}/4000
                  </span>
                </div>
                <textarea
                  id="contact-message"
                  rows={5}
                  value={message}
                  disabled={submitting}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    if (errors.message) setErrors((prev) => ({ ...prev, message: undefined }));
                  }}
                  placeholder="Share role details, timeline, or how we can work together..."
                  aria-invalid={Boolean(errors.message)}
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#070B14] px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none disabled:opacity-60"
                />
                {errors.message && (
                  <p role="alert" className="mt-1 text-xs text-rose-600 dark:text-rose-400">
                    {errors.message}
                  </p>
                )}
              </div>

              {submitResult && (
                <div
                  role="status"
                  aria-live="polite"
                  className={`rounded-xl border p-4 text-sm flex items-start justify-between gap-3 ${
                    submitResult.type === 'success'
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200'
                      : submitResult.type === 'info'
                        ? 'border-blue-500/30 bg-blue-500/10 text-blue-800 dark:text-cyan-200'
                        : 'border-rose-500/30 bg-rose-500/10 text-rose-800 dark:text-rose-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {submitResult.type === 'error' ? (
                      <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-semibold">{submitResult.title}</div>
                      <p className="mt-0.5 text-xs leading-relaxed opacity-90">{submitResult.detail}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSubmitResult(null)}
                    aria-label="Dismiss notification"
                    className="rounded-md p-1 opacity-70 hover:opacity-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Validated client & server-side · delivered via Gmail SMTP & Firestore.
                </p>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 transition-colors disabled:opacity-60 whitespace-nowrap shrink-0"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Message
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
