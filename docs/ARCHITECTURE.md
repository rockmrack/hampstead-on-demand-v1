# Architecture — Hampstead On Demand (V1)

> Last updated: 2026-02-03

## App Shape
- **Framework:** Next.js 15 (App Router)
- **API:** Route Handlers (`app/api/...`)
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** Auth.js (NextAuth) with email magic link
- **Sessions:** JWT strategy with user role/membership in token
- **Storage:** S3/R2 signed uploads (Phase 2)
- **Payments:** Stripe Checkout + Webhooks (Phase 2)

## Current Implementation Status

### ✅ Completed
- Next.js scaffold with TypeScript + Tailwind + shadcn/ui
- Prisma schema with all entities (User, Membership, Request, etc.)
- Database migrations applied
- Auth.js configured with email provider
- RBAC middleware protecting routes
- Seed script for demo users
- Basic pages: `/start`, `/login`, `/admin`

### 🔲 Pending (MVP)
- Member dashboard (`/app`)
- Maintenance request creation flow
- Request API routes (CRUD)
- Admin inbox and triage UI
- Message thread functionality
- Status machine implementation

---

## Route Protection

### Middleware (`src/middleware.ts`)
```
/app/*    → Requires: logged in + ACTIVE membership
/admin/*  → Requires: logged in + ADMIN or OPS_STAFF role
```

### Redirect Behavior
- Unauthenticated → `/login?callbackUrl=...`
- Non-active member accessing `/app` → `/start`
- Non-admin accessing `/admin` → `/app` (if member) or `/start`

---

## Gating Logic

### Postcode Gate
- `/start` checks NW3/NW6/NW8 prefix
- Out-of-area → write `WaitlistEntry` + show rejection message
- Server-side gate repeats on request creation

### Membership Gate
- Membership must be `ACTIVE` to access `/app/*`
- Status values: `PENDING`, `ACTIVE`, `SUSPENDED`, `REJECTED`

---

## Status Machine (canonical)

### Normal flow:
```
SUBMITTED → TRIAGED → SITE_VISIT_PROPOSED → SITE_VISIT_BOOKED 
    → QUOTING → QUOTE_SENT → QUOTE_ACCEPTED → DEPOSIT_PAID 
    → SCHEDULED → IN_PROGRESS → AWAITING_FINAL_PAYMENT → COMPLETED
```

### Alternate/terminal states:
- `NEEDS_INFO` — awaiting member response
- `CANCELLED` — member or admin cancelled
- `REJECTED` — admin rejected the request

### Business rules:
- Deposit payment: only allowed when `QUOTE_ACCEPTED`
- Final payment: only allowed when `AWAITING_FINAL_PAYMENT`
- Every status change creates an `AuditLog` entry

---

## API Routes (to be implemented)

### Auth / Membership
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/membership/request` | Request membership |
| POST | `/api/admin/memberships/[userId]/approve` | Admin approves |
| POST | `/api/admin/memberships/[userId]/reject` | Admin rejects |

### Requests
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/requests` | Create request + answers + thread |
| GET | `/api/requests` | List member's requests |
| GET | `/api/requests/[id]` | Request detail |
| POST | `/api/requests/[id]/status` | Admin status change |
| GET | `/api/requests/[id]/messages` | Get thread messages |
| POST | `/api/requests/[id]/messages` | Post message |

### Uploads (Phase 2)
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/uploads/sign` | Get presigned URL |
| POST | `/api/requests/[id]/media` | Attach uploaded media |

### Quotes & Payments (Phase 2)
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/admin/requests/[id]/quote` | Create/update quote |
| POST | `/api/admin/requests/[id]/quote/send` | Send quote |
| POST | `/api/requests/[id]/quote/accept` | Member accepts |
| POST | `/api/requests/[id]/pay/deposit` | Pay deposit |
| POST | `/api/requests/[id]/pay/final` | Pay final |
| POST | `/api/stripe/webhook` | Stripe webhook handler |

---

## Input Validation
- All API inputs validated with Zod schemas
- All admin routes verify role before processing
- Never trust client-provided amounts

---

## Stripe Webhooks (Phase 2)
- Must be idempotent (check event ID before processing)
- Update `Payment`/`Invoice` rows on success
- Write `AuditLog` for all payment events
- Never accept client-provided totals

---

## Uploads (Phase 2)
Flow:
1. Client requests presigned URL via `/api/uploads/sign`
2. Client uploads directly to S3/R2
3. Client calls `/api/requests/[id]/media` to attach

Constraints:
- Content-type allowlist: `image/jpeg`, `image/png`, `image/webp`, `video/mp4`
- Max size: 50MB for images, 200MB for video
- Store URL + metadata in `Media` table

---

## Audit Logging

All significant actions are logged to `AuditLog`:

| Field | Description |
|-------|-------------|
| `actorUserId` | Who performed action (null for system/webhook) |
| `entityType` | "Request", "Payment", "Membership", etc. |
| `entityId` | ID of the affected entity |
| `action` | "status_change", "payment_received", etc. |
| `before` | JSON snapshot before change |
| `after` | JSON snapshot after change |

---

## Key Files

| File | Purpose |
|------|---------|
| `apps/web/prisma/schema.prisma` | Database schema |
| `apps/web/src/lib/auth.ts` | Auth options + helpers |
| `apps/web/src/lib/db.ts` | Prisma client singleton |
| `apps/web/src/middleware.ts` | Route protection |
| `apps/web/src/config/intake/*` | Form definitions |
