import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerAuthSession } from "@/lib/auth";

function toCsvValue(value: string | null) {
  if (!value) return "";
  const escaped = value.replace(/"/g, '""');
  return `"${escaped}"`;
}

export async function GET(request: NextRequest) {
  const session = await getServerAuthSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "OPS_STAFF") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const entries = await prisma.waitlistEntry.findMany({
    orderBy: { createdAt: "desc" },
  });

  const url = new URL(request.url);
  const format = url.searchParams.get("format");

  if (format === "csv") {
    const header = [
      "id",
      "postcode",
      "email",
      "phone",
      "notes",
      "created_at",
    ].join(",");

    const rows = entries.map((entry) => [
      toCsvValue(entry.id),
      toCsvValue(entry.postcode),
      toCsvValue(entry.email),
      toCsvValue(entry.phone),
      toCsvValue(entry.notes),
      toCsvValue(entry.createdAt.toISOString()),
    ].join(","));

    const csv = [header, ...rows].join("\n");
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=waitlist.csv",
      },
    });
  }

  return NextResponse.json({ entries });
}
