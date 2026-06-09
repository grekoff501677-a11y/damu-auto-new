// Bare /admin layout — wraps BOTH the login page and protected pages.
// No auth guard here, otherwise /admin/login would redirect to itself (loop).
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-background text-foreground">{children}</div>
}
