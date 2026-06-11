'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type RuleInput = {
  car_model_id: string
  product_id: string | null
  product_name: string
  rule_type: 'replace' | 'inspect'
  interval_km: number | null
  interval_months: number | null
  spec_hint: string
  sort_order: number
}

export async function addRule(input: RuleInput) {
  const supabase = await createClient()
  if (!input.product_name.trim()) return { error: 'Укажите название детали' }
  const { error } = await supabase.from('maintenance_rules').insert({
    car_model_id: input.car_model_id,
    product_id: input.product_id,
    product_name: input.product_name.trim(),
    rule_type: input.rule_type,
    interval_km: input.interval_km,
    interval_months: input.interval_months,
    spec_hint: input.spec_hint.trim() || null,
    sort_order: input.sort_order,
  })
  if (error) return { error: error.message }
  revalidatePath('/admin/calculator')
  return { success: true }
}

export async function deleteRule(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('maintenance_rules').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/calculator')
  return { success: true }
}
