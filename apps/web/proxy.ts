import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get session token (works with database sessions via JWT secret)
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // /app/* routes require signed-in user with ACTIVE membership
  if (pathname.startsWith("/app")) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Check membership status - need to fetch from DB since token doesn't have it
    // For database sessions, we check via a lightweight API or cookie
    // Since we use database sessions, the token contains the session info
    const membershipStatus = token.membershipStatus as string | null;

    if (membershipStatus !== "ACTIVE") {
      // Not an active member - redirect to start page
      return NextResponse.redirect(new URL("/start", request.url));
    }
  }

  // /admin/* routes require ADMIN or OPS_STAFF role
  if (pathname.startsWith("/admin")) {
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const role = token.role as string | undefined;

    if (role !== "ADMIN" && role !== "OPS_STAFF") {
      // Not authorized for admin - redirect to app dashboard or start
      const membershipStatus = token.membershipStatus as string | null;
      if (membershipStatus === "ACTIVE") {
        return NextResponse.redirect(new URL("/app", request.url));
      }
      return NextResponse.redirect(new URL("/start", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/admin/:path*"],
};
