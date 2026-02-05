import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerAuthSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerAuthSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const membership = await prisma.membership.upsert({
      where: { userId: session.user.id },
      update: { status: "PENDING" },
      create: {
        userId: session.user.id,
        status: "PENDING",
      },
    });

    return NextResponse.json({ id: membership.id, status: membership.status });
  } catch (error) {
    console.error("Error requesting membership:", error);
    return NextResponse.json(
      { error: "Failed to request membership" },
      { status: 500 }
    );
  }
}
