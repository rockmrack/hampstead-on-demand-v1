# Claude Code Operating Brief — Hampstead On Demand (V1)

## Non-negotiables
- NOT a marketplace. No third-party providers. Only Hampstead Renovations + Hampstead Maintenance.
- Hard gate: NW3 / NW6 / NW8 on `/start` AND server-side for any request creation.
- Premium, understated copy. Do not invent claims (numbers, awards, “500 projects”, etc.).
- Prefer simplest working implementation over fancy architecture.

## Build order (follow strictly)
1) Scaffold Next.js (App Router) + TS + Tailwind + shadcn/ui
2) Prisma + Postgres connection + migrations
3) Auth.js (email magic link first) + RBAC helpers
4) Membership gating (Membership must be ACTIVE to use `/app/*`)
5) Intake wizard (config-driven) for maintenance + renovations
6) Requests: create, list, detail, timeline, chat thread
7) Admin: inbox, request detail triage, status machine + AuditLog
8) Uploads: signed URL flow (S3/R2) + attach Media to Request
9) Quotes: draft + send + accept
10) Stripe: deposit + final + webhook → update Payment/Invoice + AuditLog
11) Notifications: email templates + send on key events

## Acceptance checks (MVP)
- Member in NW3 can sign up → request membership → admin approves → submit maintenance request with media.
- Admin can triage + move status through quote → deposit paid → scheduled → completed → final invoice.
- Stripe webhook updates DB reliably; failures are logged; webhook is idempotent.
- All admin actions write AuditLog.
- Admin routes protected by role; member app protected by active membership.

## Data integrity rules
- Never trust amounts from the client.
- All amounts stored in pence (ints).
- Status transitions validated; disallowed transitions rejected.
- AuditLog for every status change and payment-related change.

## Code conventions
- Zod schemas for every API route input.
- Prisma client singleton.
- Minimal UI components; avoid over-abstracting.

## Files that are the source of truth
- README.md (product spec)
- prisma/schema.prisma (DB schema)
- config/intake/* (intake definitions)
- docs/ARCHITECTURE.md (status + API + security notes)
