import * as THREE from 'three'
import type { Node3DRegion } from '@/lib/types'
import type { BodyNode } from '@/components/calculator/VehicleBlueprint'

// Generic fallback node regions, derived from the model's NORMALIZED size
// (centered at origin, vertical = Y, longest horizontal axis = car length).
// Used until a model is hand-authored in the admin editor. Positions are
// approximate (a car's layout is roughly standard) — refine per model later.
export function defaultRegions(size: THREE.Vector3): Node3DRegion[] {
  const hx = size.x / 2, hy = size.y / 2, hz = size.z / 2
  const lengthIsX = size.x >= size.z
  const L = lengthIsX ? hx : hz          // half length
  const W = lengthIsX ? hz : hx          // half width
  // place a point given fractions along length / height / width
  const at = (fl: number, fh: number, fw: number) =>
    lengthIsX ? { x: fl * L, y: fh * hy, z: fw * W } : { x: fw * W, y: fh * hy, z: fl * L }
  const baseR = Math.min(L, W, hy) * 0.9

  const mk = (bodyNode: BodyNode, fl: number, fh: number, fw: number, rk = 1): Node3DRegion => ({
    id: `def-${bodyNode}`, bodyNode, shape: 'sphere', r: baseR * rk, ...at(fl, fh, fw),
  })

  return [
    mk('engine', 0.62, -0.1, 0, 1.05),       // front, low-mid (engine bay)
    mk('cooling', 0.82, -0.28, 0, 0.8),       // very front, low (radiator/grille)
    mk('cabin', -0.05, 0.45, 0, 1.0),         // centre, upper (cabin)
    mk('transmission', 0.18, -0.34, 0, 0.85), // centre-front, low (gearbox)
    mk('brakes', -0.55, -0.42, 0, 1.1),       // rear-low + wheels (brakes/suspension)
  ]
}

// Sample N points inside a region, denser toward the centre (soft cloud).
export function sampleRegion(region: Node3DRegion, n: number): { positions: Float32Array; sizes: Float32Array; seeds: Float32Array } {
  const positions = new Float32Array(n * 3)
  const sizes = new Float32Array(n)
  const seeds = new Float32Array(n)
  const cx = region.x, cy = region.y, cz = region.z
  for (let i = 0; i < n; i++) {
    let dx: number, dy: number, dz: number
    if (region.shape === 'box') {
      const g = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5 // ~gaussian [-1,1]
      dx = g() * (region.sx ?? 0.5); dy = g() * (region.sy ?? 0.5); dz = g() * (region.sz ?? 0.5)
    } else {
      const r = (region.r ?? 0.5) * Math.cbrt(Math.random()) * (0.55 + 0.45 * Math.random())
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      dx = r * Math.sin(phi) * Math.cos(theta)
      dy = r * Math.sin(phi) * Math.sin(theta)
      dz = r * Math.cos(phi)
    }
    positions[i * 3] = cx + dx
    positions[i * 3 + 1] = cy + dy
    positions[i * 3 + 2] = cz + dz
    sizes[i] = 0.5 + Math.random() * 1.6
    seeds[i] = Math.random() * Math.PI * 2
  }
  return { positions, sizes, seeds }
}
