import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getServerAuthSession } from "@/lib/auth";

const MAX_FILES = 10;

const shouldBypassAuth = () => (process.env.AUTH_BYPASS || "").trim() === "true";

export async function POST(request: NextRequest) {
  const session = await getServerAuthSession();
  if (!session && !shouldBypassAuth()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const files = formData.getAll("files").filter((file): file is File => file instanceof File);

    if (files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { error: `Upload up to ${MAX_FILES} files at a time` },
        { status: 400 }
      );
    }

    const uploads = await Promise.all(
      files.map(async (file) => {
        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const pathname = `requests/${timestamp}-${safeName}`;
        const blob = await put(pathname, file, {
          access: "public",
          contentType: file.type || undefined,
        });

        return {
          url: blob.url,
          pathname: blob.pathname,
          contentType: file.type || null,
          size: file.size,
          name: file.name,
        };
      })
    );

    return NextResponse.json({ files: uploads }, { status: 201 });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
