export default function StartPage() {
  return (
    <main className="mx-auto max-w-xl p-8 space-y-4">
      <h1 className="text-2xl font-semibold">Hampstead On Demand</h1>
      <p className="text-sm text-muted-foreground">
        Members-only for NW3 / NW6 / NW8. Sign in or request access.
      </p>
      <div className="flex gap-3">
        <a className="underline" href="/login">Sign in</a>
        <a className="underline" href="/join">Request access</a>
      </div>
    </main>
  );
}