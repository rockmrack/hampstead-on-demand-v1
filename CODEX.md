# CODEX.md — Detailed Implementation Plan

> Hampstead On Demand (V1) — Build Plan for Claude Code  
> Last updated: 2026-02-03

---

## Overview

This document provides the **exact step-by-step implementation plan** for completing the MVP. Follow these tasks in order. Do not skip ahead.

**MVP Goal:** Member submits maintenance request → Admin triages and changes status → Both can message in thread.

---

## Pre-Flight Checklist

Before starting any task, ensure:
- [ ] Local Docker Postgres is running on port `6543`
- [ ] `apps/web/.env.local` has valid `DATABASE_URL`
- [ ] `npx prisma migrate dev` has been run
- [ ] `npx prisma db seed` has been run
- [ ] Dev server starts: `npm run dev` (in `apps/web`)

Test users after seed:
- `admin@hampstead.house` — ADMIN
- `member@example.com` — MEMBER with ACTIVE membership

---

## Phase 1: MVP Implementation Tasks

### TASK 5.1: Member Dashboard Layout

**Goal:** Create the `/app` route with a shared layout for authenticated members.

**Files to create:**
```
apps/web/src/app/app/layout.tsx       # Member area layout
apps/web/src/app/app/page.tsx         # Dashboard home (will show requests later)
```

**Layout requirements:**
- Import session from auth helpers
- Show user name/email in header
- "New Request" button linking to `/app/new`
- Sign out link
- Children slot for page content

**Dashboard page requirements:**
- Simple welcome message
- "You have no requests yet" placeholder (will be replaced in 6.4)

**Acceptance:**
- `/app` renders without error when logged in as member
- Redirects to `/login` when not authenticated (middleware handles this)

---

### TASK 5.2: Intake Wizard Component

**Goal:** Build a reusable wizard component that renders forms from config definitions.

**Files to create:**
```
apps/web/src/components/intake/IntakeWizard.tsx      # Main wizard component
apps/web/src/components/intake/IntakeField.tsx      # Field renderer
apps/web/src/components/intake/IntakeSection.tsx    # Section wrapper
apps/web/src/lib/intake-utils.ts                    # Visibility + validation helpers
```

**IntakeWizard props:**
```ts
interface IntakeWizardProps {
  definition: IntakeFormDefinition;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  isSubmitting?: boolean;
}
```

**Field types to support (MVP):**
- `short_text` → Input
- `long_text` → Textarea
- `single_select` → Select dropdown
- `yes_no` → Radio buttons (Yes/No)
- `phone` → Input with tel type

**NOT needed for MVP:**
- `multi_select`
- `media` (uploads)
- `time_windows`
- `currency`
- `date`
- `address`
- `number`

**Visibility logic:**
- Use `evalRule()` from `config/intake/types.ts`
- Hide fields where `visibleWhen` evaluates to false

**Validation:**
- Use Zod for validation based on `validation` array
- Show inline errors under fields

**Acceptance:**
- Component renders form from maintenance config
- Conditional fields show/hide correctly
- Validation errors display inline
- onSubmit called with form data

---

### TASK 5.3: Maintenance Request Page

**Goal:** Create the page where members submit maintenance requests.

**Files to create:**
```
apps/web/src/app/app/new/page.tsx                    # Category selection
apps/web/src/app/app/new/maintenance/page.tsx        # Maintenance form
```

**Category selection page (`/app/new`):**
- Show buttons for each category
- MVP: Only "Maintenance" is clickable
- Other categories show "Coming soon" or are disabled

**Maintenance page (`/app/new/maintenance`):**
- Import `maintenanceForm` from config
- Render `IntakeWizard` with the definition
- On submit: POST to `/api/requests`
- On success: Redirect to `/app/requests/[id]`

**Acceptance:**
- `/app/new` shows category options
- `/app/new/maintenance` renders the wizard
- Form submission works (after API is built in 6.1)

---

### TASK 6.1: Create Request API

**Goal:** API endpoint to create a new maintenance request.

**File to create:**
```
apps/web/src/app/api/requests/route.ts
```

**POST /api/requests:**

Input schema (Zod):
```ts
const CreateRequestSchema = z.object({
  category: z.enum(["MAINTENANCE"]),  // MVP only
  subcategory: z.string().optional(),
  urgency: z.string().optional(),
  description: z.string().min(1),
  postcode: z.string(),
  answers: z.record(z.unknown()),
});
```

Logic:
1. Verify user is authenticated + has ACTIVE membership
2. Verify postcode starts with NW3, NW6, or NW8
3. Get user's household (or create one if needed)
4. Create Request with status `SUBMITTED`
5. Create RequestAnswer rows for each answer
6. Create MessageThread linked to request
7. Return created request with ID

**Response:**
```json
{ "id": "cuid...", "status": "SUBMITTED" }
```

**Acceptance:**
- Returns 401 if not authenticated
- Returns 403 if membership not ACTIVE
- Returns 400 if postcode not in service area
- Creates Request + RequestAnswers + MessageThread
- Returns request ID

---

### TASK 6.2: List Requests API

**Goal:** API endpoint to list member's requests.

**File:** Same as 6.1: `apps/web/src/app/api/requests/route.ts`

**GET /api/requests:**

Logic:
1. Verify user is authenticated + has ACTIVE membership
2. Get user's household IDs
3. Fetch requests where householdId in user's households
4. Return array of requests with basic info

**Response:**
```json
[
  {
    "id": "cuid...",
    "category": "MAINTENANCE",
    "subcategory": "plumbing",
    "status": "SUBMITTED",
    "description": "...",
    "createdAt": "2026-02-03T..."
  }
]
```

**Acceptance:**
- Returns empty array if no requests
- Returns only requests belonging to user's households
- Ordered by createdAt desc

---

### TASK 6.3: Request Detail API

**Goal:** API endpoint to get full request details.

**File to create:**
```
apps/web/src/app/api/requests/[id]/route.ts
```

**GET /api/requests/[id]:**

Logic:
1. Verify user is authenticated
2. Fetch request with answers, thread, messages
3. If user is ADMIN/OPS_STAFF: allow access
4. If user is MEMBER: verify request belongs to their household
5. Return full request data

**Response:**
```json
{
  "id": "cuid...",
  "category": "MAINTENANCE",
  "subcategory": "plumbing",
  "status": "SUBMITTED",
  "description": "...",
  "urgency": "this_week",
  "createdAt": "...",
  "answers": [...],
  "thread": {
    "id": "...",
    "messages": [...]
  }
}
```

**Acceptance:**
- Returns 404 if request not found
- Returns 403 if user cannot access this request
- Includes all answers and messages

---

### TASK 6.4: Member Request List Page

**Goal:** Update dashboard to show member's requests.

**File to update:**
```
apps/web/src/app/app/page.tsx
```

**Requirements:**
- Fetch requests from `/api/requests` (server component can query DB directly)
- Show list with: category, subcategory, status badge, date
- Link each to `/app/requests/[id]`
- "New Request" button prominently displayed
- Empty state: "No requests yet. Submit your first request."

**Acceptance:**
- Shows list of member's requests
- Each request links to detail page
- Status shown as colored badge

---

### TASK 6.5: Member Request Detail Page

**Goal:** Page showing full request details for members.

**Files to create:**
```
apps/web/src/app/app/requests/[id]/page.tsx
```

**Requirements:**
- Fetch request details (server component)
- Show: category, subcategory, status, urgency, description
- Show timeline of status changes (from thread messages or audit log)
- Show message thread (read-only for now, input added in 8.2)
- Back link to `/app`

**Acceptance:**
- Shows full request details
- Shows status badge
- Shows message thread (empty if no messages)

---

### TASK 7.1: Admin Inbox Page

**Goal:** Admin page listing all requests.

**File to update:**
```
apps/web/src/app/admin/page.tsx
```

**Requirements:**
- Fetch all requests (admin has access to all)
- Show table with: ID, category, status, member email, date
- Filter by status (tabs or dropdown)
- Link each to `/admin/requests/[id]`
- Sort by createdAt desc (newest first)

**Acceptance:**
- Shows all requests across all households
- Status filters work
- Each row links to admin detail

---

### TASK 7.2: Admin Request Detail Page

**Goal:** Admin page for viewing and triaging a request.

**Files to create:**
```
apps/web/src/app/admin/requests/[id]/page.tsx
```

**Requirements:**
- Fetch full request details
- Show all member-provided info
- Show all answers in readable format
- Status change dropdown (built in 7.4)
- Message thread with reply input (built in 8.2)
- Show audit log entries for this request

**Acceptance:**
- Shows complete request info
- Admin can see everything member submitted

---

### TASK 7.3: Status Change API

**Goal:** API for admin to change request status.

**File to create:**
```
apps/web/src/app/api/requests/[id]/status/route.ts
```

**POST /api/requests/[id]/status:**

Input schema:
```ts
const StatusChangeSchema = z.object({
  status: z.enum([...RequestStatus values]),
  note: z.string().optional(),
});
```

Logic:
1. Verify user is ADMIN or OPS_STAFF
2. Fetch current request
3. (Optional) Validate status transition is allowed
4. Update request status
5. Create AuditLog entry with before/after
6. Return updated request

**Response:**
```json
{ "id": "...", "status": "TRIAGED" }
```

**Acceptance:**
- Returns 403 if not admin
- Updates status
- Creates AuditLog entry
- Returns updated request

---

### TASK 7.4: Status Dropdown in Admin UI

**Goal:** Add status change dropdown to admin request detail.

**File to update:**
```
apps/web/src/app/admin/requests/[id]/page.tsx
```

**Requirements:**
- Client component for interactivity
- Dropdown with all valid statuses
- On change: POST to `/api/requests/[id]/status`
- Show loading state during update
- Refresh data after successful change

**Acceptance:**
- Dropdown shows current status
- Changing status calls API
- Page updates with new status

---

### TASK 8.1: Messages API

**Goal:** API to get and post messages in request thread.

**File to create:**
```
apps/web/src/app/api/requests/[id]/messages/route.ts
```

**GET /api/requests/[id]/messages:**
- Verify user can access this request
- Return messages ordered by createdAt asc

**POST /api/requests/[id]/messages:**

Input schema:
```ts
const PostMessageSchema = z.object({
  body: z.string().min(1).max(5000),
});
```

Logic:
1. Verify user can access this request
2. Get or create thread for request
3. Create message with sender = current user
4. Return created message

**Acceptance:**
- GET returns messages
- POST creates new message
- Messages include sender info

---

### TASK 8.2: Message Thread UI

**Goal:** Add message thread UI to both member and admin request detail pages.

**Files to create:**
```
apps/web/src/components/messages/MessageThread.tsx
apps/web/src/components/messages/MessageInput.tsx
```

**Requirements:**
- MessageThread: renders list of messages with sender name and timestamp
- MessageInput: textarea + send button
- On submit: POST to `/api/requests/[id]/messages`
- Optimistic update or refetch after send
- Show sender role (Member vs Admin) with different styling

**Files to update:**
```
apps/web/src/app/app/requests/[id]/page.tsx
apps/web/src/app/admin/requests/[id]/page.tsx
```

**Acceptance:**
- Messages display correctly
- New messages can be sent
- Both member and admin can use it

---

## Phase 1 Complete Checklist

After all tasks are done:

- [ ] Member can sign in with magic link
- [ ] Member can access `/app` dashboard
- [ ] Member can create maintenance request via wizard
- [ ] Member can view their requests list
- [ ] Member can view request detail with messages
- [ ] Admin can access `/admin` inbox
- [ ] Admin can view any request detail
- [ ] Admin can change request status
- [ ] Admin status change creates AuditLog
- [ ] Member and admin can exchange messages
- [ ] All routes properly protected by middleware

---

## Phase 2: After MVP (do not start until Phase 1 is complete)

### Uploads
- Implement `/api/uploads/sign` for presigned URLs
- Add media upload to intake wizard
- Display uploaded media in request detail

### Quotes
- Create Quote model API
- Admin can create/send quotes
- Member can accept quotes
- Quote acceptance updates request status

### Payments
- Stripe integration
- Deposit payment flow
- Final payment flow
- Webhook handling

### Notifications
- Email on major events
- Email templates

### Additional Features
- Renovations flow
- Other categories
- Membership request flow (`/join`)
- Scheduling/visits

---

## File Reference

### Existing files to be aware of:
```
apps/web/src/lib/auth.ts          # Auth helpers: requireAuth, requireAdmin, requireActiveMembership
apps/web/src/lib/db.ts            # Prisma client singleton
apps/web/src/middleware.ts        # Route protection
apps/web/src/config/intake/       # Form definitions
apps/web/prisma/schema.prisma     # DB schema
```

### shadcn/ui components available:
- Button, Card, Input, Label, Select, Separator, Tabs, Textarea, Badge

### To add more shadcn components:
```bash
cd apps/web
npx shadcn@latest add [component-name]
```

---

## Development Commands

```bash
# Navigate to web app
cd apps/web

# Start dev server
npm run dev

# Run Prisma commands
npx prisma migrate dev        # Apply migrations
npx prisma db seed            # Seed data
npx prisma studio             # Open Prisma Studio GUI
npx prisma generate           # Regenerate client

# Add shadcn component
npx shadcn@latest add [name]
```

---

## Remember

1. **One task at a time.** Complete and test before moving on.
2. **Simplest working implementation.** Don't over-engineer.
3. **Server components by default.** Client components only when needed.
4. **Zod for all API inputs.** No exceptions.
5. **AuditLog for admin actions.** Status changes must be logged.
6. **Local DB only.** Never connect to production.
