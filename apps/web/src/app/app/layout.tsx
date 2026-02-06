import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/auth";
import { SignOutButton } from "@/components/sign-out-button";

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerAuthSession();

  // Double-check auth (middleware should handle this, but belt & suspenders)
  if (!session) {
    redirect("/login");
  }

  if (session.user.membershipStatus !== "ACTIVE") {
    redirect("/start");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo / Brand */}
            <Link href="/app" className="flex items-center gap-2 shrink-0">
              <span className="text-lg font-semibold text-gray-900">
                Hampstead On Demand
              </span>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-2 sm:gap-5">
              <Link href="/app" className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors">
                Home
              </Link>
              <Link href="/app/requests" className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors">
                Requests
              </Link>
              <Link href="/app/new" className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors">
                New
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

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
