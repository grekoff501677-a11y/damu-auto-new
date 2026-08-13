'use client'

import { Component, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { Html, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { NodeSwarm } from './NodeSwarm'
import type { BodyNode } from './VehicleBlueprint'

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
  /** объём облака искр в долях высоты детали */
  glowRadius?: number
  /** густота мерцания — число частиц */
  glowDensity?: number
  /** режим редактора: деталь можно таскать курсором */
  draggable?: boolean
  onDragMove?: (position: [number, number, number]) => void
  onDragStateChange?: (dragging: boolean) => void
}

// Серебро, а не беж: на охряном каркасе тёплые искры сливались с фоном.
// Это голубой из палитры, выведенный в светлый холодный тон.
const GLOW_COLOR = '#D9E1E8'
const DEFAULT_GLOW_RADIUS = 1.4
const DEFAULT_GLOW_DENSITY = 120

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

function PartModelInner({
  url, position, height, label, active = false, onHoverChange,
  glowRadius = DEFAULT_GLOW_RADIUS, glowDensity = DEFAULT_GLOW_DENSITY,
  draggable = false, onDragMove, onDragStateChange,
}: Props) {
  const { scene } = useGLTF(url)
  const [hovered, setHovered] = useState(false)
  const [dragging, setDragging] = useState(false)
  const groupRef = useRef<THREE.Group>(null)
  const { camera, gl } = useThree()
  // плоскость перетаскивания и смещение «курсор → центр детали»
  const planeRef = useRef(new THREE.Plane())
  const grabRef = useRef(new THREE.Vector3())
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

  // Тащим в плоскости, обращённой к камере: по экрану деталь идёт ровно за
  // курсором, а третья ось набирается поворотом сцены. Слушаем окно, а не меш —
  // курсор во время перетаскивания regularly уходит с детали.
  useEffect(() => {
    if (!dragging) return
    const el = gl.domElement
    const ray = new THREE.Raycaster()
    const hit = new THREE.Vector3()

    const move = (ev: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      ray.setFromCamera(new THREE.Vector2(
        ((ev.clientX - rect.left) / rect.width) * 2 - 1,
        -((ev.clientY - rect.top) / rect.height) * 2 + 1,
      ), camera)
      if (!ray.ray.intersectPlane(planeRef.current, hit)) return
      hit.add(grabRef.current)
      const r = (n: number) => Math.round(n * 1000) / 1000
      onDragMove?.([r(hit.x), r(hit.y), r(hit.z)])
    }
    const up = () => setDragging(false)

    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
    }
  }, [dragging, camera, gl, onDragMove])

  useEffect(() => { onDragStateChange?.(dragging) }, [dragging, onDragStateChange])

  const startDrag = (e: ThreeEvent<PointerEvent>) => {
    if (!draggable) return
    e.stopPropagation()
    const centre = new THREE.Vector3(...position)
    const normal = camera.getWorldDirection(new THREE.Vector3()).negate()
    planeRef.current.setFromNormalAndCoplanarPoint(normal, centre)
    const hit = new THREE.Vector3()
    // держим деталь за точку захвата, чтобы она не прыгала центром под курсор
    grabRef.current.set(0, 0, 0)
    if (e.ray.intersectPlane(planeRef.current, hit)) grabRef.current.copy(centre).sub(hit)
    setDragging(true)
  }

  // Два состояния, взаимоисключающих: покой — вокруг детали роятся искры,
  // сама она приглушена; под курсором искры гаснут, деталь разгорается
  // целиком и чуть подрастает.
  useFrame(({ clock }) => {
    const group = groupRef.current
    if (!group) return
    const target = hovered ? 0.95 : active ? 0.3 : 0.08
    const pulse = hovered ? 1 : active ? 1 + 0.18 * Math.sin(clock.elapsedTime * 2.4) : 1
    // деталей семь, обход по графу каждый кадр стоит копейки
    group.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (!mesh.isMesh || !(mesh.material instanceof THREE.MeshStandardMaterial)) return
      const m = mesh.material
      m.emissiveIntensity += (target * pulse - m.emissiveIntensity) * 0.12
    })
    const s = hovered ? 1.14 : 1
    group.scale.lerp(new THREE.Vector3(s, s, s), 0.15)
  })

  // Облако искр вокруг детали — то же, чем подсвечиваются узлы ТО, но
  // сжатое до размеров детали. Центр в нуле: группа уже стоит на месте.
  const glow = useMemo(() => ({
    id: 'part-glow',
    bodyNode: 'engine' as BodyNode, // NodeSwarm его не использует
    shape: 'sphere' as const,
    x: 0, y: 0, z: 0,
    r: height * Math.max(0.2, glowRadius),
  }), [height, glowRadius])

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true) }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false) }}
      onPointerDown={startDrag}
    >
      <primitive object={object} />

      {/* искры горят всегда и гаснут под курсором — деталь в этот момент
          подсвечивается сама, и рой ей только мешает */}
      <NodeSwarm
        region={glow}
        color={GLOW_COLOR}
        active={!hovered && !dragging}
        points={Math.max(0, Math.round(glowDensity))}
      />

      {/* невидимая сфера-хитбокс: сама деталь мелкая, попасть в неё мышью трудно */}
      <mesh visible={false}>
        <sphereGeometry args={[height * 0.75, 8, 8]} />
        <meshBasicMaterial />
      </mesh>

      {(hovered || dragging) && (
        <Html center position={[0, height * 1.15, 0]} distanceFactor={6} style={{ pointerEvents: 'none' }}>
          <span className="whitespace-nowrap rounded-md border border-brand-beige/40 bg-brand-deep/85 px-2 py-1 text-[11px] font-600 text-brand-white backdrop-blur-sm">
            {label}
          </span>
        </Html>
      )}
    </group>
  )
}
