'use client'

import { Canvas } from '@react-three/fiber'
import { useGLTF, OrbitControls, Bounds } from '@react-three/drei'
import { Suspense, useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'
import { Loader2, RotateCw } from 'lucide-react'

// Render the GLB as a clean gold "blueprint" mesh (no textures): only the
// significant edges (EdgesGeometry by face-angle), not every triangle — so a
// high-poly model reads as a crisp wireframe, not a solid gold blob. Sits on
// the Maintenance Center's fog + grid. Draco GLB decoded via drei CDN decoder.
const EDGE_THRESHOLD_DEG = 22

function WireModel({ url }: { url: string }) {
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
    return group
  }, [scene])
  return <primitive object={obj} />
}

export function Model3D({ src, className }: { src: string; poster?: string; className?: string }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

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
        camera={{ position: [3.6, 1.5, 4.6], fov: 38 }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 2]}
        style={{ background: 'transparent' }}
      >
        <Suspense fallback={null}>
          <Bounds fit clip observe margin={1.15}>
            <WireModel url={src} />
          </Bounds>
        </Suspense>
        <OrbitControls
          enablePan={false} enableZoom enableDamping
          autoRotate autoRotateSpeed={0.7}
          minDistance={2.5} maxDistance={12}
        />
      </Canvas>
      <span className="pointer-events-none absolute bottom-2 right-2 flex items-center gap-1 rounded-full border border-glass-border bg-black/40 px-2 py-1 text-[10px] text-muted-foreground backdrop-blur-md">
        <RotateCw className="h-3 w-3" /> Вращайте
      </span>
    </div>
  )
}
