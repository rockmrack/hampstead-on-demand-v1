import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getServerAuthSession } from "@/lib/auth";

const AssignSchema = z.object({
  assignedTeam: z.enum(["MAINTENANCE", "RENOVATIONS", "UNASSIGNED"]).optional(),
  priority: z.number().int().min(1).max(5).optional(),
}).refine((data) => data.assignedTeam !== undefined || data.priority !== undefined, {
  message: "At least one of assignedTeam or priority must be provided",
});

// POST /api/requests/[id]/assign - Assign team or update priority (admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await getServerAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN" && session.user.role !== "OPS_STAFF") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const body = await request.json();
    const parseResult = AssignSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { assignedTeam, priority } = parseResult.data;

    // Build update data
    const updateData: Record<string, unknown> = {};
    if (assignedTeam !== undefined) {
      updateData.assignedTeam = assignedTeam === "UNASSIGNED" ? null : assignedTeam;
    }
    if (priority !== undefined) {
      updateData.priority = priority;
    }

    const currentRequest = await prisma.request.findUnique({
      where: { id },
      select: { id: true, assignedTeam: true, priority: true },
    });

    if (!currentRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    const updated = await prisma.request.update({
      where: { id },
      data: updateData,
      select: { id: true, assignedTeam: true, priority: true },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        actorUserId: session.user.id,
        entityType: "Request",
        entityId: id,
        action: "assignment_change",
        before: { assignedTeam: currentRequest.assignedTeam, priority: currentRequest.priority },
        after: { assignedTeam: updated.assignedTeam, priority: updated.priority },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error assigning request:", error);
    return NextResponse.json(
      { error: "Failed to assign request" },
      { status: 500 }
    );
  }
}
