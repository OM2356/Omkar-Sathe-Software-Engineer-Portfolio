import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, GitFork, Github, RefreshCw, Star } from 'lucide-react';
import type { GitHubRepo } from '../types/portfolio';

interface GitHubShowcaseProps {
  username: string;
  githubUrl: string;
}

interface GitHubUserSummary {
  login: string;
  name: string | null;
  bio: string | null;
  publicRepos: number;
  followers: number;
  htmlUrl: string;
}

export function GitHubShowcase({ username, githubUrl }: GitHubShowcaseProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [configured, setConfigured] = useState<boolean>(Boolean(username.trim()));
  const [profile, setProfile] = useState<GitHubUserSummary | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);

  const cleanUsername = username.trim();

  const fetchRepos = async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = cleanUsername
        ? `/api/github/${encodeURIComponent(cleanUsername)}`
        : '/api/github';
      const res = await fetch(endpoint);
      const json = (await res.json()) as {
        configured?: boolean;
        profile?: GitHubUserSummary | null;
        repos?: GitHubRepo[];
        error?: string;
      };
      if (!res.ok) {
        throw new Error(json.error || 'Could not load GitHub repositories.');
      }
      if (json.configured === false || !json.profile) {
        setConfigured(false);
        setProfile(null);
        setRepos([]);
        return;
      }
      setConfigured(true);
      setProfile(json.profile);
      setRepos(Array.isArray(json.repos) ? json.repos : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'GitHub API request failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchRepos();
  }, [cleanUsername]);

  if (!configured && !loading && !error) {
    return (
      <div className="mt-12 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1424] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
            <Github className="h-4 w-4 text-blue-600 dark:text-cyan-400" />
            <span>Live GitHub Repository Feed</span>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
            Add your GitHub username in the Admin Dashboard (or set <code className="font-mono text-xs">GITHUB_USERNAME</code> &amp; <code className="font-mono text-xs">GITHUB_TOKEN</code> in backend environment variables) to automatically display your real public repositories.
          </p>
        </div>
        <Link
          to="/admin"
          className="inline-flex min-h-[40px] items-center justify-center rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
        >
          Configure in Admin
        </Link>
      </div>
    );
  }

  const displayHandle = profile?.login || cleanUsername;

  return (
    <div className="mt-12 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0D1424] p-6 sm:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
            <Github className="h-4 w-4 text-blue-600 dark:text-cyan-400" />
            <span>GitHub Activity{displayHandle ? ` · @${displayHandle}` : ''}</span>
          </div>
          {profile && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
              {profile.publicRepos} public repositories · {profile.followers} followers
            </p>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchRepos}
            disabled={loading}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          {(profile?.htmlUrl || githubUrl) && (
            <a
              href={profile?.htmlUrl || githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-slate-900 dark:bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 dark:hover:bg-blue-500 transition-colors"
            >
              Visit GitHub
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      </div>

      {loading && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Fetching public repositories from GitHub...
        </p>
      )}

      {error && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-700 dark:text-amber-300">
          {error}
        </div>
      )}

      {!loading && !error && repos.length === 0 && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No public repositories returned{displayHandle ? ` for @${displayHandle}` : ''}.
        </p>
      )}

      {!loading && !error && repos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {repos.map((repo) => (
            <a
              key={repo.id}
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col justify-between rounded-xl border border-slate-200 dark:border-slate-800 p-4 hover:border-blue-500/50 dark:hover:border-cyan-400/50 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-display text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-cyan-400 truncate">
                    {repo.name}
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-600 dark:text-slate-400 line-clamp-2">
                  {repo.description || 'Repository description not provided on GitHub.'}
                </p>
              </div>
              <div className="mt-4 flex items-center gap-3 text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                {repo.language && <span>{repo.language}</span>}
                <span className="inline-flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  {repo.stargazers_count}
                </span>
                <span className="inline-flex items-center gap-1">
                  <GitFork className="h-3 w-3" />
                  {repo.forks_count}
                </span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
