// Protected admin layout — auth guard + chrome. Wraps only dashboard pages,
// NOT /admin/login (which lives outside this route group).
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LogOut } from 'lucide-react'

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-glass-border bg-surface/80 px-6 py-3 backdrop-blur-md">
        <Link href="/admin" className="font-heading text-sm font-700 tracking-tight cursor-pointer">
          Damu<span className="text-accent">Auto</span>
          <span className="ml-2 font-normal text-muted-foreground">/ Админ-панель</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden text-xs text-muted-foreground sm:inline">{user.email}</span>
          <form action="/api/auth/logout" method="POST">
            <button className="flex min-h-9 items-center gap-2 rounded-lg border border-input px-3 text-xs font-600 text-muted-foreground transition-colors hover:border-accent/40 hover:text-foreground cursor-pointer">
              <LogOut className="h-3.5 w-3.5" />
              Выйти
            </button>
          </form>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
    </div>
  )
}
