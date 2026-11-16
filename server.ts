import 'dotenv/config';
import express, { type NextFunction, type Request, type Response } from 'express';
import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import { initializeApp as initializeAdminApp, getApps as getAdminApps } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';

const PORT = 3000;
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'omkarsathe3103@gmail.com').toLowerCase();

interface FirebaseAppletConfig {
  projectId?: string;
}

function loadFirebaseProjectId(): string | undefined {
  try {
    const configPath = path.resolve(process.cwd(), 'firebase-applet-config.json');
    if (fs.existsSync(configPath)) {
      const raw = fs.readFileSync(configPath, 'utf-8');
      const parsed = JSON.parse(raw) as FirebaseAppletConfig;
      return parsed.projectId;
    }
  } catch (err) {
    console.warn('Could not read firebase-applet-config.json:', err);
  }
  return process.env.FIREBASE_PROJECT_ID;
}

const projectId = loadFirebaseProjectId();
const adminApp =
  getAdminApps().length > 0
    ? getAdminApps()[0]
    : projectId
      ? initializeAdminApp({ projectId })
      : null;

interface AuthenticatedRequest extends Request {
  adminUser?: {
    uid: string;
    email: string;
  };
}

async function requireAdminAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  if (!adminApp) {
    res.status(503).json({
      error: 'Firebase Admin SDK is not initialized. Check firebase-applet-config.json.',
    });
    return;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing Bearer authentication token.' });
    return;
  }

  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) {
    res.status(401).json({ error: 'Empty authentication token.' });
    return;
  }

  try {
    const decoded = await getAdminAuth(adminApp).verifyIdToken(token);
    const email = (decoded.email || '').toLowerCase();
    if (!decoded.email_verified || email !== ADMIN_EMAIL) {
      res.status(403).json({
        error: 'Forbidden: Only the verified portfolio owner can perform administrative actions.',
      });
      return;
    }
    req.adminUser = { uid: decoded.uid, email };
    next();
  } catch (err) {
    console.error('Token verification failed:', err);
    res.status(401).json({ error: 'Invalid or expired authentication token.' });
  }
}

async function startServer(): Promise<void> {
  const app = express();
  app.use(express.json({ limit: '8mb' }));

  const uploadsDir = path.resolve(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/uploads', express.static(uploadsDir));

  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      firebaseProjectConfigured: Boolean(projectId),
      smtpConfigured: Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS),
      githubTokenConfigured: Boolean(process.env.GITHUB_TOKEN),
      githubUsernameConfigured: Boolean(process.env.GITHUB_USERNAME),
    });
  });

  app.post('/api/admin/verify', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
    res.json({
      authorized: true,
      email: req.adminUser?.email,
      uid: req.adminUser?.uid,
    });
  });

  app.post('/api/upload', requireAdminAuth, (req: AuthenticatedRequest, res: Response) => {
    try {
      const { fileName, mimeType, base64Data, folder } = req.body as {
        fileName?: string;
        mimeType?: string;
        base64Data?: string;
        folder?: string;
      };

      if (!fileName || !mimeType || !base64Data) {
        res.status(400).json({ error: 'Missing required file upload fields.' });
        return;
      }

      const allowedMimes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
        'application/pdf',
      ];
      if (!allowedMimes.includes(mimeType)) {
        res.status(400).json({ error: 'Unsupported file type. Allowed: JPEG, PNG, WEBP, GIF, PDF.' });
        return;
      }

      const cleanBase64 = base64Data.includes(',') ? base64Data.split(',')[1] : base64Data;
      const buffer = Buffer.from(cleanBase64, 'base64');
      if (buffer.length > 5 * 1024 * 1024) {
        res.status(400).json({ error: 'File exceeds the 5 MB upload size limit.' });
        return;
      }

      const safeFolder = (folder || 'assets').replace(/[^a-zA-Z0-9_-]/g, '');
      const targetDir = path.join(uploadsDir, safeFolder);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      const ext = path.extname(fileName).replace(/[^a-zA-Z0-9.]/g, '') || '.bin';
      const base = path
        .basename(fileName, path.extname(fileName))
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .slice(0, 48);
      const uniqueName = `${base}_${Date.now()}${ext}`;
      const fullPath = path.join(targetDir, uniqueName);
      fs.writeFileSync(fullPath, buffer);

      res.json({
        url: `/uploads/${safeFolder}/${uniqueName}`,
        fileName: uniqueName,
        sizeBytes: buffer.length,
        mimeType,
      });
    } catch (err) {
      console.error('File upload error:', err);
      res.status(500).json({ error: 'Failed to store uploaded file.' });
    }
  });

  app.post('/api/contact', async (req: Request, res: Response) => {
    const { name, email, subject, message } = req.body as {
      name?: string;
      email?: string;
      subject?: string;
      message?: string;
    };

    const trimmedName = (name || '').trim();
    const trimmedEmail = (email || '').trim();
    const trimmedSubject = (subject || '').trim();
    const trimmedMessage = (message || '').trim();

    if (trimmedName.length < 2 || trimmedName.length > 120) {
      res.status(400).json({ error: 'Please provide your full name (2–120 characters).' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail) || trimmedEmail.length > 160) {
      res.status(400).json({ error: 'Please provide a valid email address.' });
      return;
    }
    if (trimmedSubject.length < 2 || trimmedSubject.length > 200) {
      res.status(400).json({ error: 'Please provide a subject (2–200 characters).' });
      return;
    }
    if (trimmedMessage.length < 10 || trimmedMessage.length > 4000) {
      res.status(400).json({ error: 'Please write a message of at least 10 characters.' });
      return;
    }

    const smtpHost = (process.env.SMTP_HOST || '').trim();
    const smtpPort = Number(process.env.SMTP_PORT || 587);
    const smtpUser = (process.env.SMTP_USER || '').trim();
    const smtpPass = (process.env.SMTP_PASS || '').trim();
    const receiverEmail = (process.env.CONTACT_RECEIVER_EMAIL || ADMIN_EMAIL).trim();

    if (!smtpHost || !smtpUser || !smtpPass) {
      res.json({
        validated: true,
        emailSent: false,
        smtpConfigured: false,
        message:
          'SMTP email delivery is not configured on the server. Configure SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS in .env to forward inquiries to your email.',
      });
      return;
    }

    const esc = (s: string) =>
      s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: `"Portfolio Contact · ${trimmedName.replace(/"/g, '')}" <${smtpUser}>`,
        to: receiverEmail,
        replyTo: trimmedEmail,
        subject: `[Portfolio Contact] ${trimmedSubject}`,
        text: `Name: ${trimmedName}\nEmail: ${trimmedEmail}\nSubject: ${trimmedSubject}\n\n${trimmedMessage}`,
        html: `
          <div style="font-family:system-ui,-apple-system,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#0b1120;color:#e2e8f0;border-radius:12px;">
            <h2 style="margin:0 0 16px;color:#38bdf8;font-size:18px;">New Portfolio Contact Message</h2>
            <p style="margin:6px 0;"><strong>From:</strong> ${esc(trimmedName)} (${esc(trimmedEmail)})</p>
            <p style="margin:6px 0;"><strong>Subject:</strong> ${esc(trimmedSubject)}</p>
            <hr style="border:none;border-top:1px solid #1e293b;margin:16px 0;" />
            <p style="white-space:pre-wrap;line-height:1.6;margin:0;">${esc(trimmedMessage)}</p>
          </div>
        `,
      });

      res.json({
        validated: true,
        emailSent: true,
        smtpConfigured: true,
        message: 'Your message was sent directly via Gmail SMTP.',
      });
    } catch (err) {
      console.error('SMTP delivery error:', err);
      res.status(502).json({
        validated: true,
        emailSent: false,
        smtpConfigured: true,
        error: 'Email delivery via SMTP failed. Verify SMTP credentials and Gmail App Password.',
      });
    }
  });

  const handleGitHubFetch = async (rawUsername: string, res: Response) => {
    const username = rawUsername.trim();
    if (!username) {
      res.json({
        configured: false,
        profile: null,
        repos: [],
        message: 'No GitHub username configured.',
      });
      return;
    }

    if (!/^[a-zA-Z0-9-]{1,39}$/.test(username)) {
      res.status(400).json({ error: 'Invalid GitHub username format.' });
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
        const status = userRes.status;
        res.status(status).json({
          error:
            status === 404
              ? `GitHub user "${username}" was not found.`
              : `GitHub API returned status ${status}.`,
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

      res.json({
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
      console.error('GitHub API fetch failed:', err);
      res.status(502).json({ error: 'Unable to reach GitHub API right now.' });
    }
  };

  app.get('/api/github', async (req: Request, res: Response) => {
    const qUser = typeof req.query.username === 'string' ? req.query.username : '';
    await handleGitHubFetch(qUser || process.env.GITHUB_USERNAME || '', res);
  });

  app.get('/api/github/:username', async (req: Request, res: Response) => {
    await handleGitHubFetch(String(req.params.username || ''), res);
  });

  if (process.env.NODE_ENV !== 'production') {
    const viteModule = await import('vite');
    const vite = await viteModule.createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Portfolio server running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
