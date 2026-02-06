import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerAuthSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerAuthSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if the user already has a membership decision
    const existing = await prisma.membership.findUnique({
      where: { userId: session.user.id },
      select: { status: true },
    });

    if (existing?.status === "REJECTED") {
      return NextResponse.json(
        { error: "Your membership request was previously declined. Please contact us for assistance." },
        { status: 403 }
      );
    }

    if (existing?.status === "ACTIVE") {
      return NextResponse.json(
        { error: "You already have an active membership." },
        { status: 400 }
      );
    }

    if (existing?.status === "PENDING") {
      return NextResponse.json(
        { id: "existing", status: "PENDING", message: "Your membership request is already pending review." }
      );
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
