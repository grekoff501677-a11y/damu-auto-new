'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { LeadStatus } from '@/lib/types'

export async function updateLeadStatus(id: string, status: LeadStatus) {
  const supabase = await createClient()
  const { error } = await supabase.from('leads').update({ status }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/leads')
  return { success: true }
}

export async function deleteLead(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('leads').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/leads')
  return { success: true }
}
