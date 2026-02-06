import Link from "next/link";
import { getServerAuthSession } from "@/lib/auth";

export default async function HealthPage() {
  const session = await getServerAuthSession();
  const now = new Date();

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-2xl mx-auto px-6 py-16 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Health check</h1>
          <p className="text-sm text-stone-600">
            Server time: {now.toISOString()}
          </p>
        </div>

        <div className="rounded-lg border border-stone-200 bg-white p-6 space-y-3">
          <div className="text-sm">
            <span className="font-medium text-stone-700">Auth status:</span>{" "}
            <span className="text-stone-900">
              {session ? "authenticated" : "unauthenticated"}
            </span>
          </div>

          {session ? (
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-stone-700">Email:</span>{" "}
                <span className="text-stone-900">{session.user.email}</span>
              </div>
              <div>
                <span className="font-medium text-stone-700">Role:</span>{" "}
                <span className="text-stone-900">{session.user.role}</span>
              </div>
              <div>
                <span className="font-medium text-stone-700">Membership:</span>{" "}
                <span className="text-stone-900">
                  {session.user.membershipStatus ?? "none"}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-sm text-stone-600">
              Sign in to see session details.
            </div>
          )}
        </div>

        <div className="text-sm text-stone-600">
          <Link href="/login" className="text-stone-900 underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
