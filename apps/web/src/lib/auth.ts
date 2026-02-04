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

export function getLastMagicLink(): MagicLinkRecord | null {
  return lastMagicLink;
}

// Custom sendVerificationRequest: log to console in dev, send email in prod
async function sendVerificationRequest({
  identifier: email,
  url,
  provider,
}: SendVerificationRequestParams) {
  if (process.env.NODE_ENV !== "production") {
    lastMagicLink = {
      email,
      url,
      createdAt: new Date().toISOString(),
    };
    console.log("\n========================================");
    console.log("MAGIC_LINK for", email);
    console.log(url);
    console.log("========================================\n");
    return;
  }

  // Production: send via nodemailer
  const transport = createTransport(provider.server);
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
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
      sendVerificationRequest,
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
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
  return getServerSession(authOptions);
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
