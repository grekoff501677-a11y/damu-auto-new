import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { BlueprintEditor } from '../BlueprintEditor'
import type { CarModel, BlueprintHotspot } from '@/lib/types'

export const metadata = { title: 'Редактор схемы · Админ' }

export default async function EditBlueprintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('car_models').select('*').eq('id', id).single()
  if (!data) notFound()
  const m = data as CarModel
  const hotspots: BlueprintHotspot[] = Array.isArray(m.blueprint_nodes) ? m.blueprint_nodes : []

  return (
    <div>
      <AdminHeader title={`Схема: ${m.brand} ${m.name}`} desc="Кликните по изображению, чтобы добавить точку" />
      <BlueprintEditor
        modelId={m.id}
        modelName={`${m.brand} ${m.name}`}
        initialUrl={m.blueprint_url ?? ''}
        initialHotspots={hotspots}
      />
    </div>
  )
}
