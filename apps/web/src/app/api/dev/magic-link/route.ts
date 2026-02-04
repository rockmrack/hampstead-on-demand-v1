import { NextResponse } from "next/server";
import { getLastMagicLink } from "@/lib/auth";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const link = getLastMagicLink();
  return NextResponse.json({ link });
}
