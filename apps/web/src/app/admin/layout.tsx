export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="mx-auto max-w-5xl p-4 flex items-center justify-between">
          <div className="font-semibold">Admin</div>
          <nav className="text-sm flex gap-4">
            <a className="underline" href="/admin">Inbox</a>
            <a className="underline" href="/admin/memberships">Memberships</a>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl p-6">{children}</main>
    </div>
  );
}