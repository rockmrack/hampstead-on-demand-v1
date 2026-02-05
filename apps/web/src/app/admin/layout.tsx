import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";

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
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo / Brand */}
            <Link href="/admin" className="flex items-center gap-2">
              <span className="text-lg font-semibold text-gray-900">
                Hampstead On Demand — Admin
              </span>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-6">
              <Link
                href="/admin"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Inbox
              </Link>
              <Link
                href="/admin/memberships"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Memberships
              </Link>
              <Link
                href="/admin/waitlist"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Waitlist
              </Link>
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {session.user.email}
              </span>
              <form action="/api/auth/signout" method="POST">
                <Button variant="ghost" size="sm" type="submit">
                  Sign out
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}