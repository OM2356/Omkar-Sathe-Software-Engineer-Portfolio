import type { IncomingMessage, ServerResponse } from 'node:http';

function sendJson(res: ServerResponse, statusCode: number, body: Record<string, unknown>): void {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method !== 'GET') {
    sendJson(res, 405, { error: 'Method not allowed. Use GET.' });
    return;
  }

  const parsedUrl = new URL(req.url || '/api/github', 'http://localhost');
  const queryUsername = parsedUrl.searchParams.get('username') || '';
  const username = (queryUsername || process.env.GITHUB_USERNAME || '').trim();

  if (!username) {
    sendJson(res, 200, {
      configured: false,
      profile: null,
      repos: [],
      message: 'No GitHub username configured.',
    });
    return;
  }

  if (!/^[a-zA-Z0-9-]{1,39}$/.test(username)) {
    sendJson(res, 400, { error: 'Invalid GitHub username format.' });
    return;
  }

  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'omkar-sathe-portfolio',
  };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, { headers }),
      fetch(
        `https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=9&type=owner`,
        { headers },
      ),
    ]);

    if (!userRes.ok) {
      sendJson(res, userRes.status, {
        error:
          userRes.status === 404
            ? `GitHub user "${username}" was not found.`
            : `GitHub API returned status ${userRes.status}.`,
      });
      return;
    }

    const userData = (await userRes.json()) as {
      login: string;
      name: string | null;
      bio: string | null;
      public_repos: number;
      followers: number;
      html_url: string;
      avatar_url: string;
    };
    const reposData = reposRes.ok ? await reposRes.json() : [];

    sendJson(res, 200, {
      configured: true,
      authenticatedWithToken: Boolean(process.env.GITHUB_TOKEN),
      profile: {
        login: userData.login,
        name: userData.name,
        bio: userData.bio,
        publicRepos: userData.public_repos,
        followers: userData.followers,
        htmlUrl: userData.html_url,
        avatarUrl: userData.avatar_url,
      },
      repos: Array.isArray(reposData) ? reposData.slice(0, 6) : [],
    });
  } catch (err) {
    console.error('GitHub API error:', err);
    sendJson(res, 502, { error: 'Unable to reach GitHub API right now.' });
  }
}
