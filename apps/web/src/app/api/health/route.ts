import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";
export const maxDuration = 10; // Vercel function timeout

export async function GET() {
  const checks: Record<string, { status: "ok" | "error"; message?: string; latency?: number; host?: string }> = {};
  
  // Check database connectivity with timeout
  const dbStart = Date.now();
  const timeoutMs = 5000;
  
  try {
    // Race between query and timeout
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error(`DB timeout after ${timeoutMs}ms`)), timeoutMs)
      ),
    ]);
    
    // Extract host from DATABASE_URL for debugging (hide credentials)
    const dbUrl = process.env.DATABASE_URL || "";
    const hostMatch = dbUrl.match(/@([^:\/]+)/);
    const dbHost = hostMatch ? hostMatch[1] : "unknown";
    
    checks.database = { 
      status: "ok", 
      latency: Date.now() - dbStart,
      host: dbHost,
    };
  } catch (error) {
    checks.database = { 
      status: "error", 
      message: error instanceof Error ? error.message : "Unknown error",
      latency: Date.now() - dbStart,
    };
  }

  // Overall status
  const allOk = Object.values(checks).every((c) => c.status === "ok");

  return NextResponse.json(
    {
      status: allOk ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || "local",
      environment: process.env.VERCEL_ENV || process.env.NODE_ENV || "unknown",
      checks,
    },
    { status: allOk ? 200 : 503 }
  );
}
