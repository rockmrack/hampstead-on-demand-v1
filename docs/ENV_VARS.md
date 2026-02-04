# Environment Variables Contract

This document defines all environment variables required for Hampstead On Demand.

## Required Variables

### `DATABASE_URL`
**Required:** Yes (all environments)

PostgreSQL connection string.

| Environment | Value |
|------------|-------|
| Local Dev | `postgresql://hodv1:hodv1_dev_pw@localhost:6543/hodv1?schema=public` |
| Production | Neon Postgres URL with `?sslmode=require&schema=public` |
| Preview | Same as Production (or separate preview DB) |

**Important:** Never use BabyShield RDS. Always use dedicated Neon instance for this project.

---

### `AUTH_SECRET`
**Required:** Yes (all environments)

Secret for signing JWT tokens and encrypting session cookies.

- Generate with: `openssl rand -base64 32`
- NextAuth v4 checks `AUTH_SECRET` first, then falls back to `NEXTAUTH_SECRET`
- Must be the same across all instances serving the same domain

---

### `NEXTAUTH_URL`
**Required:** Yes (Production)

The canonical URL of the application.

| Environment | Value |
|------------|-------|
| Local Dev | `http://localhost:3000` |
| Production | `https://hampstead-on-demand-v1.vercel.app` |
| Preview | Auto-set by Vercel via `VERCEL_URL` |

---

## Email Configuration (Production Only)

### `EMAIL_SERVER`
**Required:** For production magic links

SMTP connection string for sending magic link emails.

Format: `smtp://username:password@smtp.example.com:587`

Examples:
- SendGrid: `smtp://apikey:SG.xxx@smtp.sendgrid.net:587`
- Resend: `smtp://resend:re_xxx@smtp.resend.com:587`
- AWS SES: `smtp://AKIAIOSFODNN7EXAMPLE:wJalrXUtnFEMI@email-smtp.us-east-1.amazonaws.com:587`

**Dev Mode:** When `NODE_ENV !== 'production'`, magic links are logged to console instead of sent via email. The `/api/dev/magic-link` endpoint returns the last generated link.

---

### `EMAIL_FROM`
**Required:** If `EMAIL_SERVER` is set

The "from" address for magic link emails.

Example: `noreply@hampstead-on-demand.com` or `Hampstead On Demand <noreply@hampstead-on-demand.com>`

---

## Auto-Set by Vercel

These are automatically set by Vercel and should NOT be manually configured:

| Variable | Description |
|----------|-------------|
| `VERCEL_URL` | Deployment URL (e.g., `project-xxx.vercel.app`) |
| `VERCEL_GIT_COMMIT_SHA` | Git commit SHA of the deployment |
| `VERCEL_ENV` | Environment type: `production`, `preview`, `development` |
| `NODE_ENV` | `production` in deployed environments |

---

## Vercel Dashboard Configuration

Current production environment variables in Vercel:

| Name | Environments | Description |
|------|--------------|-------------|
| `DATABASE_URL` | Production, Preview | Neon Postgres URL |
| `AUTH_SECRET` | All | JWT signing secret |
| `NEXTAUTH_URL` | Production | `https://hampstead-on-demand-v1.vercel.app` |

### Adding Email (TODO)

To enable magic link emails in production:
1. Set up SMTP provider (SendGrid, Resend, etc.)
2. Add `EMAIL_SERVER` env var in Vercel
3. Add `EMAIL_FROM` env var in Vercel
4. Redeploy

---

## Local Development Setup

1. Copy `.env.example` to `.env.local`
2. Start local Postgres: `docker compose up -d`
3. Run migrations: `npx prisma migrate dev`
4. Seed database: `npx prisma db seed`
5. Start dev server: `npm run dev`

Magic links will be logged to console and available via `/api/dev/magic-link`.
