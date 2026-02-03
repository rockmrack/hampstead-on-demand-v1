# Architecture — Hampstead On Demand (V1)

## App shape
- Next.js App Router
- Route Handlers as API
- Postgres + Prisma
- Auth.js sessions + RBAC middleware
- Signed uploads to S3/R2
- Stripe Checkout + Webhooks

## Gating
- `/start` gate checks NW3/NW6/NW8 and writes WaitlistEntry for out-of-area.
- Server-side gate repeats on request creation:
  - membership must be ACTIVE
  - postcode prefix must be allowed

## Status machine (canonical)
submitted → triaged → (site-visit-proposed → site-visit-booked) → quoting → quote-sent → quote-accepted → deposit-paid → scheduled → in-progress → awaiting-final-payment → completed

Other terminal/alternate:
- needs-info
- cancelled
- rejected

Rules:
- Deposit: only quote-accepted
- Final: only awaiting-final-payment
- Any status change creates AuditLog

## API overview
See README “API routes”. All inputs validated with Zod.
All admin routes require role ADMIN or OPS_STAFF.

## Stripe webhooks
- Must be idempotent: ignore already-processed event IDs.
- Update Payment/Invoice rows and write AuditLog.
- Never accept client totals.

## Uploads
- `/api/uploads/sign` returns:
  - presigned PUT URL
  - final public URL (or internal URL stored in DB)
- Client uploads directly to storage.
- Client calls `/api/requests/[id]/media` to attach URL and metadata.
- Enforce content-type allowlist + max size.

## Audit logging
AuditLog fields:
- actorUserId (nullable for system/webhook)
- entityType + entityId
- action
- before/after JSON
