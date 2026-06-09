import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { DeleteProductButton } from './DeleteProductButton'
import { Plus, Pencil, Package, Star } from 'lucide-react'
import type { Product } from '@/lib/types'

export const metadata = { title: 'Товары · Админ' }

export default async function AdminProductsPage() {
  const supabase = await createClient()
  const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
  const products = (data ?? []) as Product[]

  return (
    <div>
      <AdminHeader
        title="Товары"
        desc={`Всего: ${products.length}`}
        action={
          <Link href="/admin/products/new">
            <button className="flex min-h-11 items-center gap-2 rounded-xl bg-accent px-4 text-sm font-700 text-accent-foreground transition-all hover:shadow-[0_0_20px_-4px_rgba(196,154,69,0.7)] cursor-pointer">
              <Plus className="h-4 w-4" /> Добавить
            </button>
          </Link>
        }
      />

      {products.length === 0 ? (
        <div className="glass flex flex-col items-center justify-center rounded-2xl p-12 text-center">
          <Package className="mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Товаров пока нет. Нажмите «Добавить».</p>
        </div>
      ) : (
        <div className="glass divide-y divide-glass-border rounded-2xl">
          {products.map((p) => (
            <div key={p.id} className="flex items-center gap-4 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-600 text-foreground">{p.name}</p>
                  {p.is_featured && <Star className="h-3.5 w-3.5 shrink-0 text-accent" />}
                  {!p.is_available && <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-muted-foreground">скрыт</span>}
                </div>
                <p className="mt-0.5 font-mono text-[11px] text-muted-foreground">OEM {p.oem_number} · {p.category}</p>
              </div>
              <Link href={`/admin/products/${p.id}`} className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent/10 hover:text-accent cursor-pointer" aria-label="Редактировать">
                <Pencil className="h-4 w-4" />
              </Link>
              <DeleteProductButton id={p.id} name={p.name} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
