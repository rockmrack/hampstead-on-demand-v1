# Claude Code Operating Brief — Hampstead On Demand (V1)

> **Originally:** Hampstead House Co  
> **Now:** Hampstead On Demand (V1)

## Non-negotiables
- NOT a marketplace. No third-party providers. Only Hampstead Renovations + Hampstead Maintenance.
- Hard gate: NW3 / NW6 / NW8 on `/start` AND server-side for any request creation.
- Premium, understated copy. Do not invent claims (numbers, awards, "500 projects", etc.).
- Prefer simplest working implementation over fancy architecture.
- **Local dev only** — never point DATABASE_URL at production/BabyShield RDS.
- **Production DB:** Neon Postgres project `hampstead-on-demand-v1` (us-east-2)

## Payments (MVP directive)
Do **not** implement Stripe or any in-app payment flow for the current MVP. Keep payments manual:
- **Small jobs:** bank transfer after completion.
- **Larger works:** collect deposit + final payment by bank transfer after quote acceptance/completion.
- **If card payment is urgently needed:** use manual Stripe Payment Links outside the app (no integration).
- Keep focus on: request flow, quote flow, admin triage, messaging, status transitions, and AuditLog.

## Deployment
- **Production URL:** https://hampstead-on-demand-v1.vercel.app
- **Vercel Project:** hampstead-on-demand-v1 (Root Directory: `apps/web`)
- **Health Check:** `/api/health`
- **Env Vars:** See `docs/ENV_VARS.md`

## Current Progress (2026-02-06)

### ✅ COMPLETED — Phase 1 MVP
1. ✅ Scaffold Next.js (App Router) + TS + Tailwind + shadcn/ui
2. ✅ Prisma + Postgres connection + migrations
3. ✅ Auth.js (email magic link) + RBAC helpers
4. ✅ Membership gating (middleware protects `/app/*` and `/admin/*`)
   - ✅ Seed script with admin + member users
   - ✅ Basic pages: `/start`, `/login`, `/admin`
   - ✅ UI components installed
5. ✅ Intake wizard (config-driven) for all categories
   - ✅ 6 service categories: Maintenance, Renovations, Cleaning, Gardening, Security, Concierge
   - ✅ 12 quick trades on dashboard
   - ✅ Full intake forms for each category
6. ✅ Requests: create, list, detail
   - ✅ `POST /api/requests` — create Request + RequestAnswers + Media + MessageThread (Zod validated, postcode gated)
   - ✅ `GET /api/requests` — list member's requests
   - ✅ `GET /api/requests/[id]` — full detail with RBAC check
   - ✅ Member request list page `/app/requests` (active/closed tabs, status badges)
   - ✅ Member request detail page `/app/requests/[id]`
7. ✅ Admin: inbox, request detail, status machine + AuditLog
   - ✅ Admin inbox `/admin` (tabbed: Active/In Progress/Closed/All, counts, media thumbnails)
   - ✅ Admin request detail `/admin/requests/[id]` (two-column layout, audit timeline)
   - ✅ `POST /api/requests/[id]/status` — status change with transition validation + AuditLog
   - ✅ `POST /api/requests/[id]/assign` — team assignment (Maintenance/Renovations) + priority (1-5)
   - ✅ `StatusChanger` component with team + priority controls
8. ✅ Message thread: API + UI
   - ✅ `GET/POST /api/requests/[id]/messages` — thread messages with attachments
   - ✅ `MessageThread` component (311 lines, attachments, auto-scroll)
   - ✅ Email notification to member on admin reply
9. ✅ Uploads: Vercel Blob integration
   - ✅ `POST /api/uploads` — handleUpload (50MB limit, images/video/PDF)
   - ✅ Integrated into IntakeWizard + MessageThread
10. ✅ Production deployment
    - ✅ Vercel + Neon Postgres configured
    - ✅ Health endpoint `/api/health`
    - ✅ Migrations applied to production

### 🔲 NOT STARTED — Phase 2
11. 🔲 Quotes: draft + send + accept
12. ~~Stripe: deposit + final + webhook~~ → **DEFERRED** (manual bank transfer / Stripe Payment Links for now)
13. 🔲 Notifications: email templates + send on key events
14. ✅ PWA: manifest.json + service worker + install prompt
15. 🔲 Capacitor wrapper for App Store / Play Store

## Build order (follow strictly)

**PHASE 1 — MVP ✅ COMPLETE**
All Phase 1 tasks are implemented and deployed.

| Priority | Task | Status |
|----------|------|--------|
| 5.1 | Create `/app` member dashboard layout | ✅ |
| 5.2 | Build intake wizard component (renders from config) | ✅ |
| 5.3 | Create `/app/new/maintenance` page using wizard | ✅ (+ all 5 other categories) |
| 6.1 | `POST /api/requests` — create Request + RequestAnswers + Thread | ✅ |
| 6.2 | `GET /api/requests` — list member's requests | ✅ |
| 6.3 | `GET /api/requests/[id]` — request detail | ✅ |
| 6.4 | Member request list page `/app/requests` | ✅ |
| 6.5 | Member request detail page `/app/requests/[id]` | ✅ |
| 7.1 | Admin inbox page `/admin` (tabbed, with counts) | ✅ |
| 7.2 | Admin request detail `/admin/requests/[id]` | ✅ |
| 7.3 | `POST /api/requests/[id]/status` — status change + AuditLog | ✅ |
| 7.4 | Status dropdown + team assignment in admin UI | ✅ |
| 8.1 | `GET/POST /api/requests/[id]/messages` — thread messages | ✅ |
| 8.2 | Message thread UI (member + admin views) | ✅ |
| 9.1 | `POST /api/uploads` — Vercel Blob upload | ✅ |
| 9.2 | Upload integration in IntakeWizard + MessageThread | ✅ |

**PHASE 2 — Next up**
- Quotes (draft + send + accept) ← **priority**
- ~~Stripe payments~~ → deferred; manual bank transfer for MVP
- Notifications (email templates + send on key events)
- Capacitor wrapper (App Store / Play Store)
- Visits / scheduling
- Property management UI

## Acceptance checks (MVP)
- Member in NW3 can sign up → request membership → admin approves → submit maintenance request.
- Admin can view request in inbox → change status → AuditLog entry created.
- Member and admin can exchange messages in thread.
- All admin actions write AuditLog.
- Admin routes protected by role; member app protected by active membership.

## Data integrity rules
- Never trust amounts from the client.
- All amounts stored in pence (ints).
- Status transitions validated; disallowed transitions rejected.
- AuditLog for every status change and payment-related change.

## Code conventions
- Zod schemas for every API route input.
- Prisma client singleton (`lib/db.ts`).
- Minimal UI components; avoid over-abstracting.
- Server components by default; client components only when needed.

## Files that are the source of truth
- `README.md` — product spec + current progress
- `CODEX.md` — detailed implementation plan
- `prisma/schema.prisma` — DB schema
- `config/intake/*` — intake definitions
- `docs/ARCHITECTURE.md` — status + API + security notes
