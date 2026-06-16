'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Node3DRegion } from '@/lib/types'
import { sampleRegion } from '@/lib/node-regions'

// A glowing particle swarm marking a maintenance node region. Soft additive
// twinkling dots (computed in-shader, no texture), fading in when active.
const POINTS = 200

const vertex = /* glsl */ `
  attribute float aSize;
  attribute float aSeed;
  uniform float uTime;
  uniform float uScale;
  varying float vTw;
  void main() {
    float tw = 0.55 + 0.45 * sin(uTime * 1.6 + aSeed);
    vTw = tw;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * tw * uScale / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`

const fragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vTw;
  void main() {
    float d = length(gl_PointCoord - vec2(0.5));
    float a = smoothstep(0.5, 0.0, d);
    a *= a;
    gl_FragColor = vec4(uColor, a * uOpacity * (0.6 + 0.4 * vTw));
  }
`

export function NodeSwarm({ region, color, active }: { region: Node3DRegion; color: string; active: boolean }) {
  const matRef = useRef<THREE.ShaderMaterial>(null)

  const geom = useMemo(() => {
    const { positions, sizes, seeds } = sampleRegion(region, POINTS)
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    g.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1))
    return g
  }, [region])

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uScale: { value: 38 },
    uColor: { value: new THREE.Color(color) },
    uOpacity: { value: 0 },
  }), [color])

  useFrame((_, dt) => {
    const m = matRef.current
    if (!m) return
    m.uniforms.uTime.value += dt
    const target = active ? 1 : 0
    m.uniforms.uOpacity.value += (target - m.uniforms.uOpacity.value) * Math.min(1, dt * 4)
  })

  return (
    <points geometry={geom} frustumCulled={false}>
      <shaderMaterial
        ref={matRef}
        uniforms={uniforms}
        vertexShader={vertex}
        fragmentShader={fragment}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}
