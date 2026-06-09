import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { ProductForm } from '../ProductForm'
import type { CarModel, Product } from '@/lib/types'

export const metadata = { title: 'Редактирование товара · Админ' }

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: product }, { data: models }, { data: compat }] = await Promise.all([
    supabase.from('products').select('*').eq('id', id).single(),
    supabase.from('car_models').select('*').order('sort_order'),
    supabase.from('product_compatibility').select('car_model_id').eq('product_id', id),
  ])

  if (!product) notFound()
  const p = product as Product

  return (
    <div>
      <AdminHeader title="Редактирование" desc={p.name} />
      <div className="glass rounded-2xl p-5 sm:p-6">
        <ProductForm
          models={(models ?? []) as CarModel[]}
          initial={{
            id: p.id,
            name: p.name,
            slug: p.slug,
            short_desc: p.short_desc ?? '',
            description: p.description ?? '',
            category: p.category,
            oem_number: p.oem_number,
            kaspi_url: p.kaspi_url,
            images: p.images ?? [],
            is_available: p.is_available,
            is_featured: p.is_featured,
            compatibility: (compat ?? []).map((c) => c.car_model_id),
          }}
        />
      </div>
    </div>
  )
}
