import { PrismaAdapter } from "@auth/prisma-adapter";
import type { AuthOptions, Session, User } from "next-auth";
import { getServerSession } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import type { SendVerificationRequestParams } from "next-auth/providers/email";
import { createTransport } from "nodemailer";
import { prisma } from "@/lib/db";
import type { UserRole, MembershipStatus } from "@prisma/client";

type MagicLinkRecord = {
  email: string;
  url: string;
  createdAt: string;
};

let lastMagicLink: MagicLinkRecord | null = null;

const shouldBypassAuth = () => process.env.AUTH_BYPASS === "true";

function redactEmailServer(server: string | undefined) {
  if (!server) return "<missing>";
  try {
    const url = new URL(server);
    if (url.username || url.password) {
      url.username = url.username ? "***" : "";
      url.password = url.password ? "***" : "";
    }
    return url.toString();
  } catch {
    return "<invalid>";
  }
}

export function getLastMagicLink(): MagicLinkRecord | null {
  return lastMagicLink;
}

// Custom sendVerificationRequest: log to console in dev, send email in prod
async function sendVerificationRequest({
  identifier: email,
  url,
  provider,
}: SendVerificationRequestParams) {
  // Always log the magic link (useful for debugging)
  lastMagicLink = {
    email,
    url,
    createdAt: new Date().toISOString(),
  };

  // In development or if no email server configured, just log
  if (process.env.NODE_ENV !== "production" || !process.env.EMAIL_SERVER) {
    console.log("\n========================================");
    console.log("MAGIC_LINK for", email);
    console.log(url);
    console.log("========================================\n");
    
    // In production without email, we still need to return successfully
    // so the user sees "check your email" message (they can get link from logs)
    if (process.env.NODE_ENV === "production" && !process.env.EMAIL_SERVER) {
      console.log("WARNING: EMAIL_SERVER not configured. Magic link logged above.");
    }
    return;
  }

  if (process.env.NODE_ENV === "production" && !process.env.EMAIL_FROM) {
    console.error("EMAIL_FROM is not configured for production.");
  }

  // Production with email server configured: send via nodemailer
  const transport = createTransport(provider.server);
  try {
    await transport.sendMail({
      to: email,
      from: provider.from,
      subject: "Sign in to Hampstead On Demand",
      text: `Sign in to Hampstead On Demand\n\n${url}\n\n`,
      html: `
        <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto;">
          <h2 style="color: #1c1917;">Sign in to Hampstead On Demand</h2>
          <p>Click the button below to sign in:</p>
          <a href="${url}" style="display: inline-block; background: #1c1917; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">Sign in</a>
          <p style="color: #78716c; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send magic link email", {
      email,
      server: redactEmailServer(process.env.EMAIL_SERVER),
      from: process.env.EMAIL_FROM ?? "<missing>",
      error,
    });
    throw error;
  }
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: UserRole;
      membershipStatus: MembershipStatus | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    membershipStatus: MembershipStatus | null;
  }
}

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: process.env.EMAIL_SERVER || "smtp://localhost:25",
      from: process.env.EMAIL_FROM || "noreply@hampstead.com",
      sendVerificationRequest,
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  logger: {
    error(code, metadata) {
      console.error("NextAuth error", { code, metadata });
    },
    warn(code) {
      console.warn("NextAuth warning", code);
    },
    debug(code, metadata) {
      if (process.env.NODE_ENV !== "production") {
        console.debug("NextAuth debug", { code, metadata });
      }
    },
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      // On sign-in or when session is updated, fetch fresh user data
      if (user || trigger === "update") {
        const userId = user?.id ?? token.id;
        const dbUser = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            role: true,
            memberships: {
              select: { status: true },
              take: 1,
            },
          },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role;
          token.membershipStatus = dbUser.memberships[0]?.status ?? null;
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.membershipStatus = token.membershipStatus;
      return session;
    },
  },
};

export async function getServerAuthSession(): Promise<Session | null> {
  const session = await getServerSession(authOptions);
  if (session) return session;

  if (shouldBypassAuth()) {
    return {
      user: {
        id: "public-user",
        email: "guest@hampstead.local",
        name: "Guest",
        role: "ADMIN",
        membershipStatus: "ACTIVE",
      },
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    } as Session;
  }

  return null;
}

export async function requireAuth(): Promise<Session> {
  const session = await getServerAuthSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function requireActiveMembership(): Promise<Session> {
  const session = await requireAuth();
  if (session.user.membershipStatus !== "ACTIVE") {
    throw new Error("Membership not active");
  }
  return session;
}

export async function requireAdmin(): Promise<Session> {
  const session = await requireAuth();
  if (session.user.role !== "ADMIN" && session.user.role !== "OPS_STAFF") {
    throw new Error("Admin access required");
  }
  return session;
}
