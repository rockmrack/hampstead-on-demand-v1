import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authBypass =
    process.env.AUTH_BYPASS === "true" ||
    (process.env.NODE_ENV === "production" && !process.env.EMAIL_SERVER);

  // Get session token (works with database sessions via JWT secret)
  const token = await getToken({
    req: request,
    secret: (process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET),
  });

  // /app/* routes require signed-in user with ACTIVE membership
  if (pathname.startsWith("/app")) {
    if (authBypass) {
      const res = NextResponse.next();
      res.headers.set("x-hod-mw", "1");
      res.headers.set("x-hod-auth", "bypass");
      return res;
    }

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

  const res = NextResponse.next(); res.headers.set("x-hod-mw","1"); return res;}

export const config = {
  matcher: ["/app", "/app/:path*", "/admin", "/admin/:path*"],
};
