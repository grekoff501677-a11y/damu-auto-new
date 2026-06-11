import 'server-only'
import { createClient } from '@/lib/supabase/server'
import type { BodyNode, BlueprintData } from '@/components/calculator/VehicleBlueprint'
import { getBlueprint } from '@/lib/vehicle-blueprints'
import { resolveSections, type ResolvedSection } from '@/lib/page-sections'
import type { Product, CarModel, BlogPost } from '@/lib/types'

const KASPI_FALLBACK = 'https://kaspi.kz/shop'

// ============================================================
// Catalog
// ============================================================
export type PublicProduct = {
  id: string
  name: string
  slug: string
  category: string
  oem: string
  short: string
  description: string
  kaspiUrl: string
  images: string[]
  models: string[]   // compatible model names
  hue: number
}

const CATEGORY_HUE: Record<string, number> = {
  oil: 45, filter: 150, fluid: 200, spark_plug: 25, other: 220,
}

export async function getCatalogProducts(): Promise<PublicProduct[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*, product_compatibility(car_models(name))')
    .eq('is_available', true)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })

  type Row = Product & { product_compatibility?: { car_models: { name: string } | null }[] }

  return ((data ?? []) as Row[]).map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    category: p.category,
    oem: p.oem_number,
    short: p.short_desc ?? '',
    description: p.description ?? '',
    kaspiUrl: p.kaspi_url || KASPI_FALLBACK,
    images: p.images ?? [],
    models: (p.product_compatibility ?? []).map((c) => c.car_models?.name).filter(Boolean) as string[],
    hue: CATEGORY_HUE[p.category] ?? 210,
  }))
}

export const CATEGORY_LABELS: { id: string; label: string }[] = [
  { id: 'all',        label: 'Всё' },
  { id: 'oil',        label: 'Масла' },
  { id: 'filter',     label: 'Фильтры' },
  { id: 'fluid',      label: 'Жидкости' },
  { id: 'spark_plug', label: 'Свечи' },
  { id: 'other',      label: 'Другое' },
]

// ============================================================
// Car models
// ============================================================
export async function getCarModels(): Promise<CarModel[]> {
  const supabase = await createClient()
  const { data } = await supabase.from('car_models').select('*').eq('is_active', true).order('sort_order')
  return (data ?? []) as CarModel[]
}

// ============================================================
// Maintenance (build milestones from per-part interval rules)
// ============================================================
export type PublicPart = {
  name: string
  type: 'replace' | 'inspect'
  spec: string
  node: BodyNode
  kaspiUrl: string
}
export type PublicMilestone = { km: number; months: number; parts: PublicPart[] }
export type PublicMaintModel = {
  slug: string; brand: string; name: string
  milestones: PublicMilestone[]
  blueprint?: BlueprintData
}

function inferNode(name: string): BodyNode {
  const n = name.toLowerCase()
  if (/салон/.test(n)) return 'cabin'
  if (/тормоз|колодк|суппорт/.test(n)) return 'brakes'
  if (/антифриз|охлажд|радиатор|термостат/.test(n)) return 'cooling'
  if (/акпп|dct|трансмис|коробк|сцеплен/.test(n)) return 'transmission'
  return 'engine' // масло, фильтры, свечи и пр.
}

type RuleRow = {
  product_name: string
  rule_type: 'replace' | 'inspect'
  interval_km: number | null
  interval_months: number | null
  spec_hint: string | null
  // linked catalog product (via product_id); PostgREST returns an object for
  // many-to-one embeds, but the client's inferred type is an array — allow both
  products?: { kaspi_url: string | null } | { kaspi_url: string | null }[] | null
}

function buildMilestones(rules: RuleRow[]): PublicMilestone[] {
  const kmRules = rules.filter((r) => r.interval_km && r.interval_km > 0)
  if (!kmRules.length) return []
  const maxKm = Math.max(...kmRules.map((r) => r.interval_km as number))
  const STEP = 10000
  const out: PublicMilestone[] = []
  for (let km = STEP; km <= maxKm; km += STEP) {
    const parts = kmRules
      .filter((r) => km % (r.interval_km as number) === 0)
      .map<PublicPart>((r) => {
        const linked = Array.isArray(r.products) ? r.products[0] : r.products
        return {
          name: r.product_name,
          type: r.rule_type,
          spec: r.spec_hint ?? '',
          node: inferNode(r.product_name),
          kaspiUrl: linked?.kaspi_url || KASPI_FALLBACK,
        }
      })
    if (parts.length) out.push({ km, months: Math.round((km / STEP) * 6), parts })
  }
  return out
}

export async function getMaintenanceModels(): Promise<PublicMaintModel[]> {
  const supabase = await createClient()
  const [{ data: models }, { data: rules }] = await Promise.all([
    supabase.from('car_models').select('*').eq('is_active', true).order('sort_order'),
    supabase.from('maintenance_rules').select('car_model_id, product_name, rule_type, interval_km, interval_months, spec_hint, products(kaspi_url)'),
  ])

  const byModel = new Map<string, RuleRow[]>()
  for (const r of (rules ?? []) as (RuleRow & { car_model_id: string })[]) {
    const arr = byModel.get(r.car_model_id) ?? []
    arr.push(r)
    byModel.set(r.car_model_id, arr)
  }

  return ((models ?? []) as CarModel[]).map((m) => {
    // DB blueprint takes precedence; fall back to the code config.
    const dbHotspots = Array.isArray(m.blueprint_nodes) ? m.blueprint_nodes : []
    const blueprint: BlueprintData | undefined = m.blueprint_url
      ? { image: m.blueprint_url, hotspots: dbHotspots }
      : getBlueprint(m.slug)
    return {
      slug: m.slug,
      brand: m.brand,
      name: m.name,
      milestones: buildMilestones(byModel.get(m.id) ?? []),
      blueprint,
    }
  })
}

// ============================================================
// Blog
// ============================================================
export async function getPublishedPosts(): Promise<BlogPost[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .order('published_at', { ascending: false })
  return (data ?? []) as BlogPost[]
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const supabase = await createClient()
  const { data } = await supabase.from('blog_posts').select('*').eq('slug', slug).eq('published', true).single()
  return (data as BlogPost) ?? null
}

// ============================================================
// Home page sections (visible, ordered). Falls back to registry
// defaults if the page_sections table is empty/not yet migrated.
// ============================================================
export async function getHomeSections(): Promise<ResolvedSection[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('page_sections')
    .select('section_key, sort_order, is_visible, config')
    .eq('page', 'home')
  return resolveSections(data ?? []).filter((s) => s.visible)
}
