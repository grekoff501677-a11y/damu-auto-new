import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { DeleteBlogButton } from './DeleteBlogButton'
import { Plus, Pencil, FileText } from 'lucide-react'
import type { BlogPost } from '@/lib/types'

export const metadata = { title: 'Блог · Админ' }

export default async function AdminBlogPage() {
  const supabase = await createClient()
  const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false })
  const posts = (data ?? []) as BlogPost[]

  return (
    <div>
      <AdminHeader
        title="Блог / Статьи"
        desc={`Всего: ${posts.length}`}
        action={
          <Link href="/admin/blog/new">
            <button className="flex min-h-11 items-center gap-2 rounded-xl bg-accent px-4 text-sm font-700 text-accent-foreground transition-all hover:shadow-[0_0_20px_-4px_rgba(196,154,69,0.7)] cursor-pointer">
              <Plus className="h-4 w-4" /> Написать
            </button>
          </Link>
        }
      />

      {posts.length === 0 ? (
        <div className="glass flex flex-col items-center justify-center rounded-2xl p-12 text-center">
          <FileText className="mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Статей пока нет. Нажмите «Написать».</p>
        </div>
      ) : (
        <div className="glass divide-y divide-glass-border rounded-2xl">
          {posts.map((p) => (
            <div key={p.id} className="flex items-center gap-4 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-600 text-foreground">{p.title}</p>
                  <span className="shrink-0 rounded-full border border-accent/25 bg-accent/5 px-2 py-0.5 text-[10px] text-accent">
                    {p.category === 'guide' ? 'Гид' : 'Обновление'}
                  </span>
                  {!p.published && <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-muted-foreground">черновик</span>}
                </div>
                {p.excerpt && <p className="mt-0.5 truncate text-xs text-muted-foreground">{p.excerpt}</p>}
              </div>
              <Link href={`/admin/blog/${p.id}`} className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent/10 hover:text-accent cursor-pointer" aria-label="Редактировать">
                <Pencil className="h-4 w-4" />
              </Link>
              <DeleteBlogButton id={p.id} title={p.title} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
