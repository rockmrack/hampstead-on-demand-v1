import { prisma } from "@/lib/db";
import { getServerAuthSession } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function formatDate(date: Date | null) {
  if (!date) return "-";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function AdminWaitlistPage() {
  const session = await getServerAuthSession();
  if (!session) return null;

  const entries = await prisma.waitlistEntry.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">Operations</p>
          <h1 className="text-3xl font-semibold text-gray-900">Waitlist</h1>
          <p className="text-sm text-gray-600 mt-1">
            {entries.length} total waitlist entries
          </p>
        </div>
        <a href="/api/admin/waitlist?format=csv">
          <Button variant="outline">Export CSV</Button>
        </a>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent entries</CardTitle>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <p className="text-sm text-gray-500">No waitlist entries yet.</p>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex flex-col gap-2 rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Postcode</p>
                      <p className="text-base font-medium text-gray-900">{entry.postcode}</p>
                    </div>
                    <div className="text-xs text-gray-500">
                      Submitted {formatDate(entry.createdAt)}
                    </div>
                  </div>
                  <div className="grid gap-2 text-sm text-gray-700 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-gray-500">Email</p>
                      <p>{entry.email || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Phone</p>
                      <p>{entry.phone || "-"}</p>
                    </div>
                  </div>
                  {entry.notes && (
                    <div className="text-sm text-gray-700">
                      <p className="text-xs text-gray-500">Notes</p>
                      <p>{entry.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
