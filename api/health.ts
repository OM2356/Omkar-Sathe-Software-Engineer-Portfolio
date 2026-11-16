import type { IncomingMessage, ServerResponse } from 'node:http';

export default function handler(_req: IncomingMessage, res: ServerResponse): void {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(
    JSON.stringify({
      status: 'ok',
      smtpConfigured: Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS),
      githubTokenConfigured: Boolean(process.env.GITHUB_TOKEN),
      githubUsernameConfigured: Boolean(process.env.GITHUB_USERNAME),
    }),
  );
}
