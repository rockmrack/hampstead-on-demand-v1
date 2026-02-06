import { getServerAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DeleteAccountButton } from "@/components/account/DeleteAccountButton";
import Link from "next/link";

export default async function AccountPage() {
  const session = await getServerAuthSession();
  if (!session) redirect("/login");

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/app"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back to dashboard
        </Link>
        <h1 className="text-2xl font-semibold text-gray-900 mt-2">Account</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Your details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <h4 className="text-sm font-medium text-gray-500">Email</h4>
            <p className="mt-1 text-gray-900">{session.user.email}</p>
          </div>
          {session.user.name && (
            <div>
              <h4 className="text-sm font-medium text-gray-500">Name</h4>
              <p className="mt-1 text-gray-900">{session.user.name}</p>
            </div>
          )}
          <div>
            <h4 className="text-sm font-medium text-gray-500">Membership</h4>
            <p className="mt-1 text-gray-900 capitalize">
              {(session.user.membershipStatus || "none").toLowerCase()}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-red-900">Danger zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Separator />
          <p className="text-sm text-gray-600">
            Deleting your account will remove all your data, including requests,
            messages, and membership. This cannot be undone.
          </p>
          <DeleteAccountButton />
        </CardContent>
      </Card>
    </div>
  );
}
