'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { SYSTEM_SECTIONS, BLOCK_LIBRARY, type SectionConfig } from '@/lib/page-sections'

const LIBRARY_KEYS = new Set(BLOCK_LIBRARY.map((b) => b.key))

function clampConfig(config: SectionConfig): SectionConfig {
  const clampStr = (v: unknown) => (typeof v === 'string' ? v.slice(0, 4000) : v)
  const out: SectionConfig = {}
  for (const [k, v] of Object.entries(config)) {
    if (Array.isArray(v)) {
      out[k] = v.slice(0, 12).map((item) =>
        item && typeof item === 'object'
          ? Object.fromEntries(Object.entries(item as Record<string, unknown>).map(([ik, iv]) => [ik, clampStr(iv)]))
          : clampStr(item)
      )
    } else {
      out[k] = clampStr(v)
    }
  }
  return out
}

async function revalidateHome() {
  revalidatePath('/')
  revalidatePath('/admin/sections')
}

/** Ensure the five system blocks exist as real rows (so they have ids for
 *  reorder/edit). Called from the admin page before reading. */
export async function ensureSystemBlocks() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('page_sections').select('section_key').eq('page', 'home').eq('is_system', true)
  const have = new Set((data ?? []).map((r) => r.section_key))
  const missing = SYSTEM_SECTIONS.filter((s) => !have.has(s.key))
  if (missing.length) {
    await supabase.from('page_sections').insert(
      missing.map((s) => ({ page: 'home', section_key: s.key, is_system: true, sort_order: s.order, is_visible: true, config: {} }))
    )
  }
}

export async function addBlock(type: string): Promise<{ error: string } | { id: string; order: number }> {
  if (!LIBRARY_KEYS.has(type)) return { error: 'Неизвестный тип блока' }
  const supabase = await createClient()
  const { data: maxRow } = await supabase
    .from('page_sections').select('sort_order').eq('page', 'home')
    .order('sort_order', { ascending: false }).limit(1).maybeSingle()
  const nextOrder = (maxRow?.sort_order ?? 0) + 1
  const { data, error } = await supabase
    .from('page_sections')
    .insert({ page: 'home', section_key: type, is_system: false, sort_order: nextOrder, is_visible: true, config: {} })
    .select('id')
    .single()
  if (error) return { error: error.message }
  await revalidateHome()
  return { id: data.id as string, order: nextOrder }
}

export async function deleteBlock(id: string) {
  const supabase = await createClient()
  const { data } = await supabase.from('page_sections').select('is_system').eq('id', id).single()
  if (data?.is_system) return { error: 'Системный блок нельзя удалить (только скрыть)' }
  const { error } = await supabase.from('page_sections').delete().eq('id', id)
  if (error) return { error: error.message }
  await revalidateHome()
  return { success: true }
}

export async function setBlockVisible(id: string, isVisible: boolean) {
  const supabase = await createClient()
  const { error } = await supabase.from('page_sections').update({ is_visible: isVisible }).eq('id', id)
  if (error) return { error: error.message }
  await revalidateHome()
  return { success: true }
}

export async function saveBlockConfig(id: string, config: SectionConfig) {
  const supabase = await createClient()
  const { error } = await supabase.from('page_sections').update({ config: clampConfig(config) }).eq('id', id)
  if (error) return { error: error.message }
  await revalidateHome()
  return { success: true }
}

export async function reorderBlocks(orderedIds: string[]) {
  const supabase = await createClient()
  const results = await Promise.all(
    orderedIds.map((id, i) => supabase.from('page_sections').update({ sort_order: i + 1 }).eq('id', id))
  )
  const failed = results.find((r) => r.error)
  if (failed?.error) return { error: failed.error.message }
  await revalidateHome()
  return { success: true }
}
