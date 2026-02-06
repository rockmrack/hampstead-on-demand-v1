"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface MembershipActionsProps {
  userId: string;
  userName: string;
}

export function MembershipActions({ userId, userName }: MembershipActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<"approve" | "reject" | null>(null);
  const [confirmAction, setConfirmAction] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAction = async (action: "approve" | "reject") => {
    setIsLoading(action);
    setError(null);

    try {
      const response = await fetch(`/api/admin/memberships/${userId}/${action}`, {
        method: "POST",
      });

      if (!response.ok && !response.redirected) {
        throw new Error(`Failed to ${action} membership`);
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${action}`);
    } finally {
      setIsLoading(null);
      setConfirmAction(null);
    }
  };

  if (confirmAction) {
    return (
      <div className="flex flex-col items-end gap-2">
        <p className="text-sm text-gray-700">
          {confirmAction === "approve" ? "Approve" : "Reject"} <strong>{userName}</strong>?
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setConfirmAction(null)}
            disabled={!!isLoading}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            variant={confirmAction === "approve" ? "default" : "destructive"}
            onClick={() => handleAction(confirmAction)}
            disabled={!!isLoading}
          >
            {isLoading ? "Processing..." : `Yes, ${confirmAction}`}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        className="bg-green-600 hover:bg-green-700 text-white"
        onClick={() => setConfirmAction("approve")}
        disabled={!!isLoading}
      >
        Approve
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="border-red-200 text-red-600 hover:bg-red-50"
        onClick={() => setConfirmAction("reject")}
        disabled={!!isLoading}
      >
        Reject
      </Button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
