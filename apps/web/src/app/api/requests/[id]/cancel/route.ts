import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerAuthSession } from "@/lib/auth";
import { rateLimitApi, getClientIp } from "@/lib/rate-limit";
import { sendRequestCancelledEmail } from "@/lib/email";

// Statuses a member can cancel from (before work begins)
const MEMBER_CANCELLABLE = [
  "SUBMITTED",
  "NEEDS_INFO",
  "TRIAGED",
  "SITE_VISIT_PROPOSED",
  "SITE_VISIT_BOOKED",
  "QUOTING",
  "QUOTE_SENT",
];

// POST /api/requests/[id]/cancel — member cancels their own request
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = getClientIp(request);
  if (!rateLimitApi(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const { id } = await params;

    const session = await getServerAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify request exists and belongs to member's household
    const req = await prisma.request.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        householdId: true,
        category: true,
        createdBy: { select: { email: true } },
      },
    });

    if (!req) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Check household access
    const householdLinks = await prisma.householdMember.findMany({
      where: { userId: session.user.id },
      select: { householdId: true },
    });
    const householdIds = householdLinks.map((h) => h.householdId);

    if (!householdIds.includes(req.householdId)) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    // Check status is cancellable
    if (!MEMBER_CANCELLABLE.includes(req.status)) {
      return NextResponse.json(
        { error: "This request can no longer be cancelled. Please message us if you need help." },
        { status: 400 }
      );
    }

    // Cancel the request + write audit log
    const [updated] = await prisma.$transaction([
      prisma.request.update({
        where: { id },
        data: { status: "CANCELLED" },
      }),
      prisma.auditLog.create({
        data: {
          action: "STATUS_CHANGE",
          entityType: "Request",
          entityId: id,
          actorUserId: session.user.id,
          before: { status: req.status },
          after: { status: "CANCELLED", cancelledBy: "member" },
        },
      }),
    ]);

    // Notify admins
    const admins = await prisma.user.findMany({
      where: { role: { in: ["ADMIN", "OPS_STAFF"] } },
      select: { email: true },
    });
    for (const admin of admins) {
      if (admin.email) {
        sendRequestCancelledEmail(admin.email, id).catch(() => {});
      }
    }

    return NextResponse.json({ status: updated.status });
  } catch (error) {
    console.error("Error cancelling request:", error);
    return NextResponse.json(
      { error: "Failed to cancel request" },
      { status: 500 }
    );
  }
}
