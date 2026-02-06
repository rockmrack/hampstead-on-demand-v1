"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STATUS_TRANSITIONS, formatStatus } from "@/lib/constants";

const ALL_STATUSES = [
  { value: "SUBMITTED", label: "Submitted" },
  { value: "NEEDS_INFO", label: "Needs Info" },
  { value: "TRIAGED", label: "Triaged" },
  { value: "SITE_VISIT_PROPOSED", label: "Site Visit Proposed" },
  { value: "SITE_VISIT_BOOKED", label: "Site Visit Booked" },
  { value: "QUOTING", label: "Quoting" },
  { value: "QUOTE_SENT", label: "Quote Sent" },
  { value: "QUOTE_ACCEPTED", label: "Quote Accepted" },
  { value: "DEPOSIT_PAID", label: "Deposit Paid" },
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "AWAITING_FINAL_PAYMENT", label: "Awaiting Final Payment" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "REJECTED", label: "Rejected" },
];

interface StatusChangerProps {
  requestId: string;
  currentStatus: string;
  assignedTeam?: string | null;
  priority?: number;
}

export function StatusChanger({ requestId, currentStatus, assignedTeam, priority }: StatusChangerProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter statuses to only valid transitions
  const allowedNext = STATUS_TRANSITIONS[currentStatus] || [];
  const availableStatuses = ALL_STATUSES.filter(
    (s) => s.value === currentStatus || allowedNext.includes(s.value)
  );

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus) return;

    setIsUpdating(true);
    setError(null);

    try {
      const response = await fetch(`/api/requests/${requestId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update status");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTeamChange = async (team: string) => {
    setIsUpdating(true);
    setError(null);
    try {
      const response = await fetch(`/api/requests/${requestId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedTeam: team }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to assign team");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign team");
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePriorityChange = async (newPriority: string) => {
    setIsUpdating(true);
    setError(null);
    try {
      const response = await fetch(`/api/requests/${requestId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priority: parseInt(newPriority, 10) }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update priority");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update priority");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Status */}
      <div className="space-y-1">
        <label className="text-xs text-gray-500">Status</label>
        <Select
          value={currentStatus}
          onValueChange={handleStatusChange}
          disabled={isUpdating}
        >
          <SelectTrigger className="w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableStatuses.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
                {status.value === currentStatus ? " (current)" : ""}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Team assignment */}
      <div className="space-y-1">
        <label className="text-xs text-gray-500">Team</label>
        <Select
          value={assignedTeam || "UNASSIGNED"}
          onValueChange={handleTeamChange}
          disabled={isUpdating}
        >
          <SelectTrigger className="w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="UNASSIGNED">Unassigned</SelectItem>
            <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
            <SelectItem value="RENOVATIONS">Renovations</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Priority */}
      <div className="space-y-1">
        <label className="text-xs text-gray-500">Priority</label>
        <Select
          value={String(priority ?? 3)}
          onValueChange={handlePriorityChange}
          disabled={isUpdating}
        >
          <SelectTrigger className="w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 — Urgent</SelectItem>
            <SelectItem value="2">2 — High</SelectItem>
            <SelectItem value="3">3 — Normal</SelectItem>
            <SelectItem value="4">4 — Low</SelectItem>
            <SelectItem value="5">5 — Deferred</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
