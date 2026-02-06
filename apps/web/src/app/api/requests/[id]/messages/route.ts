import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getServerAuthSession } from "@/lib/auth";
import { sendAdminReplyEmail } from "@/lib/email";
import { rateLimitApi, getClientIp } from "@/lib/rate-limit";

const shouldBypassAuth = () => (process.env.AUTH_BYPASS || "").trim() === "true";

async function getBypassSenderId(sessionUserId: string): Promise<string> {
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

const AttachmentSchema = z.object({
  url: z.string().url(),
  contentType: z.string().optional().nullable(),
  size: z.number().int().optional().nullable(),
  name: z.string().optional().nullable(),
});

// Schema for posting a message
const PostMessageSchema = z
  .object({
    body: z.string().max(5000, "Message too long").optional().default(""),
    attachments: z.array(AttachmentSchema).max(10).optional().default([]),
  })
  .refine(
    (data) => data.body.trim().length > 0 || data.attachments.length > 0,
    {
      message: "Message cannot be empty",
    }
  );

// GET /api/requests/[id]/messages - Get messages for a request
export async function GET(
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

    // Verify request exists and user has access
    const req = await prisma.request.findUnique({
      where: { id },
      select: {
        householdId: true,
        createdBy: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    if (!req) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Check access
    const isAdmin = session.user.role === "ADMIN" || session.user.role === "OPS_STAFF";

    if (!isAdmin && session.user.membershipStatus !== "ACTIVE") {
      return NextResponse.json({ error: "Active membership required" }, { status: 403 });
    }
    
    if (!isAdmin) {
      const householdMember = await prisma.householdMember.findFirst({
        where: {
          userId: session.user.id,
          householdId: req.householdId,
        },
      });

      if (!householdMember) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    }

    // Get or create thread
    let thread = await prisma.messageThread.findUnique({
      where: { requestId: id },
      include: {
        messages: {
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!thread) {
      thread = await prisma.messageThread.create({
        data: { requestId: id },
        include: {
          messages: {
            include: {
              sender: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true,
                },
              },
            },
            orderBy: { createdAt: "asc" },
          },
        },
      });
    }

    return NextResponse.json(thread.messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

// POST /api/requests/[id]/messages - Post a new message
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = getClientIp(request);
  if (!rateLimitApi(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const { id } = await params;
    
    // Check authentication
    const session = await getServerAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify request exists and user has access
    const req = await prisma.request.findUnique({
      where: { id },
      select: {
        householdId: true,
        createdBy: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });

    if (!req) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Check access
    const isAdmin = session.user.role === "ADMIN" || session.user.role === "OPS_STAFF";

    if (!isAdmin && session.user.membershipStatus !== "ACTIVE") {
      return NextResponse.json({ error: "Active membership required" }, { status: 403 });
    }
    
    if (!isAdmin) {
      const householdMember = await prisma.householdMember.findFirst({
        where: {
          userId: session.user.id,
          householdId: req.householdId,
        },
      });

      if (!householdMember) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    }

    // Parse body
    const body = await request.json();
    const parseResult = PostMessageSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid message", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    // Get or create thread
    let thread = await prisma.messageThread.findUnique({
      where: { requestId: id },
    });

    if (!thread) {
      thread = await prisma.messageThread.create({
        data: { requestId: id },
      });
    }

    // Create message
    const senderUserId = await getBypassSenderId(session.user.id);

    const message = await prisma.message.create({
      data: {
        threadId: thread.id,
        senderUserId,
        body: parseResult.data.body,
        attachments: parseResult.data.attachments,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (isAdmin) {
      await prisma.auditLog.create({
        data: {
          actorUserId: senderUserId,
          entityType: "Request",
          entityId: id,
          action: "message_reply",
          after: {
            messageId: message.id,
            bodyPreview: parseResult.data.body.trim().slice(0, 200),
            attachmentCount: parseResult.data.attachments.length,
          },
        },
      });
    }

    if (isAdmin && req.createdBy?.email) {
      sendAdminReplyEmail(req.createdBy.email, id, message.body).catch(() => {});
    }

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Error posting message:", error);
    return NextResponse.json(
      { error: "Failed to post message" },
      { status: 500 }
    );
  }
}
