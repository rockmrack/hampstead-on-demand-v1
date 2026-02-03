"use client";

import Link from "next/link";
import { IntakeWizard } from "@/components/intake/IntakeWizard";
import { maintenanceForm } from "@/config/intake/maintenance";

export default function MaintenanceRequestPage() {
  const handleSubmit = async (data: Record<string, unknown>) => {
    const response = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: "MAINTENANCE",
        subcategory: data.subcategory,
        urgency: data.urgency || maintenanceForm.defaultUrgency,
        description: data.issue_summary,
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
          {maintenanceForm.title}
        </h1>
        {maintenanceForm.subtitle && (
          <p className="text-sm text-gray-600 mt-1">{maintenanceForm.subtitle}</p>
        )}
      </div>

      <IntakeWizard definition={maintenanceForm} onSubmit={handleSubmit} />
    </div>
  );
}
