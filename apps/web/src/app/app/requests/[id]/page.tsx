import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MessageThread } from "@/components/messages/MessageThread";

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

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerAuthSession();
  if (!session) return null;

  // Get user's households to verify access
  const householdLinks = await prisma.householdMember.findMany({
    where: { userId: session.user.id },
    select: { householdId: true },
  });
  const householdIds = householdLinks.map((h) => h.householdId);

  // Fetch the request
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
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // Check if request exists and user has access
  if (!request || !householdIds.includes(request.householdId)) {
    notFound();
  }

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
        <Link href="/app" className="text-sm text-gray-500 hover:text-gray-700">
          ← Back to dashboard
        </Link>
        <div className="flex items-start justify-between gap-4 mt-2">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {request.category}
              {request.subcategory && (
                <span className="text-gray-500 font-normal">
                  {" "}— {request.subcategory}
                </span>
              )}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Submitted {formatDate(request.createdAt)}
            </p>
          </div>
          <Badge className={statusColors[request.status] || "bg-gray-100 text-gray-800"}>
            {formatStatus(request.status)}
          </Badge>
        </div>
      </div>

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

          {answersMap.contact_phone && (
            <div>
              <h4 className="text-sm font-medium text-gray-500">Contact phone</h4>
              <p className="mt-1 text-gray-900">{String(answersMap.contact_phone)}</p>
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
  );
}
