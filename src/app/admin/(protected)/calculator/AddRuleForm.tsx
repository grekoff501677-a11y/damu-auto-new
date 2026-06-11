'use client'

import { useState, useTransition } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { SelectField } from '@/components/admin/AdminField'
import { addRule } from './actions'
import { cn } from '@/lib/utils'
import type { Product } from '@/lib/types'

export function AddRuleForm({ carModelId, products }: { carModelId: string; products: Pick<Product, 'id' | 'name'>[] }) {
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [f, setF] = useState({
    product_name: '', rule_type: 'replace' as 'replace' | 'inspect',
    interval_km: '', interval_months: '', spec_hint: '', product_id: '',
  })

  function set<K extends keyof typeof f>(k: K, v: (typeof f)[K]) { setF((p) => ({ ...p, [k]: v })) }

  function submit() {
    setError(null)
    start(async () => {
      const r = await addRule({
        car_model_id: carModelId,
        product_id: f.product_id || null,
        product_name: f.product_name,
        rule_type: f.rule_type,
        interval_km: f.interval_km ? parseInt(f.interval_km, 10) : null,
        interval_months: f.interval_months ? parseInt(f.interval_months, 10) : null,
        spec_hint: f.spec_hint,
        sort_order: 0,
      })
      if (r?.error) setError(r.error)
      else setF({ product_name: '', rule_type: 'replace', interval_km: '', interval_months: '', spec_hint: '', product_id: '' })
    })
  }

  const inp = 'min-h-11 rounded-lg border border-input bg-surface/60 px-3 text-sm text-foreground outline-none focus:border-accent'

  return (
    <div className="glass rounded-2xl p-4">
      <p className="mb-3 text-xs font-600 uppercase tracking-widest text-accent">Добавить правило</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <input className={cn(inp, 'lg:col-span-2')} placeholder="Деталь (напр. Моторное масло)" value={f.product_name} onChange={(e) => set('product_name', e.target.value)} />
        <select className={cn(inp, 'cursor-pointer')} value={f.rule_type} onChange={(e) => set('rule_type', e.target.value as 'replace' | 'inspect')}>
          <option value="replace" className="bg-surface">Замена</option>
          <option value="inspect" className="bg-surface">Проверка</option>
        </select>
        <input className={inp} type="number" placeholder="км" value={f.interval_km} onChange={(e) => set('interval_km', e.target.value)} />
        <input className={inp} type="number" placeholder="мес" value={f.interval_months} onChange={(e) => set('interval_months', e.target.value)} />
        <input className={inp} placeholder="спец. (5W-30)" value={f.spec_hint} onChange={(e) => set('spec_hint', e.target.value)} />
      </div>
      <div className="mt-3 sm:max-w-md">
        <SelectField label="Связанный товар (необязательно)" id="rule-product" value={f.product_id}
          onChange={(v) => set('product_id', v)}
          options={[{ value: '', label: '— без привязки —' }, ...products.map((p) => ({ value: p.id, label: p.name }))]} />
      </div>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      <button onClick={submit} disabled={pending}
        className="mt-3 flex min-h-10 items-center gap-2 rounded-lg bg-accent px-4 text-sm font-700 text-accent-foreground transition-all hover:shadow-[0_0_18px_-4px_rgba(196,154,69,0.7)] disabled:opacity-50 cursor-pointer">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        Добавить
      </button>
    </div>
  )
}
