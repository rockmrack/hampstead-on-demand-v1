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

## Deployment
- **Production URL:** https://hampstead-on-demand-v1.vercel.app
- **Vercel Project:** hampstead-on-demand-v1 (Root Directory: `apps/web`)
- **Health Check:** `/api/health`
- **Env Vars:** See `docs/ENV_VARS.md`

## Current Progress (2026-02-04)

### ✅ COMPLETED (Steps 1-5)
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
6. ✅ Production deployment
   - ✅ Vercel + Neon Postgres configured
   - ✅ Health endpoint `/api/health`
   - ✅ Migrations applied to production

### 🔲 NOT STARTED (Steps 6-11)
6. 🔲 Requests: create, list, detail, timeline, chat thread
7. 🔲 Admin: inbox, request detail triage, status machine + AuditLog
8. 🔲 Uploads: signed URL flow (S3/R2) + attach Media to Request
9. 🔲 Quotes: draft + send + accept
10. 🔲 Stripe: deposit + final + webhook → update Payment/Invoice + AuditLog
11. 🔲 Notifications: email templates + send on key events

## Build order (follow strictly)

**PHASE 1 — MVP (smallest slice)**
Focus ONLY on maintenance requests with basic message thread.

| Priority | Task |
|----------|------|
| 5.1 | Create `/app` member dashboard layout |
| 5.2 | Build intake wizard component (renders from config) |
| 5.3 | Create `/app/new/maintenance` page using wizard |
| 6.1 | `POST /api/requests` — create Request + RequestAnswers + Thread |
| 6.2 | `GET /api/requests` — list member's requests |
| 6.3 | `GET /api/requests/[id]` — request detail |
| 6.4 | Member request list page `/app` |
| 6.5 | Member request detail page `/app/requests/[id]` |
| 7.1 | Admin inbox page `/admin` (list all requests) |
| 7.2 | Admin request detail `/admin/requests/[id]` |
| 7.3 | `POST /api/requests/[id]/status` — admin status change + AuditLog |
| 7.4 | Status dropdown in admin UI |
| 8.1 | `GET/POST /api/requests/[id]/messages` — thread messages |
| 8.2 | Message thread UI (member + admin views) |

**PHASE 2 — After MVP works**
- Uploads (signed URL flow)
- Quotes
- Stripe payments
- Notifications
- Renovations flow
- Other categories

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
