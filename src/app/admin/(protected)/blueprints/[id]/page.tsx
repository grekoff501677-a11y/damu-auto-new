import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { BlueprintEditor } from '../BlueprintEditor'
import { getBlueprint } from '@/lib/vehicle-blueprints'
import type { CarModel, BlueprintHotspot } from '@/lib/types'

export const metadata = { title: 'Редактор схемы · Админ' }

export default async function EditBlueprintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('car_models').select('*').eq('id', id).single()
  if (!data) notFound()
  const m = data as CarModel

  // Prefer DB; fall back to the code config so the editor is usable before the migration.
  const fallback = getBlueprint(m.slug)
  const dbHotspots: BlueprintHotspot[] = Array.isArray(m.blueprint_nodes) ? m.blueprint_nodes : []
  const hotspots: BlueprintHotspot[] = dbHotspots.length ? dbHotspots : (fallback?.hotspots ?? [])
  const initialUrl = m.blueprint_url || fallback?.image || ''

  return (
    <div>
      <AdminHeader title={`Схема: ${m.brand} ${m.name}`} desc="Кликните по изображению, чтобы добавить точку" />
      <BlueprintEditor
        modelId={m.id}
        modelName={`${m.brand} ${m.name}`}
        initialUrl={initialUrl}
        initialHotspots={hotspots}
      />
    </div>
  )
}
