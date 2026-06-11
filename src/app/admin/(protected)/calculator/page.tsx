import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { AddRuleForm } from './AddRuleForm'
import { DeleteRuleButton } from './DeleteRuleButton'
import { cn } from '@/lib/utils'
import type { CarModel, MaintenanceRule, Product } from '@/lib/types'

type RuleRow = MaintenanceRule & { product: Pick<Product, 'name'> | Pick<Product, 'name'>[] | null }

export const metadata = { title: 'Калькулятор ТО · Админ' }

export default async function AdminCalculatorPage({ searchParams }: { searchParams: Promise<{ model?: string }> }) {
  const { model } = await searchParams
  const supabase = await createClient()

  const [{ data: modelsData }, { data: productsData }] = await Promise.all([
    supabase.from('car_models').select('*').order('sort_order'),
    supabase.from('products').select('id, name').order('name'),
  ])
  const models = (modelsData ?? []) as CarModel[]
  const products = (productsData ?? []) as Pick<Product, 'id' | 'name'>[]
  const active = models.find((m) => m.slug === model) ?? models[0]

  let rules: RuleRow[] = []
  if (active) {
    const { data } = await supabase.from('maintenance_rules').select('*, product:products(name)')
      .eq('car_model_id', active.id)
      .order('interval_km', { ascending: true })
    rules = (data ?? []) as RuleRow[]
  }

  return (
    <div>
      <AdminHeader title="Калькулятор ТО" desc="Интервалы замены и проверки по моделям" />

      {/* Model tabs */}
      <div className="no-scrollbar mb-5 flex gap-2 overflow-x-auto pb-1">
        {models.map((m) => (
          <Link key={m.id} href={`/admin/calculator?model=${m.slug}`}
            className={cn('min-h-10 shrink-0 rounded-lg border px-4 text-sm font-600 leading-10 transition-colors cursor-pointer',
              active?.id === m.id ? 'border-accent bg-accent/10 text-accent' : 'border-input text-muted-foreground hover:text-foreground')}>
            {m.brand} {m.name}
          </Link>
        ))}
      </div>

      {active && <AddRuleForm carModelId={active.id} products={products} />}

      {/* Rules list */}
      <div className="glass mt-4 overflow-hidden rounded-2xl">
        {rules.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">Для модели {active?.name} правил пока нет.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-glass-border text-xs uppercase tracking-wide text-muted-foreground">
                <th className="p-3 font-500">Деталь</th>
                <th className="p-3 font-500">Тип</th>
                <th className="p-3 font-500">Интервал</th>
                <th className="p-3 font-500">Спецификация</th>
                <th className="p-3 font-500">Товар</th>
                <th className="p-3 font-500"></th>
              </tr>
            </thead>
            <tbody>
              {rules.map((r) => {
                const linked = Array.isArray(r.product) ? r.product[0] : r.product
                return (
                <tr key={r.id} className="border-b border-glass-border last:border-0">
                  <td className="p-3 font-600 text-foreground">{r.product_name}</td>
                  <td className="p-3">
                    <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-600 uppercase',
                      r.rule_type === 'replace' ? 'bg-accent/15 text-accent' : 'bg-amber-400/15 text-amber-400')}>
                      {r.rule_type === 'replace' ? 'Замена' : 'Проверка'}
                    </span>
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {r.interval_km ? `${r.interval_km.toLocaleString('ru')} км` : ''}
                    {r.interval_km && r.interval_months ? ' · ' : ''}
                    {r.interval_months ? `${r.interval_months} мес` : ''}
                  </td>
                  <td className="p-3 text-muted-foreground">{r.spec_hint || '—'}</td>
                  <td className="p-3 text-muted-foreground">{linked?.name || '—'}</td>
                  <td className="p-3 text-right"><DeleteRuleButton id={r.id} /></td>
                </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
