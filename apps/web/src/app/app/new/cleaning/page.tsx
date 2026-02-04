"use client";

import Link from "next/link";
import { IntakeWizard } from "@/components/intake/IntakeWizard";
import { cleaningForm } from "@/config/intake/cleaning";

export default function CleaningRequestPage() {
  const handleSubmit = async (data: Record<string, unknown>) => {
    const response = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: "CLEANING",
        subcategory: data.subcategory,
        urgency: data.urgency || cleaningForm.defaultUrgency,
        description: data.special_requirements || `${data.subcategory} service requested`,
        postcode: data.postcode,
        answers: data,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return { error: result.error || "Failed to submit request" };
    }

    return { id: result.id };
  };

  return (
    <div className="space-y-6">
      <div>
        <Link href="/app/new" className="text-sm text-gray-500 hover:text-gray-700">
          ← Back to categories
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900 mt-2">
          {cleaningForm.title}
        </h1>
        {cleaningForm.subtitle && (
          <p className="text-sm text-gray-600 mt-1">{cleaningForm.subtitle}</p>
        )}
      </div>

      <IntakeWizard definition={cleaningForm} onSubmit={handleSubmit} />
    </div>
  );
}
