# Claude Code — Build Instructions (V1)

You are implementing the full working MVP app described in README.md and docs/*.md.

## Non-negotiables
- NOT a marketplace. No third-party providers. All work routed to Hampstead Renovations + Hampstead Maintenance only.
- Hard service area gate: NW3, NW6, NW8 (also enforce server-side).
- Premium, understated copy. No invented claims.

## Source-of-truth files
- README.md (product spec + flows + API checklist)
- apps/web/prisma/schema.prisma (DB schema)
- apps/web/src/config/intake/* (intake definitions)
- docs/ARCHITECTURE.md + docs/SECURITY.md (rules/status/security)

## Current repo structure
- Monorepo root contains docs/, config/, prisma/ (spec artefacts)
- Next.js app lives in: apps/web

## What to build (in apps/web)
### 1) Auth (Auth.js / NextAuth)
- Use Prisma adapter and Email provider (already scaffolded).
- Create:
  - src/lib/auth.ts (getServerSession helper, typed session user incl role)
  - middleware.ts (RBAC protection)
- Rules:
  - /app/* requires logged-in + Membership ACTIVE
  - /admin/* requires role ADMIN or OPS_STAFF

### 2) Prisma + DB
- Prisma is pinned to v6.19.2 (keep it).
- Add:
  - prisma/migrations via prisma migrate
  - seed script: creates ADMIN user + Membership ACTIVE + demo Household + Property
- Ensure schema relations are valid (do not reintroduce ambiguity).

### 3) Pages
Public:
- /start (postcode gate + PWA install CTA + waitlist)
- /login (real sign-in form using Auth.js)
- /join (membership request)

Member:
- /app (dashboard)
- /app/new + /app/new/[category] (wizard driven by config/intake)
- /app/requests/[id] (timeline + chat + payments placeholder)
- /app/properties (CRUD)
- /app/settings

Admin:
- /admin (inbox)
- /admin/requests/[id] (triage + status changes + messages)
- /admin/memberships (approve/deny)
- /admin/calendar (basic list view ok for V1)

### 4) APIs (Route Handlers)
Implement the routes listed in README under “API routes”.
- Use Zod validation.
- All status changes must write AuditLog before/after.
- Never trust client amounts.

### 5) Uploads (signed URL)
- /api/uploads/sign returns presigned PUT + public URL
- Attach media to Request via /api/requests/[id]/media

### 6) Status machine
Use RequestStatus enum; enforce allowed transitions in server code (simple map is fine).
Log transitions.

### 7) Stripe (scaffold only if time)
- Deposit checkout after QUOTE_ACCEPTED
- Webhook updates Payment status

## Definition of done (V1)
A NW3 member can submit a Maintenance request with photos after approval.
Admin can triage and change status, and message the member.
DB persists everything.

Do not “handwave”; implement working minimal versions end-to-end.