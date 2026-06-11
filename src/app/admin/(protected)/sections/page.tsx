import { createClient } from '@/lib/supabase/server'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { resolveSections } from '@/lib/page-sections'
import { SectionManager } from './SectionManager'

export const metadata = { title: 'Конструктор главной · Админ' }
export const dynamic = 'force-dynamic'

export default async function AdminSectionsPage() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('page_sections')
    .select('section_key, sort_order, is_visible, config')
    .eq('page', 'home')

  // include hidden sections too; resolveSections merges registry defaults
  const sections = resolveSections(data ?? []).map((s) => ({
    key: s.key,
    visible: s.visible,
    config: s.config,
  }))

  return (
    <div>
      <AdminHeader
        title="Конструктор главной"
        desc="Порядок, видимость и тексты секций главной страницы. Перетаскивайте стрелками, скрывайте ненужное, редактируйте подписи."
      />
      <SectionManager initial={sections} />
    </div>
  )
}
