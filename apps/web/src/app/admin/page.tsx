import Link from "next/link";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  return status.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function AdminInboxPage() {
  // Fetch all requests with related data
  const requests = await prisma.request.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: {
        select: {
          email: true,
          name: true,
        },
      },
      household: {
        select: {
          name: true,
        },
      },
    },
  });

  // Group by status for tabs
  const activeStatuses: string[] = ["SUBMITTED", "NEEDS_INFO", "TRIAGED", "SITE_VISIT_PROPOSED", "SITE_VISIT_BOOKED", "QUOTING", "QUOTE_SENT"];
  const inProgressStatuses: string[] = ["QUOTE_ACCEPTED", "DEPOSIT_PAID", "SCHEDULED", "IN_PROGRESS", "AWAITING_FINAL_PAYMENT"];
  const closedStatuses: string[] = ["COMPLETED", "CANCELLED", "REJECTED"];

  const activeRequests = requests.filter((r: typeof requests[number]) => activeStatuses.includes(r.status));
  const inProgressRequests = requests.filter((r: typeof requests[number]) => inProgressStatuses.includes(r.status));
  const closedRequests = requests.filter((r: typeof requests[number]) => closedStatuses.includes(r.status));

  const RequestList = ({ items }: { items: typeof requests }) => (
    <div className="space-y-3">
      {items.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400 text-xl">✦</span>
            </div>
            <p className="text-sm text-gray-600">No requests yet</p>
            <p className="text-xs text-gray-500 mt-1">New requests will appear here automatically.</p>
          </CardContent>
        </Card>
      ) : (
        items.map((request: typeof requests[number]) => (
          <Link key={request.id} href={`/admin/requests/${request.id}`}>
            <Card className="hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer">
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{request.category}</span>
                      {request.subcategory && (
                        <span className="text-gray-500">— {request.subcategory}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                      {request.description}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>{request.createdBy.email}</span>
                      <span>{formatDate(request.createdAt)}</span>
                      {request.household?.name && (
                        <span className="text-gray-400">• {request.household.name}</span>
                      )}
                    </div>
                  </div>
                  <Badge className={statusColors[request.status] || "bg-gray-100 text-gray-800"}>
                    {formatStatus(request.status)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))
      )}
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Operations</p>
            <h1 className="text-3xl font-semibold text-gray-900">Request Inbox</h1>
            <p className="text-sm text-gray-600 mt-1">
              {requests.length} total requests across all households
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="py-4">
              <p className="text-xs text-gray-500">Active</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{activeRequests.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4">
              <p className="text-xs text-gray-500">In Progress</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{inProgressRequests.length}</p>
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
              <p className="text-xs text-gray-500">All</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{requests.length}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="bg-gray-100">
          <TabsTrigger value="active">
            Active ({activeRequests.length})
          </TabsTrigger>
          <TabsTrigger value="in-progress">
            In Progress ({inProgressRequests.length})
          </TabsTrigger>
          <TabsTrigger value="closed">
            Closed ({closedRequests.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            All ({requests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4">
          <RequestList items={activeRequests} />
        </TabsContent>

        <TabsContent value="in-progress" className="mt-4">
          <RequestList items={inProgressRequests} />
        </TabsContent>

        <TabsContent value="closed" className="mt-4">
          <RequestList items={closedRequests} />
        </TabsContent>

        <TabsContent value="all" className="mt-4">
          <RequestList items={requests} />
        </TabsContent>
      </Tabs>
    </div>
  );
}