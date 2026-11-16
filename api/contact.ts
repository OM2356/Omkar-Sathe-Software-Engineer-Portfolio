import type { IncomingMessage, ServerResponse } from 'node:http';
import nodemailer from 'nodemailer';

interface ContactPayload {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function sendJson(res: ServerResponse, statusCode: number, body: Record<string, unknown>): void {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

async function readJsonBody(req: IncomingMessage): Promise<ContactPayload> {
  const preParsed = (req as IncomingMessage & { body?: ContactPayload }).body;
  if (preParsed && typeof preParsed === 'object') {
    return preParsed;
  }

  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  const raw = Buffer.concat(chunks).toString('utf-8');
  return raw ? (JSON.parse(raw) as ContactPayload) : {};
}

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed. Use POST.' });
    return;
  }

  let body: ContactPayload;
  try {
    body = await readJsonBody(req);
  } catch {
    sendJson(res, 400, { error: 'Invalid JSON request payload.' });
    return;
  }

  const trimmedName = (body.name || '').trim();
  const trimmedEmail = (body.email || '').trim();
  const trimmedSubject = (body.subject || '').trim();
  const trimmedMessage = (body.message || '').trim();

  if (trimmedName.length < 2 || trimmedName.length > 120) {
    sendJson(res, 400, { error: 'Please provide your full name (2–120 characters).' });
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail) || trimmedEmail.length > 160) {
    sendJson(res, 400, { error: 'Please provide a valid email address.' });
    return;
  }
  if (trimmedSubject.length < 2 || trimmedSubject.length > 200) {
    sendJson(res, 400, { error: 'Please provide a subject (2–200 characters).' });
    return;
  }
  if (trimmedMessage.length < 10 || trimmedMessage.length > 4000) {
    sendJson(res, 400, { error: 'Please write a message between 10 and 4000 characters.' });
    return;
  }

  const adminEmail = (process.env.ADMIN_EMAIL || 'omkarsathe3103@gmail.com').trim();
  const receiverEmail = (process.env.CONTACT_RECEIVER_EMAIL || adminEmail).trim();
  const smtpHost = (process.env.SMTP_HOST || '').trim();
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = (process.env.SMTP_USER || '').trim();
  const smtpPass = (process.env.SMTP_PASS || '').trim();

  if (!smtpHost || !smtpUser || !smtpPass) {
    sendJson(res, 200, {
      validated: true,
      emailSent: false,
      smtpConfigured: false,
      message:
        'SMTP email delivery is not configured yet. Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS in environment variables to forward messages to your email.',
    });
    return;
  }

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
      text: [
        `New portfolio inquiry received`,
        `Name: ${trimmedName}`,
        `Email: ${trimmedEmail}`,
        `Subject: ${trimmedSubject}`,
        '',
        trimmedMessage,
      ].join('\n'),
      html: `
        <div style="font-family:system-ui,-apple-system,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#0b1120;color:#e2e8f0;border-radius:12px;">
          <h2 style="margin:0 0 16px;color:#38bdf8;font-size:18px;">New Portfolio Contact Message</h2>
          <p style="margin:6px 0;"><strong>From:</strong> ${escapeHtml(trimmedName)} (${escapeHtml(trimmedEmail)})</p>
          <p style="margin:6px 0;"><strong>Subject:</strong> ${escapeHtml(trimmedSubject)}</p>
          <hr style="border:none;border-top:1px solid #1e293b;margin:16px 0;" />
          <p style="white-space:pre-wrap;line-height:1.6;margin:0;">${escapeHtml(trimmedMessage)}</p>
        </div>
      `,
    });

    sendJson(res, 200, {
      validated: true,
      emailSent: true,
      smtpConfigured: true,
      message: 'Your message was sent directly to Omkar via Gmail SMTP.',
    });
  } catch (err) {
    console.error('SMTP delivery error:', err);
    sendJson(res, 502, {
      validated: true,
      emailSent: false,
      smtpConfigured: true,
      error: 'Email delivery via SMTP failed. Verify SMTP credentials and Gmail App Password.',
    });
  }
}
