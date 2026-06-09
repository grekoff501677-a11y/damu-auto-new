import { createClient } from '@/lib/supabase/server'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { LeadRow } from './LeadRow'
import type { Lead } from '@/lib/types'
import { Inbox } from 'lucide-react'

export const metadata = { title: 'Заявки · Админ' }

export default async function AdminLeadsPage() {
  const supabase = await createClient()
  const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false })
  const leads = (data ?? []) as Lead[]

  return (
    <div>
      <AdminHeader title="Заявки" desc={`Всего: ${leads.length}`} />

      {leads.length === 0 ? (
        <div className="glass flex flex-col items-center justify-center rounded-2xl p-12 text-center">
          <Inbox className="mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Заявок пока нет. Они появятся здесь после отправки формы на сайте.</p>
        </div>
      ) : (
        <div className="glass overflow-x-auto rounded-2xl p-4 sm:p-5">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-glass-border text-xs uppercase tracking-wide text-muted-foreground">
                <th className="pb-2 pr-3 font-500">Контакт</th>
                <th className="pb-2 pr-3 font-500">Сообщение</th>
                <th className="pb-2 pr-3 font-500">Дата</th>
                <th className="pb-2 pr-3 font-500">Статус</th>
                <th className="pb-2 font-500"></th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => <LeadRow key={l.id} lead={l} />)}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
