import { NextRequest, NextResponse } from "next/server";
import { handleUpload } from "@vercel/blob/server";
import { getServerAuthSession } from "@/lib/auth";

const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

const shouldBypassAuth = () => (process.env.AUTH_BYPASS || "").trim() === "true";

export async function POST(request: NextRequest) {
  const session = await getServerAuthSession();
  if (!session && !shouldBypassAuth()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = session?.user.role === "ADMIN" || session?.user.role === "OPS_STAFF";
  if (session && !isAdmin && session.user.membershipStatus !== "ACTIVE") {
    return NextResponse.json({ error: "Active membership required" }, { status: 403 });
  }

  return handleUpload({
    request,
    onBeforeGenerateToken: async () => ({
      allowedContentTypes: ["image/*", "video/*", "application/pdf"],
      maximumSizeInBytes: MAX_UPLOAD_BYTES,
      tokenPayload: JSON.stringify({ userId: session?.user.id ?? null }),
    }),
  });
}
