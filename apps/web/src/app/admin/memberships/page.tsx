import { prisma } from "@/lib/db";
import { getServerAuthSession } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const statusStyles: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  ACTIVE: "bg-green-100 text-green-800",
  SUSPENDED: "bg-gray-100 text-gray-700",
  REJECTED: "bg-red-100 text-red-800",
};

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

export default async function AdminMembershipsPage() {
  const session = await getServerAuthSession();
  if (!session) return null;

  const memberships = await prisma.membership.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      },
      approvedBy: {
        select: {
          email: true,
          name: true,
        },
      },
    },
  });

  const pending = memberships.filter((m) => m.status === "PENDING");
  const active = memberships.filter((m) => m.status === "ACTIVE");
  const others = memberships.filter((m) => m.status !== "PENDING" && m.status !== "ACTIVE");

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-wide text-gray-500">Operations</p>
        <h1 className="text-3xl font-semibold text-gray-900">Memberships</h1>
        <p className="text-sm text-gray-600 mt-1">
          {memberships.length} total memberships
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="py-4">
            <p className="text-xs text-gray-500">Pending</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">{pending.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-xs text-gray-500">Active</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">{active.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <p className="text-xs text-gray-500">Other</p>
            <p className="text-2xl font-semibold text-gray-900 mt-1">{others.length}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending approvals</CardTitle>
        </CardHeader>
        <CardContent>
          {pending.length === 0 ? (
            <p className="text-sm text-gray-500">No pending memberships.</p>
          ) : (
            <div className="space-y-3">
              {pending.map((membership) => (
                <div
                  key={membership.id}
                  className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {membership.user.name || "Unnamed member"}
                    </p>
                    <p className="text-sm text-gray-600">{membership.user.email}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Requested {formatDate(membership.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <form action={`/api/admin/memberships/${membership.userId}/approve`} method="POST">
                      <button className="rounded-md bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700">
                        Approve
                      </button>
                    </form>
                    <form action={`/api/admin/memberships/${membership.userId}/reject`} method="POST">
                      <button className="rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50">
                        Reject
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All memberships</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {memberships.map((membership) => (
              <div key={membership.id} className="flex flex-col gap-2 rounded-lg border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    {membership.user.name || "Unnamed member"}
                  </p>
                  <p className="text-sm text-gray-600">{membership.user.email}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Joined {formatDate(membership.user.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={statusStyles[membership.status] || "bg-gray-100 text-gray-700"}>
                    {membership.status}
                  </Badge>
                  <div className="text-xs text-gray-500">
                    {membership.approvedBy?.email
                      ? `Approved by ${membership.approvedBy.email}`
                      : "Not approved"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
