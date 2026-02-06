import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/auth";
import { SignOutButton } from "@/components/sign-out-button";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerAuthSession();

  // Double-check auth (middleware should handle this, but belt & suspenders)
  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "OPS_STAFF") {
    redirect("/app");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Skip to content — accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-gray-900 focus:shadow-md"
      >
        Skip to content
      </a>

      <header className="bg-white border-b border-gray-200" role="banner">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo / Brand */}
            <Link href="/admin" className="flex items-center gap-2 shrink-0">
              <span className="text-lg font-semibold text-gray-900">
                <span className="hidden sm:inline">Hampstead On Demand — </span>Admin
              </span>
            </Link>

            {/* Navigation - horizontal on desktop, compact on mobile */}
            <nav aria-label="Admin navigation" className="flex items-center gap-2 sm:gap-6">
              <Link
                href="/admin"
                className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors"
              >
                Inbox
              </Link>
              <Link
                href="/admin/memberships"
                className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors"
              >
                Members
              </Link>
              <Link
                href="/admin/waitlist"
                className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors"
              >
                Waitlist
              </Link>
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              <span className="text-xs sm:text-sm text-gray-600 hidden md:inline">
                {session.user.email}
              </span>
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      <main id="main-content" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}