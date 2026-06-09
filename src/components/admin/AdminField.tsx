'use client'

import { cn } from '@/lib/utils'

const baseInput =
  'w-full rounded-xl border border-input bg-surface/60 px-4 py-2.5 text-sm text-foreground outline-none transition-all duration-200 focus:border-accent focus:shadow-[0_0_0_3px_rgba(196,154,69,0.14)] min-h-11'

export function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-600 text-muted-foreground">{children}</label>
}

export function TextField({ label, id, value, onChange, type = 'text', placeholder, required }: {
  label: string; id: string; value: string; onChange: (v: string) => void
  type?: string; placeholder?: string; required?: boolean
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}{required && <span className="text-accent"> *</span>}</Label>
      <input id={id} type={type} value={value} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)} className={baseInput} />
    </div>
  )
}

export function TextArea({ label, id, value, onChange, rows = 4, placeholder, hint }: {
  label: string; id: string; value: string; onChange: (v: string) => void
  rows?: number; placeholder?: string; hint?: string
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <textarea id={id} rows={rows} value={value} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)} className={cn(baseInput, 'resize-y')} />
      {hint && <p className="mt-1 text-[11px] text-muted-foreground/70">{hint}</p>}
    </div>
  )
}

export function SelectField({ label, id, value, onChange, options }: {
  label: string; id: string; value: string; onChange: (v: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={cn(baseInput, 'cursor-pointer')}>
        {options.map(o => <option key={o.value} value={o.value} className="bg-surface">{o.label}</option>)}
      </select>
    </div>
  )
}

export function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className="flex items-center gap-2.5 cursor-pointer">
      <span className={cn('relative h-6 w-11 rounded-full transition-colors', checked ? 'bg-accent' : 'bg-white/10')}>
        <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform', checked ? 'translate-x-5' : 'translate-x-0.5')} />
      </span>
      <span className="text-sm text-foreground">{label}</span>
    </button>
  )
}
