'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Save } from 'lucide-react'
import { TextField, TextArea, SelectField, Toggle } from '@/components/admin/AdminField'
import { saveBlogPost, type BlogInput } from './actions'

const CATEGORIES = [
  { value: 'guide',  label: 'Гид (Оригинал vs Подделка)' },
  { value: 'update', label: 'Обновление магазина' },
]

export function BlogForm({ initial }: { initial?: Partial<BlogInput> }) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [f, setF] = useState<BlogInput>({
    id: initial?.id,
    title: initial?.title ?? '',
    slug: initial?.slug ?? '',
    excerpt: initial?.excerpt ?? '',
    content: initial?.content ?? '',
    category: initial?.category ?? 'guide',
    cover_image: initial?.cover_image ?? '',
    before_image: initial?.before_image ?? '',
    after_image: initial?.after_image ?? '',
    before_label: initial?.before_label ?? 'Оригинал',
    after_label: initial?.after_label ?? 'Подделка',
    published: initial?.published ?? false,
  })

  function set<K extends keyof BlogInput>(k: K, v: BlogInput[K]) {
    setF((p) => ({ ...p, [k]: v }))
  }

  function submit() {
    setError(null)
    start(async () => {
      const r = await saveBlogPost(f)
      if (r?.error) setError(r.error)
    })
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <TextField label="Заголовок" id="title" value={f.title} onChange={(v) => set('title', v)} required />
        <SelectField label="Категория" id="cat" value={f.category} onChange={(v) => set('category', v)} options={CATEGORIES} />
      </div>
      <TextField label="Slug (необязательно)" id="slug" value={f.slug} onChange={(v) => set('slug', v)} placeholder="авто из заголовка" />
      <TextField label="Краткое описание (excerpt)" id="excerpt" value={f.excerpt} onChange={(v) => set('excerpt', v)} />
      <TextArea label="Текст статьи (Markdown)" id="content" value={f.content} onChange={(v) => set('content', v)} rows={10} hint="Поддерживается Markdown: # заголовки, **жирный**, - списки" />

      <TextField label="Обложка (URL)" id="cover" value={f.cover_image} onChange={(v) => set('cover_image', v)} placeholder="https://..." />

      <div className="rounded-xl border border-glass-border p-4">
        <p className="mb-3 text-xs font-600 uppercase tracking-widest text-accent">Сравнение «Оригинал vs Подделка» (необязательно)</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField label="Фото «до» (оригинал) URL" id="before" value={f.before_image} onChange={(v) => set('before_image', v)} />
          <TextField label="Фото «после» (подделка) URL" id="after" value={f.after_image} onChange={(v) => set('after_image', v)} />
          <TextField label="Подпись «до»" id="blabel" value={f.before_label} onChange={(v) => set('before_label', v)} />
          <TextField label="Подпись «после»" id="alabel" value={f.after_label} onChange={(v) => set('after_label', v)} />
        </div>
      </div>

      <Toggle label="Опубликовать" checked={f.published} onChange={(v) => set('published', v)} />

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button onClick={submit} disabled={pending}
          className="flex min-h-11 items-center gap-2 rounded-xl bg-accent px-5 text-sm font-700 text-accent-foreground transition-all hover:shadow-[0_0_20px_-4px_rgba(196,154,69,0.7)] disabled:opacity-50 cursor-pointer">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Сохранить
        </button>
        <button onClick={() => router.push('/admin/blog')} disabled={pending}
          className="min-h-11 rounded-xl border border-input px-5 text-sm font-600 text-muted-foreground transition-colors hover:text-foreground cursor-pointer">
          Отмена
        </button>
      </div>
    </div>
  )
}
