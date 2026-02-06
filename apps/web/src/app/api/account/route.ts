import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerAuthSession } from "@/lib/auth";

// DELETE /api/account — Delete the authenticated user's account and all related data
export async function DELETE() {
  try {
    const session = await getServerAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Cascade delete: Prisma onDelete: Cascade handles most relations.
    // We do an explicit transaction to ensure full cleanup.
    await prisma.$transaction(async (tx) => {
      // Delete messages sent by this user
      await tx.message.deleteMany({ where: { senderUserId: userId } });

      // Delete audit logs by this user
      await tx.auditLog.deleteMany({ where: { actorUserId: userId } });

      // Delete memberships
      await tx.membership.deleteMany({ where: { userId } });

      // Delete household memberships
      await tx.householdMember.deleteMany({ where: { userId } });

      // Delete sessions and accounts (NextAuth)
      await tx.session.deleteMany({ where: { userId } });
      await tx.account.deleteMany({ where: { userId } });

      // Finally delete the user (cascades remaining relations)
      await tx.user.delete({ where: { id: userId } });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}
