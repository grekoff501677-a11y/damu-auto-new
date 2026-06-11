'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type ProductInput = {
  id?: string
  name: string
  slug: string
  short_desc: string
  description: string
  category: string
  oem_number: string
  kaspi_url: string
  images: string[]
  is_available: boolean
  is_featured: boolean
  compatibility: string[] // car_model ids
}

function slugify(s: string) {
  return s.toLowerCase().trim()
    .replace(/[^a-z0-9а-я\s-]/gi, '')
    .replace(/\s+/g, '-')
    .slice(0, 80)
}

export async function saveProduct(input: ProductInput) {
  const supabase = await createClient()

  const row = {
    name: input.name.trim(),
    slug: (input.slug.trim() || slugify(input.name)),
    short_desc: input.short_desc.trim() || null,
    description: input.description.trim() || null,
    category: input.category,
    oem_number: input.oem_number.trim(),
    kaspi_url: input.kaspi_url.trim(),
    images: input.images.filter(Boolean),
    is_available: input.is_available,
    is_featured: input.is_featured,
  }

  if (!row.name || !row.oem_number || !row.kaspi_url) {
    return { error: 'Заполните название, OEM-номер и ссылку Kaspi' }
  }

  let productId = input.id
  if (productId) {
    const { error } = await supabase.from('products').update(row).eq('id', productId)
    if (error) return { error: error.message }
  } else {
    const { data, error } = await supabase.from('products').insert(row).select('id').single()
    if (error) return { error: error.message }
    productId = data.id
  }

  // rewrite compatibility
  if (productId) {
    const { error: delError } = await supabase
      .from('product_compatibility').delete().eq('product_id', productId)
    if (delError) return { error: `Совместимость не сохранена: ${delError.message}` }
    if (input.compatibility.length) {
      const { error: insError } = await supabase.from('product_compatibility').insert(
        input.compatibility.map((car_model_id) => ({ product_id: productId, car_model_id }))
      )
      if (insError) return { error: `Совместимость не сохранена: ${insError.message}` }
    }
  }

  revalidatePath('/admin/products')
  redirect('/admin/products')
}

export async function deleteProduct(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/products')
  return { success: true }
}
