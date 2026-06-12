import { createClient } from '@/lib/supabase/server'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { resolveBlocks } from '@/lib/page-sections'
import { ensureSystemBlocks } from './actions'
import { SectionManager } from './SectionManager'

export const metadata = { title: 'Конструктор главной · Админ' }
export const dynamic = 'force-dynamic'

export default async function AdminSectionsPage() {
  // make sure the 5 system blocks exist as real rows (gives them ids)
  await ensureSystemBlocks()

  const supabase = await createClient()
  const { data } = await supabase
    .from('page_sections')
    .select('id, section_key, sort_order, is_visible, config')
    .eq('page', 'home')

  // after ensureSystemBlocks every block has a real id; filter guards the type
  const blocks = resolveBlocks(data ?? [])
    .filter((b): b is typeof b & { id: string } => b.id !== null)
    .map((b) => ({
      id: b.id, type: b.type, label: b.label, note: b.note,
      system: b.system, visible: b.visible, config: b.config,
    }))

  return (
    <div>
      <AdminHeader
        title="Конструктор главной"
        desc="Перетаскивайте блоки за ручку, скрывайте, редактируйте тексты и кнопки. Добавляйте свои блоки из библиотеки. Справа — живое превью."
      />
      <SectionManager initial={blocks} />
    </div>
  )
}
