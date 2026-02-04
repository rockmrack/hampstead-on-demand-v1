"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [magicLink, setMagicLink] = useState<string | null>(null);
  const isDev = process.env.NODE_ENV !== "production";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMagicLink(null);
    
    try {
      const result = await signIn("email", {
        email,
        redirect: false,
        callbackUrl: "/admin",
      });
      
      if (result?.error) {
        setError("Something went wrong. Please try again.");
      } else {
        setSent(true);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!sent || !isDev) return;
    let cancelled = false;

    const fetchMagicLink = async () => {
      try {
        const res = await fetch("/api/dev/magic-link");
        if (!res.ok) return;
        const data = (await res.json()) as { link?: { url?: string } | null };
        if (!cancelled) {
          setMagicLink(data?.link?.url ?? null);
        }
      } catch {
        // ignore
      }
    };

    fetchMagicLink();
    return () => {
      cancelled = true;
    };
  }, [sent, isDev]);

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-lg font-medium tracking-tight text-stone-900">
            Hampstead On Demand
          </Link>
          <Link href="/start" className="text-sm text-stone-600 hover:text-stone-900 transition-colors">
            Check your area
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <Card className="w-full max-w-md border-stone-200 shadow-sm">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-medium">Sign in</CardTitle>
            <CardDescription className="text-stone-600">
              We&apos;ll send you a magic link to your email
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {!sent ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-stone-700">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="text-lg py-6"
                    required
                    disabled={loading}
                  />
                </div>
                {error && (
                  <p className="text-sm text-red-600">{error}</p>
                )}
                <Button 
                  type="submit" 
                  className="w-full bg-stone-900 hover:bg-stone-800 py-6"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Magic Link"}
                </Button>
              </form>
            ) : (
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-stone-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-medium text-stone-900">Check your email</h3>
                  <p className="mt-2 text-stone-600">
                    We&apos;ve sent a sign-in link to <span className="font-medium">{email}</span>
                  </p>
                </div>
                {isDev && magicLink && (
                  <div className="rounded-md border border-stone-200 bg-stone-50 p-3 text-left">
                    <p className="text-xs uppercase tracking-wide text-stone-500">Dev magic link</p>
                    <a
                      href={magicLink}
                      className="mt-2 block break-all text-sm text-stone-900 underline"
                    >
                      Open sign-in link
                    </a>
                  </div>
                )}
                <button
                  onClick={() => { setSent(false); setEmail(""); }}
                  className="text-sm text-stone-500 hover:text-stone-700"
                >
                  Use a different email
                </button>
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
