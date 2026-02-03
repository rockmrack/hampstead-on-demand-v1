# Hampstead On Demand (MVP)

**Goal (smallest end-to-end slice first):**
NW3/NW6/NW8 member submits a *maintenance* request (+ optional photo) ? admin triages, changes status ? admin/member message thread works.

**Not in scope until that slice works:**
Renovations flow, payments/Stripe, quotes, scheduling, cleaning/gardening/concierge.

## Repo
- `apps/web` = Next.js app
- `apps/web/prisma` = schema + migrations + seed

## Local dev (safe: does NOT touch BabyShield)
Rule: do NOT point `DATABASE_URL` at any BabyShield RDS. Use local docker Postgres for dev.

Example `apps/web/.env.local`:
DATABASE_URL="postgresql://hodv1:hodv1_dev_pw@localhost:6543/hodv1?schema=public"

## Build rule
Claude Code makes edits + runs commands. You approve. No manual file surgery.