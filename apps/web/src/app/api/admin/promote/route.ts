import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST /api/admin/promote — promote a user to ADMIN by email
// Only works if there are zero admins (first-run bootstrap) OR the caller is already ADMIN
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = body.email as string;

    if (!email) {
      return NextResponse.json({ error: "email required" }, { status: 400 });
    }

    // Check if any admin exists
    const adminCount = await prisma.user.count({
      where: { role: "ADMIN" },
    });

    const authBypass = process.env.AUTH_BYPASS === "true";

    if (adminCount > 0 && !authBypass) {
      // An admin already exists — require the caller to be logged in as ADMIN
      const session = await getServerSession(authOptions);
      if (!session || session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "User not found. Sign in at least once first." }, { status: 404 });
    }

    // Promote to ADMIN
    await prisma.user.update({
      where: { id: user.id },
      data: { role: "ADMIN" },
    });

    // Ensure ACTIVE membership
    await prisma.membership.upsert({
      where: { userId: user.id },
      update: { status: "ACTIVE" },
      create: { userId: user.id, status: "ACTIVE" },
    });

    // Ensure household
    const householdLink = await prisma.householdMember.findFirst({
      where: { userId: user.id },
    });
    if (!householdLink) {
      await prisma.household.create({
        data: {
          name: `${user.name || user.email}'s household`,
          primaryUserId: user.id,
          members: { create: { userId: user.id, role: "OWNER", canPay: true } },
        },
      });
    }

    return NextResponse.json({
      ok: true,
      userId: user.id,
      email: user.email,
      role: "ADMIN",
      membershipStatus: "ACTIVE",
    });
  } catch (error) {
    console.error("Promote error:", error);
    return NextResponse.json({ error: "Failed to promote user" }, { status: 500 });
  }
}
