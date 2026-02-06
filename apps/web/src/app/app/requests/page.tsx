import Link from "next/link";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { STATUS_COLORS, formatStatus, formatDate, formatCategory } from "@/lib/constants";

export default async function RequestsListPage() {
  const session = await getServerAuthSession();
  if (!session) return null;

  // Get user's households
  const householdLinks = await prisma.householdMember.findMany({
    where: { userId: session.user.id },
    select: { householdId: true },
  });
  const householdIds = householdLinks.map((h) => h.householdId);

  // Fetch all requests for user's households
  const requests = await prisma.request.findMany({
    where: {
      householdId: { in: householdIds },
    },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          media: true,
        },
      },
    },
  });

  const activeRequests = requests.filter(
    (r) => !["COMPLETED", "CANCELLED", "REJECTED"].includes(r.status)
  );
  const closedRequests = requests.filter((r) =>
    ["COMPLETED", "CANCELLED", "REJECTED"].includes(r.status)
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/app" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to dashboard
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900 mt-2">Your requests</h1>
          <p className="text-sm text-gray-500 mt-1">
            {requests.length} total request{requests.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/app/new">
          <Button className="bg-stone-900 hover:bg-stone-800">New request</Button>
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="py-4">
            <p className="text-xs text-gray-500">Active</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">{activeRequests.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-xs text-gray-500">Closed</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">{closedRequests.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">{requests.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Active requests */}
      {activeRequests.length > 0 && (
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-3">Active</h2>
          <div className="space-y-3">
            {activeRequests.map((request) => (
              <Link key={request.id} href={`/app/requests/${request.id}`}>
                <Card className="hover:border-stone-300 hover:shadow-sm transition-all cursor-pointer">
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">
                            {formatCategory(request.category)}
                          </span>
                          {request.subcategory && (
                            <span className="text-gray-500">— {request.subcategory}</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                          {request.description}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                          <span>Submitted {formatDate(request.createdAt)}</span>
                          {request._count.media > 0 && (
                            <span>{request._count.media} upload{request._count.media !== 1 ? "s" : ""}</span>
                          )}
                        </div>
                      </div>
                      <Badge className={STATUS_COLORS[request.status] || "bg-gray-100 text-gray-800"}>
                        {formatStatus(request.status)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Closed requests */}
      {closedRequests.length > 0 && (
        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-3">Closed</h2>
          <div className="space-y-3">
            {closedRequests.map((request) => (
              <Link key={request.id} href={`/app/requests/${request.id}`}>
                <Card className="hover:border-stone-300 hover:shadow-sm transition-all cursor-pointer opacity-70">
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">
                            {formatCategory(request.category)}
                          </span>
                          {request.subcategory && (
                            <span className="text-gray-500">— {request.subcategory}</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                          {request.description}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          Submitted {formatDate(request.createdAt)}
                        </p>
                      </div>
                      <Badge className={STATUS_COLORS[request.status] || "bg-gray-100 text-gray-800"}>
                        {formatStatus(request.status)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {requests.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-stone-100 flex items-center justify-center">
              <span className="text-stone-400 text-xl">📋</span>
            </div>
            <p className="text-gray-600">No requests yet</p>
            <p className="text-sm text-gray-500 mt-1 mb-4">Submit your first request to get started</p>
            <Link href="/app/new">
              <Button className="bg-stone-900 hover:bg-stone-800">Submit a request</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
