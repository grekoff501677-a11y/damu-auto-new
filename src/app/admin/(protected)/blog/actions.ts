'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type BlogInput = {
  id?: string
  title: string
  slug: string
  excerpt: string
  content: string
  category: string // 'update' | 'guide'
  cover_image: string
  before_image: string
  after_image: string
  before_label: string
  after_label: string
  published: boolean
}

function slugify(s: string) {
  return s.toLowerCase().trim()
    .replace(/[^a-z0-9а-я\s-]/gi, '')
    .replace(/\s+/g, '-')
    .slice(0, 80)
}

export async function saveBlogPost(input: BlogInput) {
  const supabase = await createClient()

  if (!input.title.trim() || !input.content.trim()) {
    return { error: 'Заполните заголовок и текст статьи' }
  }

  // published_at fixes the FIRST publication date: editing an already
  // published post must not bump it (blog sorts by published_at desc)
  let publishedAt: string | null = input.published ? new Date().toISOString() : null
  if (input.id && input.published) {
    const { data: existing } = await supabase
      .from('blog_posts').select('published_at').eq('id', input.id).single()
    if (existing?.published_at) publishedAt = existing.published_at
  }

  const row = {
    title: input.title.trim(),
    slug: input.slug.trim() || slugify(input.title),
    excerpt: input.excerpt.trim() || null,
    content: input.content,
    category: input.category,
    cover_image: input.cover_image.trim() || null,
    before_image: input.before_image.trim() || null,
    after_image: input.after_image.trim() || null,
    before_label: input.before_label.trim() || 'Оригинал',
    after_label: input.after_label.trim() || 'Подделка',
    published: input.published,
    published_at: publishedAt,
  }

  if (input.id) {
    const { error } = await supabase.from('blog_posts').update(row).eq('id', input.id)
    if (error) return { error: error.message }
  } else {
    const { error } = await supabase.from('blog_posts').insert(row)
    if (error) return { error: error.message }
  }

  revalidatePath('/admin/blog')
  redirect('/admin/blog')
}

export async function deleteBlogPost(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('blog_posts').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/blog')
  return { success: true }
}
