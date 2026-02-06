"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function DeleteAccountButton() {
  const [step, setStep] = useState<"idle" | "confirm" | "deleting">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setStep("deleting");
    setError(null);

    try {
      const res = await fetch("/api/account", { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete account");
      }

      // Sign out and redirect to home
      await signOut({ callbackUrl: "/" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStep("confirm");
    }
  }

  if (step === "idle") {
    return (
      <Button
        variant="outline"
        className="border-red-300 text-red-700 hover:bg-red-50"
        onClick={() => setStep("confirm")}
      >
        Delete my account
      </Button>
    );
  }

  return (
    <div className="space-y-3 rounded-md border border-red-200 bg-red-50 p-4">
      <p className="text-sm text-red-800">
        This will permanently delete your account and all associated data. This
        action cannot be undone.
      </p>
      <div className="flex gap-3">
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={step === "deleting"}
          className="bg-red-700 hover:bg-red-800"
        >
          {step === "deleting" ? "Deleting…" : "Yes, delete my account"}
        </Button>
        <Button
          variant="outline"
          onClick={() => setStep("idle")}
          disabled={step === "deleting"}
        >
          Cancel
        </Button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
