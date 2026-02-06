import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md w-full">
        <CardContent className="py-12 text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400 text-xl">?</span>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Page not found</h2>
          <p className="text-sm text-gray-500 mt-2 mb-6">
            The page you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
          </p>
          <Link href="/app">
            <Button className="bg-stone-900 hover:bg-stone-800">Back to dashboard</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
