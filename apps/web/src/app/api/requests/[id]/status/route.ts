import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getServerAuthSession } from "@/lib/auth";
import { RequestStatus } from "@prisma/client";

const shouldBypassAuth = () => process.env.AUTH_BYPASS === "true";

async function getBypassActorId(sessionUserId: string): Promise<string> {
  if (!shouldBypassAuth() || sessionUserId !== "public-user") {
    return sessionUserId;
  }

  const existingMember = await prisma.user.findFirst({
    where: {
      memberships: {
        some: { status: "ACTIVE" },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  if (existingMember) return existingMember.id;

  const user = await prisma.user.upsert({
    where: { email: "guest@hampstead.local" },
    update: {},
    create: {
      email: "guest@hampstead.local",
      name: "Guest User",
      role: "MEMBER",
    },
  });

  await prisma.membership.upsert({
    where: { userId: user.id },
    update: { status: "ACTIVE" },
    create: {
      userId: user.id,
      status: "ACTIVE",
    },
  });

  return user.id;
}

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

    // Get current request
    const currentRequest = await prisma.request.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
      },
    });

    if (!currentRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const oldStatus = currentRequest.status;

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
    const actorUserId = await getBypassActorId(session.user.id);

    await prisma.auditLog.create({
      data: {
        actorUserId,
        entityType: "Request",
        entityId: id,
        action: "status_change",
        before: { status: oldStatus },
        after: { status: newStatus, note },
      },
    });

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error("Error updating status:", error);
    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 }
    );
  }
}
