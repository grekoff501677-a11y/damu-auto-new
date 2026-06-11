'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { SECTION_REGISTRY, type SectionConfig } from '@/lib/page-sections'

const VALID_KEYS = new Set(SECTION_REGISTRY.map((s) => s.key))

// clamp every string in the (shallow or one-level-nested) config so a huge
// payload can't be stored; the admin form only produces texts anyway
function clampConfig(config: SectionConfig): SectionConfig {
  const clampStr = (v: unknown) => (typeof v === 'string' ? v.slice(0, 2000) : v)
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

export async function saveSectionConfig(key: string, config: SectionConfig) {
  if (!VALID_KEYS.has(key)) return { error: 'Неизвестная секция' }
  const supabase = await createClient()
  const { error } = await supabase
    .from('page_sections')
    .upsert({ page: 'home', section_key: key, config: clampConfig(config) }, { onConflict: 'page,section_key' })
  if (error) return { error: error.message }
  await revalidateHome()
  return { success: true }
}

export async function setSectionVisible(key: string, isVisible: boolean) {
  if (!VALID_KEYS.has(key)) return { error: 'Неизвестная секция' }
  const supabase = await createClient()
  const { error } = await supabase
    .from('page_sections')
    .upsert({ page: 'home', section_key: key, is_visible: isVisible }, { onConflict: 'page,section_key' })
  if (error) return { error: error.message }
  await revalidateHome()
  return { success: true }
}

export async function reorderSections(orderedKeys: string[]) {
  const keys = orderedKeys.filter((k) => VALID_KEYS.has(k))
  if (!keys.length) return { error: 'Пустой порядок' }
  const supabase = await createClient()
  const rows = keys.map((key, i) => ({ page: 'home', section_key: key, sort_order: i + 1 }))
  const { error } = await supabase.from('page_sections').upsert(rows, { onConflict: 'page,section_key' })
  if (error) return { error: error.message }
  await revalidateHome()
  return { success: true }
}

export async function resetSectionConfig(key: string) {
  if (!VALID_KEYS.has(key)) return { error: 'Неизвестная секция' }
  const supabase = await createClient()
  const { error } = await supabase
    .from('page_sections')
    .upsert({ page: 'home', section_key: key, config: {} }, { onConflict: 'page,section_key' })
  if (error) return { error: error.message }
  await revalidateHome()
  return { success: true }
}
