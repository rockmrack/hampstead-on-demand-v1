"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function CancelRequestButton({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCancel() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/requests/${requestId}/cancel`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to cancel");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  if (!confirming) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
        onClick={() => setConfirming(true)}
      >
        Cancel request
      </Button>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-600">
        Are you sure you want to cancel this request? This cannot be undone.
      </p>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2">
        <Button
          variant="destructive"
          size="sm"
          onClick={handleCancel}
          disabled={loading}
        >
          {loading ? "Cancelling…" : "Yes, cancel"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setConfirming(false);
            setError(null);
          }}
          disabled={loading}
        >
          Keep request
        </Button>
      </div>
    </div>
  );
}
