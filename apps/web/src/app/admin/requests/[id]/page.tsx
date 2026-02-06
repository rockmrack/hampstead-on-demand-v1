import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageThread } from "@/components/messages/MessageThread";
import { StatusChanger } from "@/components/admin/StatusChanger";
import { getServerAuthSession } from "@/lib/auth";
import { STATUS_COLORS, formatDateTime, formatCategory } from "@/lib/constants";

export default async function AdminRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerAuthSession();
  if (!session) return null;

  // Fetch the request with all related data
  const request = await prisma.request.findUnique({
    where: { id },
    include: {
      answers: true,
      media: true,
      thread: {
        include: {
          messages: {
            include: {
              sender: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true,
                },
              },
            },
            orderBy: { createdAt: "asc" },
          },
        },
      },
      property: true,
      household: true,
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  if (!request) {
    notFound();
  }

  // Get audit logs for this request
  const auditLogs = await prisma.auditLog.findMany({
    where: {
      entityType: "Request",
      entityId: request.id,
    },
    include: {
      actor: {
        select: {
          email: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  // Convert answers to readable format  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const answersMap: Record<string, any> = request.answers.reduce((acc: Record<string, unknown>, answer: typeof request.answers[number]) => {
    acc[answer.questionKey] = answer.value;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Back link + Header */}
      <div>
        <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-700">
          ← Back to inbox
        </Link>
        <div className="flex items-start justify-between gap-4 mt-2">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {formatCategory(request.category)}
              {request.subcategory && (
                <span className="text-gray-500 font-normal">
                  {" "}— {request.subcategory}
                </span>
              )}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Request ID: {request.id}
            </p>
          </div>
          <StatusChanger
            requestId={request.id}
            currentStatus={request.status}
            assignedTeam={request.assignedTeam}
            priority={request.priority}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Request details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Request details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Description</h4>
                <p className="mt-1 text-gray-900">{request.description}</p>
              </div>

              {request.urgency && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Urgency</h4>
                  <p className="mt-1 text-gray-900 capitalize">
                    {request.urgency.replace(/_/g, " ")}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {answersMap.postcode && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Postcode</h4>
                    <p className="mt-1 text-gray-900">{String(answersMap.postcode)}</p>
                  </div>
                )}

                {answersMap.room_location && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Location</h4>
                    <p className="mt-1 text-gray-900 capitalize">
                      {String(answersMap.room_location).replace(/_/g, " ")}
                    </p>
                  </div>
                )}
              </div>

              {answersMap.safety_risk === true && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <h4 className="text-sm font-medium text-red-800">⚠️ Safety risk reported</h4>
                  {answersMap.safety_risk_details && (
                    <p className="mt-1 text-sm text-red-700">
                      {String(answersMap.safety_risk_details)}
                    </p>
                  )}
                </div>
              )}

              {answersMap.access_method && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Access method</h4>
                  <p className="mt-1 text-gray-900 capitalize">
                    {String(answersMap.access_method).replace(/_/g, " ")}
                  </p>
                </div>
              )}

              {answersMap.access_details && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Access details</h4>
                  <p className="mt-1 text-gray-900">{String(answersMap.access_details)}</p>
                </div>
              )}

              {answersMap.preferred_windows && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Preferred times</h4>
                  <p className="mt-1 text-gray-900">{String(answersMap.preferred_windows)}</p>
                </div>
              )}

              {answersMap.special_notes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Special notes</h4>
                  <p className="mt-1 text-gray-900">{String(answersMap.special_notes)}</p>
                </div>
              )}

              {request.media.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Uploads</h4>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {request.media.map((item) => (
                      <a
                        key={item.id}
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <span className="truncate">{item.url.split("/").pop() || "Attachment"}</span>
                        <span className="text-xs text-gray-500">Open</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Message thread */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <MessageThread
                requestId={request.id}
                messages={request.thread?.messages ?? []}
                currentUserId={session.user.id}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          {/* Contact info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Member</h4>
                <p className="mt-1 text-gray-900">
                  {request.createdBy.name || "No name"}
                </p>
                <p className="text-sm text-gray-600">{request.createdBy.email}</p>
              </div>

              {(request.createdBy.phone || answersMap.contact_phone) && (
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Phone</h4>
                  <p className="mt-1 text-gray-900">
                    {String(answersMap.contact_phone || request.createdBy.phone)}
                  </p>
                </div>
              )}

              <div>
                <h4 className="text-sm font-medium text-gray-500">Household</h4>
                <p className="mt-1 text-gray-900">{request.household.name}</p>
              </div>
            </CardContent>
          </Card>

          {/* Timeline / Audit log */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Created entry */}
                <div className="flex gap-3 text-sm">
                  <div className="w-2 h-2 bg-gray-400 rounded-full mt-1.5 shrink-0" />
                  <div>
                    <p className="text-gray-900">Request created</p>
                    <p className="text-xs text-gray-500">
                    {formatDateTime(request.createdAt)}
                  </p>
                </div>
              </div>

                {/* Audit log entries */}
                {auditLogs.map((log: typeof auditLogs[number]) => (
                  <div key={log.id} className="flex gap-3 text-sm">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-1.5 shrink-0" />
                    <div>
                      <p className="text-gray-900">
                        {log.action === "status_change"
                          ? `Status changed to ${(log.after as Record<string, unknown>)?.status || "unknown"}`
                          : log.action}
                      </p>
                      <p className="text-xs text-gray-500">
                        {log.actor?.email || "System"} • {formatDateTime(log.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
