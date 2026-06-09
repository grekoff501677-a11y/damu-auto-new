'use client'

import { useTransition } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteRule } from './actions'

export function DeleteRuleButton({ id }: { id: string }) {
  const [pending, start] = useTransition()
  return (
    <button onClick={() => start(() => { deleteRule(id) })} disabled={pending}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive cursor-pointer" aria-label="Удалить">
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
    </button>
  )
}
