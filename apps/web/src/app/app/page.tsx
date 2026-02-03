import Link from "next/link";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Status badge colors
const statusColors: Record<string, string> = {
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

function formatStatus(status: string): string {
  return status.replace(/_/g, " ").toLowerCase().replace(/^\w/, c => c.toUpperCase());
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default async function MemberDashboard() {
  const session = await getServerAuthSession();
  if (!session) return null;

  // Get user's household(s)
  const householdLinks = await prisma.householdMember.findMany({
    where: { userId: session.user.id },
    select: { householdId: true },
  });

  const householdIds = householdLinks.map((h) => h.householdId);

  // Get requests for user's households
  const requests = await prisma.request.findMany({
    where: {
      householdId: { in: householdIds },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div className="space-y-6">
      {/* Welcome + New Request */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Your requests</h1>
          <p className="text-sm text-gray-600 mt-1">
            Track and manage your property service requests
          </p>
        </div>
        <Link href="/app/new">
          <Button>New request</Button>
        </Link>
      </div>

      {/* Requests list */}
      {requests.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500 mb-4">You haven't submitted any requests yet.</p>
            <Link href="/app/new">
              <Button>Submit your first request</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {requests.map((request) => (
            <Link key={request.id} href={`/app/requests/${request.id}`}>
              <Card className="hover:border-gray-300 transition-colors cursor-pointer">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base font-medium">
                        {request.category}
                        {request.subcategory && (
                          <span className="text-gray-500 font-normal">
                            {" "}— {request.subcategory}
                          </span>
                        )}
                      </CardTitle>
                      <CardDescription className="mt-1 line-clamp-2">
                        {request.description}
                      </CardDescription>
                    </div>
                    <Badge className={statusColors[request.status] || "bg-gray-100 text-gray-800"}>
                      {formatStatus(request.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-gray-400">
                    Submitted {formatDate(request.createdAt)}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
