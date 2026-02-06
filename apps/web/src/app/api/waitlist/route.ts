import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { rateLimitWaitlist, getClientIp } from "@/lib/rate-limit";

const WaitlistSchema = z.object({
  postcode: z.string().min(1, "Postcode is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  notes: z.string().max(1000).optional().or(z.literal("")),
});

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (!rateLimitWaitlist(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const body = await request.json();
    const parseResult = WaitlistSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid waitlist request", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { postcode, email, phone, notes } = parseResult.data;

    const entry = await prisma.waitlistEntry.create({
      data: {
        postcode,
        email: email || null,
        phone: phone || null,
        notes: notes || null,
      },
      select: { id: true },
    });

    return NextResponse.json({ id: entry.id }, { status: 201 });
  } catch (error) {
    console.error("Error creating waitlist entry:", error);
    return NextResponse.json(
      { error: "Failed to join waitlist" },
      { status: 500 }
    );
  }
}
