'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Check, Loader2, Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LeadSource } from '@/lib/types'

type Props = { source?: LeadSource; className?: string }

export function LeadForm({ source = 'website', className }: Props) {
  const [form, setForm] = useState({ name: '', phone: '', car_model: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading'); setError(null)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, source, metadata: { page: typeof window !== 'undefined' ? window.location.pathname : '' } }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error ?? 'Ошибка отправки')
      }
      setStatus('success')
      setForm({ name: '', phone: '', car_model: '', message: '' })
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Ошибка отправки')
    }
  }

  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className={cn('glass flex flex-col items-center justify-center rounded-3xl p-10 text-center', className)}
      >
        <motion.span
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 14 }}
          className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-accent/15 text-accent glow-accent"
        >
          <Check className="h-7 w-7" />
        </motion.span>
        <h3 className="font-heading text-xl font-700">Заявка отправлена</h3>
        <p className="mt-2 text-sm text-muted-foreground">Мы свяжемся с вами в ближайшее время.</p>
        <button onClick={() => setStatus('idle')} className="mt-6 text-sm font-600 text-accent hover:underline cursor-pointer">
          Отправить ещё одну
        </button>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={cn('glass space-y-5 rounded-3xl p-6 sm:p-8', className)}>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field id="name" label="Ваше имя" value={form.name} onChange={(v) => set('name', v)} required />
        <Field id="phone" label="Телефон" type="tel" value={form.phone} onChange={(v) => set('phone', v)} required />
      </div>
      <Field id="car_model" label="Модель авто (необязательно)" value={form.car_model} onChange={(v) => set('car_model', v)} />
      <Field id="message" label="Сообщение" value={form.message} onChange={(v) => set('message', v)} textarea />

      <AnimatePresence>
        {status === 'error' && (
          <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="text-sm text-destructive">{error}</motion.p>
        )}
      </AnimatePresence>

      <button
        type="submit"
        disabled={status === 'loading'}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-4 py-3.5 text-sm font-700 text-accent-foreground transition-all duration-200 hover:shadow-[0_0_24px_-4px_rgba(0,230,118,0.7)] disabled:opacity-60 cursor-pointer"
      >
        {status === 'loading' ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Отправка…</>
        ) : (
          <><Send className="h-4 w-4" /> Отправить заявку</>
        )}
      </button>
    </form>
  )
}

function Field({
  id, label, value, onChange, type = 'text', required, textarea,
}: {
  id: string; label: string; value: string; onChange: (v: string) => void
  type?: string; required?: boolean; textarea?: boolean
}) {
  const [focused, setFocused] = useState(false)
  const filled = value.length > 0
  const float = focused || filled

  const common = {
    id, value, required,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value),
    placeholder: ' ',
    className: cn(
      'peer w-full rounded-xl border bg-surface/60 px-4 pt-6 pb-2 text-sm text-foreground outline-none transition-all duration-200',
      focused
        ? 'border-accent shadow-[0_0_0_3px_rgba(0,230,118,0.12)]'
        : 'border-input hover:border-white/20'
    ),
  }

  return (
    <div className="relative">
      {textarea ? (
        <textarea {...common} rows={4} className={cn(common.className, 'resize-none')} />
      ) : (
        <input {...common} type={type} />
      )}
      <label
        htmlFor={id}
        className={cn(
          'pointer-events-none absolute left-4 transition-all duration-200',
          float ? 'top-2 text-[11px] text-accent' : 'top-4 text-sm text-muted-foreground'
        )}
      >
        {label}{required && <span className="text-accent"> *</span>}
      </label>
    </div>
  )
}
