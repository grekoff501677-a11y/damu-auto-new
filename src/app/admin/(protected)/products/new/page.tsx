import { createClient } from '@/lib/supabase/server'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { ProductForm } from '../ProductForm'
import type { CarModel } from '@/lib/types'

export const metadata = { title: 'Новый товар · Админ' }

export default async function NewProductPage() {
  const supabase = await createClient()
  const { data } = await supabase.from('car_models').select('*').order('sort_order')
  return (
    <div>
      <AdminHeader title="Новый товар" desc="Добавьте позицию в каталог" />
      <div className="glass rounded-2xl p-5 sm:p-6">
        <ProductForm models={(data ?? []) as CarModel[]} />
      </div>
    </div>
  )
}
