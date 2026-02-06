import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerAuthSession } from "@/lib/auth";
import { sendMembershipApprovedEmail } from "@/lib/email";

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

    // Notify member by email
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });
    if (user?.email) {
      sendMembershipApprovedEmail(user.email).catch(() => {});
    }

    return NextResponse.json({ success: true, status: "ACTIVE" });
  } catch (error) {
    console.error("Error approving membership:", error);
    return NextResponse.json(
      { error: "Failed to approve membership" },
      { status: 500 }
    );
  }
}
