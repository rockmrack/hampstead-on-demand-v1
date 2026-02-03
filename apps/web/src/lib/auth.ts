import { PrismaAdapter } from "@auth/prisma-adapter";
import type { AuthOptions, Session, User } from "next-auth";
import { getServerSession } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { prisma } from "@/lib/db";
import type { UserRole, MembershipStatus } from "@prisma/client";

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
