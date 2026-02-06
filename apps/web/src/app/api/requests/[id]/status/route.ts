import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getServerAuthSession } from "@/lib/auth";
import { RequestStatus } from "@prisma/client";
import { STATUS_TRANSITIONS } from "@/lib/constants";
import { sendStatusChangeEmail, sendQuoteSentEmail } from "@/lib/email";

// Schema for status change
const StatusChangeSchema = z.object({
  status: z.nativeEnum(RequestStatus),
  note: z.string().optional(),
});

// POST /api/requests/[id]/status - Change request status (admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check authentication
    const session = await getServerAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check admin role
    if (session.user.role !== "ADMIN" && session.user.role !== "OPS_STAFF") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    // Parse body
    const body = await request.json();
    const parseResult = StatusChangeSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid status", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { status: newStatus, note } = parseResult.data;

    // Get current request with member email for notifications
    const currentRequest = await prisma.request.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        createdBy: { select: { email: true } },
      },
    });

    if (!currentRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const oldStatus = currentRequest.status;

    // Enforce valid status transitions
    const allowedNext = STATUS_TRANSITIONS[oldStatus] || [];
    if (!allowedNext.includes(newStatus)) {
      return NextResponse.json(
        { error: `Cannot transition from ${oldStatus} to ${newStatus}. Allowed: ${allowedNext.join(", ") || "none"}` },
        { status: 400 }
      );
    }

    // Update status
    const updatedRequest = await prisma.request.update({
      where: { id },
      data: { status: newStatus },
      select: {
        id: true,
        status: true,
      },
    });

    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        actorUserId: session.user.id,
        entityType: "Request",
        entityId: id,
        action: "status_change",
        before: { status: oldStatus },
        after: { status: newStatus, note },
      },
    });

    // Send email notification to member
    const memberEmail = currentRequest.createdBy?.email;
    if (memberEmail) {
      if (newStatus === "QUOTE_SENT") {
        sendQuoteSentEmail(memberEmail, id).catch(() => {});
      } else {
        sendStatusChangeEmail(memberEmail, id, oldStatus, newStatus).catch(() => {});
      }
    }

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error("Error updating status:", error);
    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 }
    );
  }
}
