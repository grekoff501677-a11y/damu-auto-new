import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { BlogForm } from '../BlogForm'
import type { BlogPost } from '@/lib/types'

export const metadata = { title: 'Редактирование статьи · Админ' }

export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('blog_posts').select('*').eq('id', id).single()
  if (!data) notFound()
  const p = data as BlogPost

  return (
    <div>
      <AdminHeader title="Редактирование" desc={p.title} />
      <div className="glass rounded-2xl p-5 sm:p-6">
        <BlogForm
          initial={{
            id: p.id,
            title: p.title,
            slug: p.slug,
            excerpt: p.excerpt ?? '',
            content: p.content,
            category: p.category,
            cover_image: p.cover_image ?? '',
            before_image: p.before_image ?? '',
            after_image: p.after_image ?? '',
            before_label: p.before_label,
            after_label: p.after_label,
            published: p.published,
          }}
        />
      </div>
    </div>
  )
}
