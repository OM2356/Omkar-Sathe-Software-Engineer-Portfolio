# Omkar Sathe — Software Engineer Portfolio

Full-stack personal portfolio built with React, TypeScript, Tailwind CSS, Express.js, Firebase Authentication, and Cloud Firestore.

## Key Capabilities

- **Responsive Editorial Showcase**: Deep navy/charcoal dark mode with light-theme toggle, smooth section navigation, scroll progress bar, and WCAG-accessible controls.
- **Complete Sections**: Hero introduction, About Me, Technical Skills with domain coverage visualization, Interactive Project Filtering + Case Study Pages + Live GitHub Repo Feed, Experience & Technical Tracks, Education Timeline, Certifications Gallery (with Honeywell AI entry & file upload), Achievements, Dynamic + Uploadable PDF Resume, and Validated Contact Form.
- **Protected Admin Dashboard (`/admin`)**: Google Authentication (`omkarsathe3103@gmail.com`) verified both via Firestore Security Rules and server-side Firebase Admin ID token verification (`POST /api/admin/verify`). Manage profile, projects, skills, experience, education, certifications, achievements, resume PDFs, and inbound contact messages.

## Local Installation

```bash
npm install
cp .env.example .env
npm run dev
```

The development server runs at `http://localhost:3000`.

## Production Build

```bash
npm run build
npm start
```

## Environment Variables (`.env`)

See `.env.example`:

- `ADMIN_EMAIL`: Verified Google account email authorized for Admin Dashboard and fallback email receiver.
- `CONTACT_RECEIVER_EMAIL`: Target inbox address for contact form submissions (defaults to `ADMIN_EMAIL`).
- `SMTP_HOST`: Set to `smtp.gmail.com` for Gmail SMTP.
- `SMTP_PORT`: `587` (STARTTLS) or `465` (SSL).
- `SMTP_USER`: Your Gmail address used to authenticate SMTP.
- `SMTP_PASS`: Your 16-character **Gmail App Password** (enable 2-Step Verification in your Google Account → Security → App Passwords).
- `GITHUB_TOKEN`: Server-side GitHub Personal Access Token for authenticated GitHub REST API requests (never exposed to the client).
- `GITHUB_USERNAME`: Optional default GitHub username used when none is saved in Firestore.

## Firebase Setup Guide

1. Provision Firestore and Firebase Authentication (Google Sign-In provider enabled).
2. Ensure `firebase-applet-config.json` contains your project credentials (`projectId`, `apiKey`, `authDomain`, `firestoreDatabaseId`, `storageBucket`).
3. Deploy `firestore.rules` to enforce public read for portfolio content, verified admin-only mutations, and private PII protection on `contact_messages`.
4. Sign in at `/admin` with your authorized Google account and click **Sync Defaults to Firestore** to initialize Firestore collections.

## Vercel Deployment Guide

The repository includes `vercel.json` and Vercel Serverless Functions under `/api` (`api/contact.ts`, `api/github.ts`, `api/health.ts`):

1. Push the repository to GitHub and import it into Vercel.
2. Vercel automatically detects `vercel.json` (`npm run build` → `dist/`) and exposes `/api/contact`, `/api/github`, and `/api/health` as serverless functions.
3. Add all variables from `.env.example` in **Vercel Project Settings → Environment Variables**.
4. Add your `*.vercel.app` (and custom) domain to Firebase Authentication **Authorized Domains** so Google Sign-In works in `/admin`.

## Security Checklist

- [x] Zero secrets (`SMTP_PASS`, `GITHUB_TOKEN`, `ADMIN_EMAIL`) exposed in client bundle or `VITE_*` variables.
- [x] `firestore.rules` enforces `request.auth.token.email_verified == true` and strict schema allowlists (`hasAll`, `hasOnly`, string length bounds, ID regex).
- [x] Visitor emails in `contact_messages` are strictly restricted (`get`, `list`, `update`, `delete`) to the verified admin.
- [x] Server-side routes (`/api/admin/verify`, `/api/upload`) verify Firebase ID tokens via `firebase-admin`.
- [x] Contact form inputs are validated client-side, server-side (`/api/contact`), and in Firestore rules.

