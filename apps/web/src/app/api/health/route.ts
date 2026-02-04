import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const checks: Record<string, { status: "ok" | "error"; message?: string; latency?: number }> = {};
  
  // Check database connectivity
  const dbStart = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = { 
      status: "ok", 
      latency: Date.now() - dbStart 
    };
  } catch (error) {
    checks.database = { 
      status: "error", 
      message: error instanceof Error ? error.message : "Unknown error" 
    };
  }

  // Overall status
  const allOk = Object.values(checks).every((c) => c.status === "ok");

  return NextResponse.json(
    {
      status: allOk ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || "local",
      checks,
    },
    { status: allOk ? 200 : 503 }
  );
}
