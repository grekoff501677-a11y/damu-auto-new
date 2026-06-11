'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { BlueprintHotspot } from '@/lib/types'

export async function saveBlueprint(modelId: string, url: string, hotspots: BlueprintHotspot[]) {
  const supabase = await createClient()

  // sanitise hotspots
  const clean: BlueprintHotspot[] = (hotspots ?? []).slice(0, 30).map((h, i) => ({
    id: h.id || `n${i + 1}`,
    x: clamp(h.x),
    y: clamp(h.y),
    bodyNode: h.bodyNode,
    label: (h.label ?? '').slice(0, 60),
    line: h.line
      ? {
          x2: clamp(h.line.x2),
          y2: clamp(h.line.y2),
          ...(h.line.cx != null && h.line.cy != null
            ? {
                cx: clamp(h.line.cx),
                cy: clamp(h.line.cy),
                ...(h.line.kind === 'elbow' || h.line.kind === 'curve' ? { kind: h.line.kind } : {}),
              }
            : {}),
        }
      : undefined,
  }))

  const { error } = await supabase
    .from('car_models')
    .update({ blueprint_url: url.trim() || null, blueprint_nodes: clean })
    .eq('id', modelId)

  if (error) return { error: error.message }

  revalidatePath('/admin/blueprints')
  revalidatePath('/calculator')
  revalidatePath('/')
  return { success: true }
}

function clamp(n: number): number {
  if (typeof n !== 'number' || Number.isNaN(n)) return 0
  return Math.round(Math.min(100, Math.max(0, n)) * 10) / 10
}
