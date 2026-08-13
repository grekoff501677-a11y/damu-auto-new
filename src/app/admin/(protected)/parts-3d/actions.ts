'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { BodyNode } from '@/components/calculator/VehicleBlueprint'
import type { Part3DPlacement } from '@/lib/types'

const BODY_NODES: BodyNode[] = ['engine', 'cooling', 'cabin', 'transmission', 'brakes']

export async function saveParts3D(modelId: string, parts: Part3DPlacement[]) {
  const supabase = await createClient()

  const clean: Part3DPlacement[] = (parts ?? []).slice(0, 12).map((p, i) => ({
    id: (p.id || `part${i + 1}`).slice(0, 40),
    label: (p.label ?? '').trim().slice(0, 60) || 'Деталь',
    url: (p.url ?? '').trim().slice(0, 500),
    // кузов нормализован в 3.4 по длинной оси, так что за ±2.5 уходить незачем
    x: coord(p.x), y: coord(p.y), z: coord(p.z),
    height: round(Math.min(1.5, Math.max(0.02, num(p.height, 0.2)))),
    ...(p.bodyNode && BODY_NODES.includes(p.bodyNode) ? { bodyNode: p.bodyNode } : {}),
  })).filter((p) => p.url)

  const { error } = await supabase
    .from('car_models')
    .update({ model_3d_parts: clean })
    .eq('id', modelId)

  if (error) return { error: error.message }

  revalidatePath('/admin/parts-3d')
  revalidatePath('/calculator')
  return { success: true }
}

function num(v: unknown, fallback: number): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback
}
function round(n: number): number { return Math.round(n * 1000) / 1000 }
function coord(v: unknown): number { return round(Math.min(2.5, Math.max(-2.5, num(v, 0)))) }
