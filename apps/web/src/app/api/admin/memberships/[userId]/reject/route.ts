import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerAuthSession } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    const session = await getServerAuthSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "ADMIN" && session.user.role !== "OPS_STAFF") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    const membership = await prisma.membership.upsert({
      where: { userId },
      update: {
        status: "REJECTED",
        approvedById: session.user.id,
      },
      create: {
        userId,
        status: "REJECTED",
        approvedById: session.user.id,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorUserId: session.user.id,
        entityType: "Membership",
        entityId: membership.id,
        action: "reject",
        after: { status: "REJECTED" },
      },
    });

    return NextResponse.json({ success: true, status: "REJECTED" });
  } catch (error) {
    console.error("Error rejecting membership:", error);
    return NextResponse.json(
      { error: "Failed to reject membership" },
      { status: 500 }
    );
  }
}
