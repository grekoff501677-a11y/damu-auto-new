// Phase 5 — Admin panel layout with Supabase Auth guard
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')

  return (
    <div className="min-h-screen bg-secondary/40">
      <div className="border-b border-border bg-background px-6 py-4 flex items-center justify-between">
        <span className="font-[family-name:var(--font-rubik)] font-600 text-sm">
          Damu<span className="text-accent">Auto</span>
          <span className="ml-2 text-muted-foreground font-normal">/ Админ-панель</span>
        </span>
        <span className="text-xs text-muted-foreground">{user.email}</span>
      </div>
      <div className="mx-auto max-w-6xl px-6 py-8">
        {children}
      </div>
    </div>
  )
}
