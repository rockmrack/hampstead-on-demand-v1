/**
 * Shared constants used across member and admin pages.
 */

// ─── Status badge colours ───────────────────────────────────────────────────

export const STATUS_COLORS: Record<string, string> = {
  SUBMITTED: "bg-blue-100 text-blue-800",
  NEEDS_INFO: "bg-yellow-100 text-yellow-800",
  TRIAGED: "bg-purple-100 text-purple-800",
  SITE_VISIT_PROPOSED: "bg-indigo-100 text-indigo-800",
  SITE_VISIT_BOOKED: "bg-indigo-100 text-indigo-800",
  QUOTING: "bg-orange-100 text-orange-800",
  QUOTE_SENT: "bg-orange-100 text-orange-800",
  QUOTE_ACCEPTED: "bg-green-100 text-green-800",
  DEPOSIT_PAID: "bg-green-100 text-green-800",
  SCHEDULED: "bg-teal-100 text-teal-800",
  IN_PROGRESS: "bg-teal-100 text-teal-800",
  AWAITING_FINAL_PAYMENT: "bg-amber-100 text-amber-800",
  COMPLETED: "bg-gray-100 text-gray-800",
  CANCELLED: "bg-red-100 text-red-800",
  REJECTED: "bg-red-100 text-red-800",
};

// ─── Status formatting ──────────────────────────────────────────────────────

export function formatStatus(status: string): string {
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());
}

// ─── Date formatting ────────────────────────────────────────────────────────

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

// ─── Category labels ────────────────────────────────────────────────────────

export const CATEGORY_LABELS: Record<string, string> = {
  MAINTENANCE: "Maintenance & Repairs",
  RENOVATIONS: "Renovations",
  CLEANING: "Cleaning",
  GARDENING: "Garden & Outdoor",
  SECURITY: "Security",
  CONCIERGE: "Concierge",
  DESIGN: "Design Services",
};

export function formatCategory(category: string): string {
  return CATEGORY_LABELS[category] || formatStatus(category);
}

// ─── Status transition map ─────────────────────────────────────────────────
// Defines which statuses each status can transition to.
// CANCELLED is always reachable. Admins need the escape hatch.

export const STATUS_TRANSITIONS: Record<string, string[]> = {
  SUBMITTED: ["NEEDS_INFO", "TRIAGED", "REJECTED", "CANCELLED"],
  NEEDS_INFO: ["SUBMITTED", "TRIAGED", "CANCELLED"],
  TRIAGED: ["SITE_VISIT_PROPOSED", "QUOTING", "REJECTED", "CANCELLED"],
  SITE_VISIT_PROPOSED: ["SITE_VISIT_BOOKED", "QUOTING", "CANCELLED"],
  SITE_VISIT_BOOKED: ["QUOTING", "CANCELLED"],
  QUOTING: ["QUOTE_SENT", "CANCELLED"],
  QUOTE_SENT: ["QUOTE_ACCEPTED", "QUOTING", "REJECTED", "CANCELLED"],
  QUOTE_ACCEPTED: ["DEPOSIT_PAID", "SCHEDULED", "CANCELLED"],
  DEPOSIT_PAID: ["SCHEDULED", "CANCELLED"],
  SCHEDULED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["AWAITING_FINAL_PAYMENT", "COMPLETED", "CANCELLED"],
  AWAITING_FINAL_PAYMENT: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: ["SUBMITTED"], // allow re-open
  REJECTED: ["SUBMITTED"], // allow re-open
};

// ─── Membership status styles ───────────────────────────────────────────────

export const MEMBERSHIP_STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  ACTIVE: "bg-green-100 text-green-800",
  SUSPENDED: "bg-gray-100 text-gray-700",
  REJECTED: "bg-red-100 text-red-800",
};
