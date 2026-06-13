'use client'

import { Canvas } from '@react-three/fiber'
import { useGLTF, OrbitControls, Bounds } from '@react-three/drei'
import { Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'
import { Loader2, RotateCw } from 'lucide-react'

// Render the GLB as a clean gold "blueprint" mesh (no textures): only the
// significant edges (EdgesGeometry by face-angle), not every triangle — so a
// high-poly model reads as a crisp wireframe, not a solid gold blob. Sits on
// the Maintenance Center's fog + grid. Draco GLB decoded via drei CDN decoder.
const EDGE_THRESHOLD_DEG = 22

function WireModel({ url, onReady }: { url: string; onReady: () => void }) {
  const { scene } = useGLTF(url)
  const obj = useMemo(() => {
    const group = new THREE.Group()
    scene.updateWorldMatrix(true, true)
    const mat = new THREE.LineBasicMaterial({ color: '#CDA64E', transparent: true, opacity: 0.6 })
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (mesh.isMesh && mesh.geometry) {
        const edges = new THREE.EdgesGeometry(mesh.geometry, EDGE_THRESHOLD_DEG)
        const seg = new THREE.LineSegments(edges, mat)
        seg.applyMatrix4(mesh.matrixWorld)
        group.add(seg)
      }
    })
    // normalize orientation: a car's shortest dimension is its height — make
    // that axis vertical so models from different exporters (Y-up GLB vs
    // Z-up FBX) all stand on their wheels.
    const size = new THREE.Box3().setFromObject(group).getSize(new THREE.Vector3())
    const min = Math.min(size.x, size.y, size.z)
    if (min === size.z) group.rotateX(-Math.PI / 2)
    else if (min === size.x) group.rotateZ(Math.PI / 2)
    return group
  }, [scene])

  useEffect(() => { onReady() }, [onReady])
  return <primitive object={obj} />
}

export function Model3D({ src, className }: { src: string; poster?: string; className?: string }) {
  const [mounted, setMounted] = useState(false)
  const [loaded, setLoaded] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  const onReady = useCallback(() => setLoaded(true), [])

  if (!mounted) {
    return (
      <div className={className} style={{ display: 'grid', placeItems: 'center' }}>
        <Loader2 className="h-6 w-6 animate-spin text-accent/70" />
      </div>
    )
  }

  return (
    <div className={className} style={{ position: 'relative' }}>
      <Canvas
        // wide near/far so close-up framing never clips the model (no "invisible edge")
        camera={{ position: [3.6, 1.5, 4.6], fov: 38, near: 0.01, far: 100 }}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        // cap DPR — mobile retina at 2–3× murders fps/load for little gain here
        dpr={[1, 1.5]}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          {/* fit + observe (no `clip`: clip tightens near/far and crops geometry up close) */}
          <Bounds fit observe margin={1.15}>
            <WireModel url={src} onReady={onReady} />
          </Bounds>
        </Suspense>
        <OrbitControls
          enablePan={false} enableZoom enableDamping
          autoRotate autoRotateSpeed={0.7}
          minDistance={2.5} maxDistance={12}
        />
      </Canvas>

      {/* visible loading state until the model is parsed + edges built */}
      {!loaded && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin text-accent/70" />
          <span className="text-[11px]">Загрузка 3D…</span>
        </div>
      )}
      {loaded && (
        <span className="pointer-events-none absolute bottom-2 right-2 flex items-center gap-1 rounded-full border border-glass-border bg-black/40 px-2 py-1 text-[10px] text-muted-foreground backdrop-blur-md">
          <RotateCw className="h-3 w-3" /> Вращайте
        </span>
      )}
    </div>
  )
}
