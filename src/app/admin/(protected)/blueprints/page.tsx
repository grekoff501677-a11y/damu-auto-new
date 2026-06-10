import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { Pencil, Car } from 'lucide-react'
import type { CarModel } from '@/lib/types'

export const metadata = { title: 'Схемы авто · Админ' }

export default async function AdminBlueprintsPage() {
  const supabase = await createClient()
  const { data } = await supabase.from('car_models').select('*').order('sort_order')
  const models = (data ?? []) as CarModel[]

  return (
    <div>
      <AdminHeader title="Схемы авто (ТО)" desc="Изображение и интерактивные точки для блока ТО" />
      <div className="glass divide-y divide-glass-border rounded-2xl">
        {models.map((m) => {
          const count = Array.isArray(m.blueprint_nodes) ? m.blueprint_nodes.length : 0
          const has = !!m.blueprint_url
          return (
            <Link key={m.id} href={`/admin/blueprints/${m.id}`} className="flex items-center gap-4 p-4 cursor-pointer hover:bg-white/[0.02]">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Car className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-600 text-foreground">{m.brand} {m.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {has ? `Схема загружена · ${count} точек` : 'Схема не задана — показывается силуэт'}
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
