import { NextRequest, NextResponse } from "next/server";
import { handleUpload } from "@vercel/blob/client";
import type { HandleUploadBody } from "@vercel/blob/client";
import { getServerAuthSession } from "@/lib/auth";
import { rateLimitApi, getClientIp } from "@/lib/rate-limit";

const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

const shouldBypassAuth = () => process.env.NODE_ENV !== "production" && (process.env.AUTH_BYPASS || "").trim() === "true";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (!rateLimitApi(ip).allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const session = await getServerAuthSession();
  if (!session && !shouldBypassAuth()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = session?.user.role === "ADMIN" || session?.user.role === "OPS_STAFF";
  if (session && !isAdmin && session.user.membershipStatus !== "ACTIVE") {
    return NextResponse.json({ error: "Active membership required" }, { status: 403 });
  }

  let body: HandleUploadBody;
  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const result = await handleUpload({
      request,
      body,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ["image/*", "video/*", "application/pdf"],
        maximumSizeInBytes: MAX_UPLOAD_BYTES,
        tokenPayload: JSON.stringify({ userId: session?.user.id ?? null }),
      }),
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}
