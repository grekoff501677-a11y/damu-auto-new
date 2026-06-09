'use client'

import { useTransition } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteBlogPost } from './actions'

export function DeleteBlogButton({ id, title }: { id: string; title: string }) {
  const [pending, start] = useTransition()
  return (
    <button
      onClick={() => { if (confirm(`Удалить «${title}»?`)) start(() => { deleteBlogPost(id) }) }}
      disabled={pending}
      className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive cursor-pointer"
      aria-label="Удалить"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </button>
  )
}
