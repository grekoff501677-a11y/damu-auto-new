import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { Pencil, Box } from 'lucide-react'
import type { CarModel } from '@/lib/types'

export const metadata = { title: 'Детали на 3D · Админ' }

export default async function AdminParts3DPage() {
  const supabase = await createClient()
  const { data } = await supabase.from('car_models').select('*').order('sort_order')
  const models = (data ?? []) as CarModel[]

  return (
    <div>
      <AdminHeader title="Детали на 3D-схеме" desc="Закрепление деталей (.glb) на кузове в блоке ТО" />
      <div className="glass divide-y divide-glass-border rounded-2xl">
        {models.map((m) => {
          const count = Array.isArray(m.model_3d_parts) ? m.model_3d_parts.length : 0
          return (
            <Link key={m.id} href={`/admin/parts-3d/${m.id}`} className="flex items-center gap-4 p-4 cursor-pointer hover:bg-brand-white/[0.02]">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Box className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-600 text-foreground">{m.brand} {m.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {!m.model_3d_url
                    ? 'Нет 3D-кузова — закреплять не на чем'
                    : count === 0 ? 'Деталей нет' : `Закреплено деталей: ${count}`}
                </p>
              </div>
              <span className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground">
                <Pencil className="h-4 w-4" />
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
