# Hampstead On Demand

Members-only "household company" for NW3 / NW6 / NW8 — one app for anything: repairs, refurb, cleaning, gardening, concierge.

> **Originally called:** Hampstead House Co  
> **Renamed to:** Hampstead On Demand (V1)

---

## Purpose (non-negotiable)

This app exists to book work for:
- **Hampstead Renovations** (refurb, loft, extension, design & build)
- **Hampstead Maintenance** (repairs, emergencies, small works)

It is **NOT a marketplace**. No third-party providers. All requests route into our internal operations pipeline.

---

## Product Snapshot

### What members get
- Add a home (property profile)
- Request any property task
- Choose urgency + preferred time windows
- Upload photos/videos
- Receive estimate/quote
- Approve work
- Pay deposit / invoice
- Track status and chat with the team
- View service history (jobs, warranties, documents)

### What we get
- Verified members (less spam, higher-quality leads)
- Structured intake (no messy WhatsApp threads)
- Dispatch workflow for Renovations + Maintenance
- Repeat business via membership tiers
- A "house file" per property (history + docs = trust)

---

## MVP Scope (Phase 1)

### MVP Goal (smallest end-to-end slice first)
NW3/NW6/NW8 member submits a **maintenance request** (+ optional photo) → admin triages, changes status → admin/member message thread works.

### NOT in scope until that slice works:
- Renovations flow
- Payments / Stripe
- Quotes
- Scheduling / visits
- Other service categories (cleaning/gardening/concierge)

### MVP must include:
1. **Member onboarding**
   - Email magic link login (Auth.js)
   - Service area eligibility check (NW3/NW6/NW8 only)
   - Membership = "request access" + manual admin approval

2. **Request a job**
   - Category: Maintenance (only for MVP)
   - Short dynamic questionnaire (config-driven)
   - Urgency: Emergency / This week / Flexible
   - Preferred time windows
   - Upload photos/video
   - Creates structured ticket in admin dashboard

3. **Admin operations**
   - View incoming requests (inbox)
   - Triage + assign to team
   - Change status
   - Message member (in-app)
   - AuditLog for all actions

4. **Message thread**
   - Per-request chat between member and admin

---

## Current Progress (as of 2026-02-03)

### ✅ COMPLETED

| Step | Description | Status |
|------|-------------|--------|
| 1 | Next.js (App Router) + TS + Tailwind + shadcn/ui scaffold | ✅ Done |
| 2 | Prisma schema + Postgres + migrations | ✅ Done |
| 3 | Auth.js (email magic link) + RBAC helpers | ✅ Done |
| 4 | Middleware: `/app/*` requires ACTIVE membership, `/admin/*` requires ADMIN/OPS_STAFF | ✅ Done |
| - | Seed script (admin + member + household + property) | ✅ Done |
| - | Basic pages: `/start`, `/login`, `/admin` | ✅ Done |
| - | UI components (button, card, input, etc.) | ✅ Done |
| - | Intake config definitions (maintenance, renovations) | ✅ Done |

### 🔲 NOT YET STARTED

| Step | Description | Status |
|------|-------------|--------|
| 5 | Intake wizard (config-driven form) for maintenance | 🔲 Todo |
| 6 | Requests: create API + list + detail + timeline | 🔲 Todo |
| 7 | Message thread: API + UI | 🔲 Todo |
| 8 | Admin: inbox, request detail triage, status machine | 🔲 Todo |
| 9 | Uploads: signed URL flow + attach Media to Request | 🔲 Todo |
| - | Member dashboard (`/app` with request list) | 🔲 Todo |
| - | Membership request flow (`/join`) | 🔲 Todo |

### ⏳ PHASE 2 (after MVP works)
- Quotes: draft + send + accept
- Stripe: deposit + final + webhook
- Notifications: email templates
- Renovations flow
- Other categories

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind, shadcn/ui |
| Forms | React Hook Form + Zod |
| Backend | Next.js Route Handlers |
| Database | PostgreSQL + Prisma |
| Auth | Auth.js (NextAuth) - email magic link |
| Storage | S3/R2 (signed uploads) - Phase 2 |
| Payments | Stripe - Phase 2 |
| Deployment | Vercel + Neon/Supabase |

---

## Repo Structure

```
hampstead-on-demand-v1/
├── apps/
│   └── web/                    # Next.js app
│       ├── prisma/
│       │   ├── schema.prisma   # DB schema (source of truth)
│       │   ├── seed.ts         # Demo data
│       │   └── migrations/     # Applied migrations
│       └── src/
│           ├── app/            # App Router pages
│           │   ├── api/        # Route handlers
│           │   ├── admin/      # Admin pages
│           │   ├── login/      # Login page
│           │   └── start/      # Entry/postcode gate
│           ├── components/ui/  # shadcn components
│           ├── config/intake/  # Form definitions
│           └── lib/            # Utilities (auth, db, etc.)
├── config/intake/              # Root-level intake config (mirrored)
├── docs/
│   ├── ARCHITECTURE.md
│   └── SECURITY.md
├── AGENTS.md                   # Claude Code operating rules
├── CODEX.md                    # Detailed build plan (this file)
└── README.md                   # This file
```

---

## Local Development

### Prerequisites
- Node.js 18+
- Docker (for local Postgres)
- pnpm or npm

### Setup
```bash
# Start local Postgres
docker run --name hodv1-db -e POSTGRES_USER=hodv1 -e POSTGRES_PASSWORD=hodv1_dev_pw -e POSTGRES_DB=hodv1 -p 6543:5432 -d postgres:15

# Navigate to web app
cd apps/web

# Install dependencies
npm install

# Create .env.local with:
DATABASE_URL="postgresql://hodv1:hodv1_dev_pw@localhost:6543/hodv1?schema=public"
AUTH_SECRET="dev-secret-replace-in-prod"
EMAIL_SERVER="smtp://localhost:1025"
EMAIL_FROM="Hampstead On Demand <no-reply@hampstead.house>"

# Run migrations
npx prisma migrate dev

# Seed database
npx prisma db seed

# Start dev server
npm run dev
```

### Test users (after seed)
- `admin@hampstead.house` — ADMIN role
- `member@example.com` — MEMBER with ACTIVE membership

---

## Key Decisions

- **Phase 1:** Next.js web app as installable PWA
- **Phase 2:** Capacitor wrapper (App Store / Play Store)
- **Simplicity first:** No over-engineering. Build smallest slice end-to-end.

---

## Source of Truth Files

| File | Purpose |
|------|---------|
| `README.md` | Product spec + current progress |
| `AGENTS.md` | Claude Code operating rules |
| `CODEX.md` | Detailed implementation plan |
| `prisma/schema.prisma` | Database schema |
| `config/intake/*` | Intake form definitions |
| `docs/ARCHITECTURE.md` | Status machine + API + security |

---

## Build Rule

**Claude Code makes edits + runs commands. You approve. No manual file surgery.**

See `CODEX.md` for the exact step-by-step implementation plan._

## Deployment
Production is auto-deployed from `main` via Vercel Git integration. CI triggers on every push to `main`.

---
_Last updated: 
