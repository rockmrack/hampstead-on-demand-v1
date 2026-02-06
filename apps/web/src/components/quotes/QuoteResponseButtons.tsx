"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface QuoteResponseButtonsProps {
  requestId: string;
}

export function QuoteResponseButtons({ requestId }: QuoteResponseButtonsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<"accept" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleResponse(action: "accept" | "reject") {
    if (loading) return;

    const confirmed = window.confirm(
      action === "accept"
        ? "Accept this quote? We'll arrange next steps."
        : "Reject this quote? You can discuss further in the message thread."
    );
    if (!confirmed) return;

    setLoading(action);
    setError(null);

    try {
      const res = await fetch(`/api/requests/${requestId}/quote-response`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600">
        A quote has been sent for your review. Please accept or reject below.
        If you have questions, use the message thread.
      </p>
      <div className="flex gap-3">
        <Button
          onClick={() => handleResponse("accept")}
          disabled={loading !== null}
          className="bg-green-700 hover:bg-green-800 text-white"
        >
          {loading === "accept" ? "Accepting…" : "Accept quote"}
        </Button>
        <Button
          onClick={() => handleResponse("reject")}
          disabled={loading !== null}
          variant="outline"
          className="border-red-300 text-red-700 hover:bg-red-50"
        >
          {loading === "reject" ? "Rejecting…" : "Reject quote"}
        </Button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
