"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ALLOWED_POSTCODES = ["NW3", "NW6", "NW8"];

function isPostcodeAllowed(postcode: string): boolean {
  const normalized = postcode.toUpperCase().replace(/\s/g, "");
  return ALLOWED_POSTCODES.some((prefix) => normalized.startsWith(prefix));
}

export default function StartPage() {
  const [postcode, setPostcode] = useState("");
  const [checked, setChecked] = useState(false);
  const [eligible, setEligible] = useState(false);

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const isAllowed = isPostcodeAllowed(postcode);
    setEligible(isAllowed);
    setChecked(true);
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-lg font-medium tracking-tight text-stone-900">
            Hampstead On Demand
          </Link>
          <Link href="/login" className="text-sm text-stone-600 hover:text-stone-900 transition-colors">
            Sign in
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <Card className="w-full max-w-md border-stone-200 shadow-sm">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-medium">Check your area</CardTitle>
            <CardDescription className="text-stone-600">
              We currently serve NW3, NW6 and NW8
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {!checked ? (
              <form onSubmit={handleCheck} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="postcode" className="text-stone-700">Your postcode</Label>
                  <Input
                    id="postcode"
                    type="text"
                    placeholder="e.g. NW3 1AA"
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                    className="text-lg py-6"
                    required
                  />
                </div>
                <Button type="submit" className="w-full bg-stone-900 hover:bg-stone-800 py-6">
                  Check Eligibility
                </Button>
              </form>
            ) : eligible ? (
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-stone-900">You're in our area</h3>
                  <p className="mt-2 text-stone-600">
                    Great news! We serve your postcode. Create an account to get started.
                  </p>
                </div>
                <div className="space-y-3">
                  <Link href="/login" className="block">
                    <Button className="w-full bg-stone-900 hover:bg-stone-800 py-6">
                      Create Account / Sign In
                    </Button>
                  </Link>
                  <button
                    onClick={() => { setChecked(false); setPostcode(""); }}
                    className="text-sm text-stone-500 hover:text-stone-700"
                  >
                    Check different postcode
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-stone-900">Not in our area yet</h3>
                  <p className="mt-2 text-stone-600">
                    We're currently serving NW3, NW6 and NW8 only. We're expanding soon.
                  </p>
                </div>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full py-6 border-stone-300" disabled>
                    Join Waitlist (Coming Soon)
                  </Button>
                  <button
                    onClick={() => { setChecked(false); setPostcode(""); }}
                    className="text-sm text-stone-500 hover:text-stone-700"
                  >
                    Check different postcode
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 py-6">
        <div className="max-w-6xl mx-auto px-6 text-center text-sm text-stone-500">
          © 2026 Hampstead On Demand
        </div>
      </footer>
    </div>
  );
}