// ============================================================
// DAMU AUTO — TypeScript Types (mirrors database schema)
// ============================================================

export type BodyNode = 'engine' | 'cabin' | 'brakes' | 'transmission' | 'cooling'

/** A single annotation on a vehicle blueprint (positions are % of the image). */
export type BlueprintHotspot = {
  id: string
  x: number
  y: number
  /** ties the glow to a maintenance category; omit for a static annotation */
  bodyNode?: BodyNode
  label?: string
  /** optional leader line drawn from the dot to (x2,y2); label sits at the end.
   *  cx/cy = optional middle point: quadratic-bezier control for 'curve'
   *  (default when kind is omitted — legacy data), polyline corner for 'elbow'
   *  (technical-drawing callout: angled segment + bend). */
  line?: { x2: number; y2: number; cx?: number; cy?: number; kind?: 'curve' | 'elbow' }
}

export type CarModel = {
  id: string
  brand: string
  name: string
  full_name: string
  slug: string
  year_from: number | null
  year_to: number | null
  is_active: boolean
  sort_order: number
  created_at: string
  // blueprint (maintenance schematic)
  blueprint_url?: string | null
  blueprint_nodes?: BlueprintHotspot[] | null
  // optional optimized .glb shown in the Maintenance Center
  model_3d_url?: string | null
}

export type ProductCategory = 'oil' | 'filter' | 'fluid' | 'spark_plug' | 'other'

export type Product = {
  id: string
  name: string
  slug: string
  short_desc: string | null
  description: string | null
  category: ProductCategory
  oem_number: string
  kaspi_url: string
  images: string[]
  specifications: Record<string, string>
  is_available: boolean
  is_featured: boolean
  sort_order: number
  created_at: string
  updated_at: string
  // joined
  compatible_models?: CarModel[]
}

export type BlogCategory = 'update' | 'guide'

export type BlogPost = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  category: BlogCategory
  cover_image: string | null
  before_image: string | null
  after_image: string | null
  before_label: string
  after_label: string
  published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
  // joined
  products?: Product[]
}

export type MaintenanceRuleType = 'replace' | 'inspect'

export type MaintenanceRule = {
  id: string
  car_model_id: string
  product_id: string | null
  product_name: string
  rule_type: MaintenanceRuleType
  interval_km: number | null
  interval_months: number | null
  spec_hint: string | null
  sort_order: number
  created_at: string
  // joined
  product?: Product | null
}

export type LeadStatus = 'new' | 'contacted' | 'closed'
export type LeadSource = 'website' | 'calculator' | 'product'

export type Lead = {
  id: string
  name: string
  phone: string
  message: string | null
  car_model: string | null
  source: LeadSource
  status: LeadStatus
  metadata: Record<string, unknown>
  created_at: string
}

// ---- Form payloads ----
export type LeadFormData = {
  name: string
  phone: string
  message?: string
  car_model?: string
  source?: LeadSource
  metadata?: Record<string, unknown>
}

// ---- Calculator ----
export type MaintenanceChecklistItem = {
  rule: MaintenanceRule
  isDue: boolean       // true if interval_km <= inputKm OR interval_months <= inputMonths
}

export type MaintenanceChecklist = {
  mustReplace: MaintenanceChecklistItem[]
  shouldInspect: MaintenanceChecklistItem[]
}
