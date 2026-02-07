import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getServerAuthSession } from "@/lib/auth";
import { rateLimitApi, getClientIp } from "@/lib/rate-limit";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB (images are compressed client-side)

const shouldBypassAuth = () =>
  process.env.NODE_ENV !== "production" &&
  (process.env.AUTH_BYPASS || "").trim() === "true";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  if (!rateLimitApi(ip).allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const session = await getServerAuthSession();
  if (!session && !shouldBypassAuth()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin =
    session?.user.role === "ADMIN" || session?.user.role === "OPS_STAFF";
  if (session && !isAdmin && session.user.membershipStatus !== "ACTIVE") {
    return NextResponse.json(
      { error: "Active membership required" },
      { status: 403 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: `File too large (max ${MAX_UPLOAD_BYTES / (1024 * 1024)} MB)` },
        { status: 413 }
      );
    }

    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const pathname = `requests/${timestamp}-${safeName}`;

    const blob = await put(pathname, file, {
      access: "public",
      contentType: file.type,
    });

    return NextResponse.json({
      url: blob.url,
      pathname: blob.pathname,
      contentType: blob.contentType,
      size: file.size,
    });
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}
