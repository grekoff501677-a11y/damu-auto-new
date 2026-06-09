'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Save } from 'lucide-react'
import { TextField, TextArea, SelectField, Toggle, Label } from '@/components/admin/AdminField'
import { saveProduct, type ProductInput } from './actions'
import { cn } from '@/lib/utils'
import type { CarModel } from '@/lib/types'

const CATEGORIES = [
  { value: 'oil',        label: 'Масло' },
  { value: 'filter',     label: 'Фильтр' },
  { value: 'fluid',      label: 'Жидкость' },
  { value: 'spark_plug', label: 'Свечи' },
  { value: 'other',      label: 'Другое' },
]

type Props = {
  models: CarModel[]
  initial?: Partial<ProductInput>
}

export function ProductForm({ models, initial }: Props) {
  const router = useRouter()
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [f, setF] = useState<ProductInput>({
    id: initial?.id,
    name: initial?.name ?? '',
    slug: initial?.slug ?? '',
    short_desc: initial?.short_desc ?? '',
    description: initial?.description ?? '',
    category: initial?.category ?? 'oil',
    oem_number: initial?.oem_number ?? '',
    kaspi_url: initial?.kaspi_url ?? '',
    images: initial?.images ?? [],
    is_available: initial?.is_available ?? true,
    is_featured: initial?.is_featured ?? false,
    compatibility: initial?.compatibility ?? [],
  })
  const [imagesText, setImagesText] = useState((initial?.images ?? []).join('\n'))

  function set<K extends keyof ProductInput>(k: K, v: ProductInput[K]) {
    setF((p) => ({ ...p, [k]: v }))
  }

  function toggleModel(id: string) {
    setF((p) => ({ ...p, compatibility: p.compatibility.includes(id) ? p.compatibility.filter(x => x !== id) : [...p.compatibility, id] }))
  }

  function submit() {
    setError(null)
    const payload = { ...f, images: imagesText.split('\n').map(s => s.trim()).filter(Boolean) }
    start(async () => {
      const r = await saveProduct(payload)
      if (r?.error) setError(r.error)
      // success → server action redirects
    })
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <TextField label="Название" id="name" value={f.name} onChange={(v) => set('name', v)} required placeholder="Моторное масло Geely 5W-30" />
        <TextField label="Slug (необязательно)" id="slug" value={f.slug} onChange={(v) => set('slug', v)} placeholder="авто из названия" />
        <TextField label="OEM-номер" id="oem" value={f.oem_number} onChange={(v) => set('oem_number', v)} required placeholder="2304100XGW01A" />
        <SelectField label="Категория" id="cat" value={f.category} onChange={(v) => set('category', v)} options={CATEGORIES} />
      </div>

      <TextField label="Ссылка на Kaspi.kz" id="kaspi" value={f.kaspi_url} onChange={(v) => set('kaspi_url', v)} required placeholder="https://kaspi.kz/shop/p/..." />
      <TextField label="Краткое описание" id="short" value={f.short_desc} onChange={(v) => set('short_desc', v)} placeholder="5W-30 · 4 л" />
      <TextArea label="Полное описание" id="desc" value={f.description} onChange={(v) => set('description', v)} rows={5} />
      <TextArea label="Изображения (по одному URL в строке)" id="imgs" value={imagesText} onChange={setImagesText} rows={3} hint="Ссылки на фото товара" />

      <div>
        <Label>Совместимость с моделями</Label>
        <div className="flex flex-wrap gap-2">
          {models.map((m) => {
            const on = f.compatibility.includes(m.id)
            return (
              <button key={m.id} type="button" onClick={() => toggleModel(m.id)}
                className={cn('min-h-10 rounded-lg border px-3 text-sm transition-colors cursor-pointer',
                  on ? 'border-accent bg-accent/10 text-accent' : 'border-input text-muted-foreground hover:text-foreground')}>
                {m.brand} {m.name}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-6 pt-1">
        <Toggle label="Доступен" checked={f.is_available} onChange={(v) => set('is_available', v)} />
        <Toggle label="Рекомендуемый" checked={f.is_featured} onChange={(v) => set('is_featured', v)} />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button onClick={submit} disabled={pending}
          className="flex min-h-11 items-center gap-2 rounded-xl bg-accent px-5 text-sm font-700 text-accent-foreground transition-all hover:shadow-[0_0_20px_-4px_rgba(196,154,69,0.7)] disabled:opacity-50 cursor-pointer">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Сохранить
        </button>
        <button onClick={() => router.push('/admin/products')} disabled={pending}
          className="min-h-11 rounded-xl border border-input px-5 text-sm font-600 text-muted-foreground transition-colors hover:text-foreground cursor-pointer">
          Отмена
        </button>
      </div>
    </div>
  )
}
