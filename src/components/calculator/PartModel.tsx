'use client'

import { Component, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

// Деталь рисуется обычным мешем, а не каркасом: кузов — это схема, а деталь —
// предмет, и разница в подаче как раз и читается.
//
// Исходник — STEP AP203 из SolidWorks: в нём нет ни текстур, ни цветов (AP203
// вообще не несёт оформления). Зато SolidWorks сохранил имена тел, и вид
// собирается из них. В исходнике есть опечатка «Stell FIlter» — матчим мягко.
const MATERIALS: { match: RegExp; props: THREE.MeshStandardMaterialParameters }[] = [
  // фильтровальная бумага — та же бежевая гамма, что и в палитре
  { match: /paper/i,  props: { color: '#E3D3B3', roughness: 0.95, metalness: 0.0 } },
  // резиновое уплотнение
  { match: /rubber/i, props: { color: '#16222D', roughness: 1.0,  metalness: 0.0 } },
  // крышки — крашеный металл в охре
  { match: /cover/i,  props: { color: '#C09D51', roughness: 0.35, metalness: 0.65 } },
  // стальная сетка и центральная трубка
  { match: /ste?ll|steel|part/i, props: { color: '#8FA0AE', roughness: 0.4, metalness: 0.85 } },
]
const FALLBACK: THREE.MeshStandardMaterialParameters = { color: '#8FA0AE', roughness: 0.5, metalness: 0.6 }

const EMISSIVE = new THREE.Color('#E3D3B3')

type Props = {
  url: string
  /** центр детали в нормализованном пространстве модели */
  position: [number, number, number]
  /** высота детали в тех же единицах (реальный масштаб нечитаем — см. Model3D) */
  height: number
  label: string
  /** узел обслуживания активен — деталь горит сама, без наведения */
  active?: boolean
  onHoverChange?: (hovered: boolean) => void
}

// useGLTF на недоступной модели БРОСАЕТ исключение, а <Suspense> ловит промисы,
// но не ошибки — без границы 404 у детали уносит всю страницу целиком, а не
// только 3D-блок. Граница вшита в сам компонент, чтобы её нельзя было забыть.
class PartBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(error: unknown) {
    console.warn('[PartModel] деталь не загрузилась, схема отрисована без неё:', error)
  }
  render() { return this.state.failed ? null : this.props.children }
}

export function PartModel(props: Props) {
  return (
    // key по url: сменили ссылку — граница пробует загрузить заново
    <PartBoundary key={props.url}>
      <Suspense fallback={null}>
        <PartModelInner {...props} />
      </Suspense>
    </PartBoundary>
  )
}

function PartModelInner({ url, position, height, label, active = false, onHoverChange }: Props) {
  const { scene } = useGLTF(url)
  const [hovered, setHovered] = useState(false)
  const groupRef = useRef<THREE.Group>(null)
  // Клонируем сцену и вешаем свои материалы: исходник переиспользуется между
  // инстансами, а emissive мы гасим/зажигаем покадрово и не должны его делить.
  const object = useMemo(() => {
    const root = scene.clone(true)

    root.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (!mesh.isMesh) return
      const name = mesh.name || mesh.parent?.name || ''
      const hit = MATERIALS.find((m) => m.match.test(name))
      const mat = new THREE.MeshStandardMaterial({ ...(hit ? hit.props : FALLBACK) })
      mat.emissive = EMISSIVE.clone()
      mat.emissiveIntensity = 0
      mesh.material = mat
      mesh.castShadow = false
      mesh.receiveShadow = false
    })

    // Деталь приходит в метрах из CAD (фильтр ~37×47 мм) — в масштабе кузова это
    // несколько пикселей. Нормализуем по своей высоте, центрируем по объёму.
    const box = new THREE.Box3().setFromObject(root)
    const size = box.getSize(new THREE.Vector3())
    const centre = box.getCenter(new THREE.Vector3())
    root.position.sub(centre)

    const wrapper = new THREE.Group()
    wrapper.add(root)
    wrapper.scale.setScalar(size.y > 0 ? height / size.y : 1)

    return wrapper
  }, [scene, height])

  // материалы создаём мы, значит нам их и освобождать
  useEffect(() => () => {
    object.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (mesh.isMesh && mesh.material instanceof THREE.MeshStandardMaterial) mesh.material.dispose()
    })
  }, [object])

  useEffect(() => { onHoverChange?.(hovered) }, [hovered, onHoverChange])

  // Свечение: ровное когда узел активен, ярче под курсором, мягкий пульс —
  // чтобы деталь читалась как «живая точка», а не как вставленный объект.
  useFrame(({ clock }) => {
    const group = groupRef.current
    if (!group) return
    const target = hovered ? 0.85 : active ? 0.4 : 0.06
    const pulse = active || hovered ? 1 + 0.18 * Math.sin(clock.elapsedTime * 2.4) : 1
    // деталей семь, обход по графу каждый кадр стоит копейки
    group.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (!mesh.isMesh || !(mesh.material instanceof THREE.MeshStandardMaterial)) return
      const m = mesh.material
      m.emissiveIntensity += (target * pulse - m.emissiveIntensity) * 0.12
    })
    const s = hovered ? 1.08 : 1
    group.scale.lerp(new THREE.Vector3(s, s, s), 0.15)
  })

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true) }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false) }}
    >
      <primitive object={object} />

      {/* невидимая сфера-хитбокс: сама деталь мелкая, попасть в неё мышью трудно */}
      <mesh visible={false}>
        <sphereGeometry args={[height * 0.75, 8, 8]} />
        <meshBasicMaterial />
      </mesh>

      {hovered && (
        <Html center position={[0, height * 1.15, 0]} distanceFactor={6} style={{ pointerEvents: 'none' }}>
          <span className="whitespace-nowrap rounded-md border border-brand-beige/40 bg-brand-deep/85 px-2 py-1 text-[11px] font-600 text-brand-white backdrop-blur-sm">
            {label}
          </span>
        </Html>
      )}
    </group>
  )
}
