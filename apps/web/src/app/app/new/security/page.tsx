"use client";

import Link from "next/link";
import { IntakeWizard } from "@/components/intake/IntakeWizard";
import { securityForm } from "@/config/intake/security";

export default function SecurityRequestPage() {
  const handleSubmit = async (data: Record<string, unknown>) => {
    const response = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: "SECURITY",
        subcategory: data.subcategory,
        urgency: data.urgency || securityForm.defaultUrgency,
        description: data.work_description,
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
          {securityForm.title}
        </h1>
        {securityForm.subtitle && (
          <p className="text-sm text-gray-600 mt-1">{securityForm.subtitle}</p>
        )}
      </div>

      <IntakeWizard definition={securityForm} onSubmit={handleSubmit} />
    </div>
  );
}
