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
        status: "ACTIVE",
        approvedById: session.user.id,
        approvedAt: new Date(),
      },
      create: {
        userId,
        status: "ACTIVE",
        approvedById: session.user.id,
        approvedAt: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        actorUserId: session.user.id,
        entityType: "Membership",
        entityId: membership.id,
        action: "approve",
        after: { status: "ACTIVE" },
      },
    });

    const redirectUrl = new URL("/admin/memberships", request.url);
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("Error approving membership:", error);
    return NextResponse.json(
      { error: "Failed to approve membership" },
      { status: 500 }
    );
  }
}
