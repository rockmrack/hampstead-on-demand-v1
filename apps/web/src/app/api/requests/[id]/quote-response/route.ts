import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getServerAuthSession } from "@/lib/auth";
import { sendQuoteResponseEmail } from "@/lib/email";

const QuoteResponseSchema = z.object({
  action: z.enum(["accept", "reject"]),
  note: z.string().optional(),
});

// POST /api/requests/[id]/quote-response — Member accepts or rejects a quote
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

    // Parse body
    const body = await request.json();
    const parseResult = QuoteResponseSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { action, note } = parseResult.data;

    // Get request and verify member access
    const currentRequest = await prisma.request.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        householdId: true,
      },
    });

    if (!currentRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Verify the member belongs to this household
    const memberLink = await prisma.householdMember.findFirst({
      where: {
        userId: session.user.id,
        householdId: currentRequest.householdId,
      },
    });

    if (!memberLink) {
      return NextResponse.json({ error: "Not authorised" }, { status: 403 });
    }

    // Only allow response when status is QUOTE_SENT
    if (currentRequest.status !== "QUOTE_SENT") {
      return NextResponse.json(
        { error: "Quote response is only available when a quote has been sent" },
        { status: 400 }
      );
    }

    const newStatus = action === "accept" ? "QUOTE_ACCEPTED" : "REJECTED";
    const oldStatus = currentRequest.status;

    // Update request status
    const updatedRequest = await prisma.request.update({
      where: { id },
      data: { status: newStatus },
      select: { id: true, status: true },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        actorUserId: session.user.id,
        entityType: "Request",
        entityId: id,
        action: action === "accept" ? "quote_accepted" : "quote_rejected",
        before: { status: oldStatus },
        after: { status: newStatus, note },
      },
    });

    // Notify admins about quote response
    const admins = await prisma.user.findMany({
      where: { role: { in: ["ADMIN", "OPS_STAFF"] } },
      select: { email: true },
    });
    for (const admin of admins) {
      if (admin.email) {
        sendQuoteResponseEmail(admin.email, id, session.user.email, action).catch(() => {});
      }
    }

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error("Error responding to quote:", error);
    return NextResponse.json(
      { error: "Failed to respond to quote" },
      { status: 500 }
    );
  }
}
