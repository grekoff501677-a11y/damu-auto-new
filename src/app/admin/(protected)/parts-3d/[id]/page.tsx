import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PartsEditor } from '../PartsEditor'
import type { CarModel } from '@/lib/types'

export const metadata = { title: 'Детали на 3D · Админ' }

export default async function EditParts3DPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('car_models').select('*').eq('id', id).single()
  if (!data) notFound()
  return <PartsEditor model={data as CarModel} />
}
