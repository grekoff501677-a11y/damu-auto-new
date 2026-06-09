import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export function AdminHeader({ title, desc, action }: { title: string; desc?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6">
      <Link href="/admin" className="mb-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground cursor-pointer">
        <ArrowLeft className="h-3.5 w-3.5" /> К панели
      </Link>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-700">{title}</h1>
          {desc && <p className="mt-1 text-sm text-muted-foreground">{desc}</p>}
        </div>
        {action}
      </div>
    </div>
  )
}
