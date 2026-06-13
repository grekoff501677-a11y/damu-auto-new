'use client'

import { Canvas } from '@react-three/fiber'
import { Bounds, OrbitControls, useGLTF, useProgress } from '@react-three/drei'
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'
import { Loader2, RotateCw } from 'lucide-react'

// Significant edges only: this keeps high-poly cars readable and cuts the
// amount of generated line geometry versus drawing every triangle edge.
const EDGE_THRESHOLD_DEG = 35

const MODEL_ROTATION_FIX: Record<string, [number, number, number]> = {
  // Coolray uses the same exporter axis as Monjaro. Keep the exception explicit
  // so we can tune this model without touching the generic normalization.
  'geely-coolray': [Math.PI / 2, 0, 0],
}

const edgeCache = new Map<string, THREE.Group>()

function WireModel({ url, modelKey, onReady }: { url: string; modelKey?: string; onReady: () => void }) {
  const { scene } = useGLTF(url)

  const obj = useMemo(() => {
    const cacheKey = `${modelKey ?? 'model'}:${url}`
    const cached = edgeCache.get(cacheKey)
    if (cached) return cached.clone(true)

    const group = new THREE.Group()
    const mat = new THREE.LineBasicMaterial({ color: '#CDA64E', transparent: true, opacity: 0.6 })

    scene.updateWorldMatrix(true, true)
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (mesh.isMesh && mesh.geometry) {
        const edges = new THREE.EdgesGeometry(mesh.geometry, EDGE_THRESHOLD_DEG)
        const seg = new THREE.LineSegments(edges, mat)
        seg.applyMatrix4(mesh.matrixWorld)
        group.add(seg)
      }
    })

    // A car's shortest dimension is usually height. Make that axis vertical so
    // Y-up and Z-up exports stand on their wheels before per-model tweaks.
    const size = new THREE.Box3().setFromObject(group).getSize(new THREE.Vector3())
    const min = Math.min(size.x, size.y, size.z)
    if (min === size.z) group.rotateX(-Math.PI / 2)
    else if (min === size.x) group.rotateZ(Math.PI / 2)

    const fix = modelKey ? MODEL_ROTATION_FIX[modelKey] : undefined
    if (fix) group.rotateX(fix[0]).rotateY(fix[1]).rotateZ(fix[2])

    const center = new THREE.Box3().setFromObject(group).getCenter(new THREE.Vector3())
    group.position.sub(center)

    edgeCache.set(cacheKey, group)
    return group.clone(true)
  }, [scene, url, modelKey])

  useEffect(() => { onReady() }, [onReady])
  return <primitive object={obj} />
}

function ModelLoadingOverlay({ loaded }: { loaded: boolean }) {
  const { active, progress } = useProgress()
  if (loaded) return null

  const visibleProgress = Math.max(4, Math.round(progress || 0))
  const label = active && visibleProgress < 100 ? `Загрузка 3D · ${visibleProgress}%` : 'Строим каркас…'

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-4">
      <div className="min-w-[178px] rounded-2xl border border-glass-border bg-surface/75 px-4 py-3 shadow-[0_18px_60px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent shadow-[0_0_18px_-8px_rgba(196,154,69,0.9)]">
            <Loader2 className="h-4 w-4 animate-spin" />
          </span>
          <span className="text-[11px] font-600 uppercase tracking-wide text-foreground/80">{label}</span>
        </div>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-accent shadow-[0_0_12px_rgba(196,154,69,0.7)] transition-[width] duration-300"
            style={{ width: `${active ? visibleProgress : 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}

export function Model3D({ src, modelKey, className }: { src: string; modelKey?: string; poster?: string; className?: string }) {
  const [loaded, setLoaded] = useState(false)
  const onReady = useCallback(() => setLoaded(true), [])

  return (
    <div className={className} style={{ position: 'relative' }}>
      <Canvas
        camera={{ position: [4.2, 1.8, 5.4], fov: 35, near: 0.01, far: 100 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <Bounds fit observe margin={1.45}>
            <WireModel url={src} modelKey={modelKey} onReady={onReady} />
          </Bounds>
        </Suspense>
        <OrbitControls
          autoRotate
          autoRotateSpeed={0.7}
          enableDamping
          enablePan={false}
          enableZoom
          maxDistance={12}
          minDistance={2.5}
        />
      </Canvas>

      <ModelLoadingOverlay loaded={loaded} />

      {loaded && (
        <span className="pointer-events-none absolute bottom-2 right-2 flex items-center gap-1 rounded-full border border-glass-border bg-black/40 px-2 py-1 text-[10px] text-muted-foreground backdrop-blur-md">
          <RotateCw className="h-3 w-3" /> Вращайте
        </span>
      )}
    </div>
  )
}
