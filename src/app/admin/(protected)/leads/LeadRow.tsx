'use client'

import { useState, useTransition } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { updateLeadStatus, deleteLead } from './actions'
import type { Lead, LeadStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

const STATUS: { value: LeadStatus; label: string; cls: string }[] = [
  { value: 'new',       label: 'Новая',      cls: 'bg-accent/15 text-accent border-accent/30' },
  { value: 'contacted', label: 'В работе',   cls: 'bg-sky-400/15 text-sky-300 border-sky-400/30' },
  { value: 'closed',    label: 'Закрыта',    cls: 'bg-white/10 text-muted-foreground border-glass-border' },
]

export function LeadRow({ lead }: { lead: Lead }) {
  const [status, setStatus] = useState<LeadStatus>(lead.status)
  const [pending, start] = useTransition()
  const [deleted, setDeleted] = useState(false)

  if (deleted) return null

  function onStatus(next: LeadStatus) {
    setStatus(next)
    start(() => { updateLeadStatus(lead.id, next) })
  }

  function onDelete() {
    if (!confirm('Удалить заявку?')) return
    start(async () => { const r = await deleteLead(lead.id); if (r?.success) setDeleted(true) })
  }

  const date = new Date(lead.created_at).toLocaleString('ru', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })

  return (
    <tr className="border-b border-glass-border last:border-0">
      <td className="py-3 pr-3 align-top">
        <p className="font-600 text-foreground">{lead.name}</p>
        <a href={`tel:${lead.phone}`} className="text-xs text-accent hover:underline">{lead.phone}</a>
        {lead.car_model && <p className="mt-0.5 text-xs text-muted-foreground">{lead.car_model}</p>}
      </td>
      <td className="py-3 pr-3 align-top text-sm text-muted-foreground max-w-xs">
        {lead.message || <span className="text-muted-foreground/50">—</span>}
      </td>
      <td className="py-3 pr-3 align-top text-xs text-muted-foreground whitespace-nowrap">{date}</td>
      <td className="py-3 pr-3 align-top">
        <select
          value={status}
          onChange={(e) => onStatus(e.target.value as LeadStatus)}
          disabled={pending}
          className={cn('cursor-pointer rounded-lg border px-2.5 py-1.5 text-xs font-600 outline-none', STATUS.find(s => s.value === status)?.cls)}
        >
          {STATUS.map(s => <option key={s.value} value={s.value} className="bg-surface text-foreground">{s.label}</option>)}
        </select>
      </td>
      <td className="py-3 align-top">
        <button onClick={onDelete} disabled={pending} className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive cursor-pointer" aria-label="Удалить">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        </button>
      </td>
    </tr>
  )
}
