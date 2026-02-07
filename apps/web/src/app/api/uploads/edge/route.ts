/**
 * Edge Runtime upload endpoint — zero cold start.
 *
 * Uses `getToken()` from next-auth/jwt to verify the session JWT
 * directly (no Prisma / Node.js required). The JWT already contains
 * `role` and `membershipStatus`, so we can enforce RBAC on Edge.
 *
 * Files are streamed straight to Vercel Blob via `put()`.
 * Supports up to 25 MB on Hobby / 100 MB on Pro (Edge body limits).
 */
import { NextRequest } from "next/server";
import { put } from "@vercel/blob";
import { getToken } from "next-auth/jwt";

export const runtime = "edge";

const MAX_UPLOAD_BYTES = 50 * 1024 * 1024; // 50 MB

export async function POST(request: NextRequest) {
  // --- Auth via JWT (Edge-compatible, no Prisma) ---
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
  });

  if (!token) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = token.role === "ADMIN" || token.role === "OPS_STAFF";
  if (!isAdmin && token.membershipStatus !== "ACTIVE") {
    return Response.json(
      { error: "Active membership required" },
      { status: 403 },
    );
  }

  // --- Parse file from FormData ---
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!file || typeof file === "string") {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return Response.json(
      { error: `File too large (max ${MAX_UPLOAD_BYTES / (1024 * 1024)} MB)` },
      { status: 413 },
    );
  }

  // --- Upload to Vercel Blob ---
  try {
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const pathname = `requests/${timestamp}-${safeName}`;

    const blob = await put(pathname, file, {
      access: "public",
      contentType: file.type,
    });

    return Response.json({
      url: blob.url,
      pathname: blob.pathname,
      contentType: blob.contentType,
      size: file.size,
    });
  } catch (error) {
    console.error("Edge upload failed:", error);
    return Response.json(
      { error: "Upload failed. Please try again." },
      { status: 500 },
    );
  }
}
