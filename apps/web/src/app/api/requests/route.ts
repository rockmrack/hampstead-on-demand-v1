import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getServerAuthSession } from "@/lib/auth";

// Allowed postcode prefixes
const ALLOWED_POSTCODES = ["NW3", "NW6", "NW8"];

// Schema for creating a request
const CreateRequestSchema = z.object({
  category: z.enum(["MAINTENANCE", "RENOVATIONS", "CLEANING", "GARDENING", "CONCIERGE"]),
  subcategory: z.string().optional(),
  urgency: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  postcode: z.string().min(1, "Postcode is required"),
  answers: z.record(z.unknown()),
});

// Check if postcode is in service area
function isPostcodeAllowed(postcode: string): boolean {
  const normalized = postcode.toUpperCase().replace(/\s/g, "");
  return ALLOWED_POSTCODES.some((prefix) => normalized.startsWith(prefix));
}

// POST /api/requests - Create a new request
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check membership status
    if (session.user.membershipStatus !== "ACTIVE") {
      return NextResponse.json(
        { error: "Active membership required" },
        { status: 403 }
      );
    }

    // Parse and validate body
    const body = await request.json();
    const parseResult = CreateRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const { category, subcategory, urgency, description, postcode, answers } = parseResult.data;

    // Check postcode is in service area
    if (!isPostcodeAllowed(postcode)) {
      return NextResponse.json(
        { error: "Sorry, we currently only serve NW3, NW6, and NW8 postcodes." },
        { status: 400 }
      );
    }

    // Get user's household (or first one if multiple)
    const householdMember = await prisma.householdMember.findFirst({
      where: { userId: session.user.id },
      include: { household: true },
    });

    let householdId: string;

    if (householdMember) {
      householdId = householdMember.householdId;
    } else {
      // Create a default household for this user if they don't have one
      const newHousehold = await prisma.household.create({
        data: {
          name: `${session.user.email}'s Household`,
          primaryUserId: session.user.id,
          members: {
            create: {
              userId: session.user.id,
              role: "OWNER",
              canPay: true,
            },
          },
        },
      });
      householdId = newHousehold.id;
    }

    // Create the request with answers and message thread
    const newRequest = await prisma.request.create({
      data: {
        householdId,
        createdByUserId: session.user.id,
        category,
        subcategory,
        urgency,
        description,
        status: "SUBMITTED",
        answers: {
          create: Object.entries(answers).map(([key, value]) => ({
            questionKey: key,
            value: value as any,
          })),
        },
        thread: {
          create: {},
        },
      },
      select: {
        id: true,
        status: true,
      },
    });

    return NextResponse.json(newRequest, { status: 201 });
  } catch (error) {
    console.error("Error creating request:", error);
    return NextResponse.json(
      { error: "Failed to create request" },
      { status: 500 }
    );
  }
}

// GET /api/requests - List user's requests
export async function GET() {
  try {
    // Check authentication
    const session = await getServerAuthSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check membership status
    if (session.user.membershipStatus !== "ACTIVE") {
      return NextResponse.json(
        { error: "Active membership required" },
        { status: 403 }
      );
    }

    // Get user's household IDs
    const householdLinks = await prisma.householdMember.findMany({
      where: { userId: session.user.id },
      select: { householdId: true },
    });

    const householdIds = householdLinks.map((h) => h.householdId);

    // Get requests for those households
    const requests = await prisma.request.findMany({
      where: {
        householdId: { in: householdIds },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        category: true,
        subcategory: true,
        status: true,
        description: true,
        urgency: true,
        createdAt: true,
      },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error("Error fetching requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch requests" },
      { status: 500 }
    );
  }
}
