// Подготовка GLB детали (не машины) для сцены Центра ТО.
//
// Деталь, в отличие от кузова, рисуется НЕ каркасом, а обычным мешем, и
// материалы ей назначаются в рантайме по имени узла (см. PartModel.tsx).
// Поэтому здесь важно одно: чтобы узлы назывались осмысленно.
//
// Исходник — STEP из SolidWorks (AP203: геометрия без цветов и текстур).
// Тесселяция делается один раз питоном, OCCT-конвертером:
//   pip install cascadio
//   python -c "import cascadio; cascadio.step_to_glb('Oil_Filter.STEP','raw.glb',tol_linear=0.05,tol_angular=0.3)"
//
// Дальше этот скрипт:
//   node scripts/prep-part-glb.mjs raw.glb oil-filter.glb
// и сжатие:
//   npx @gltf-transform/cli optimize oil-filter.glb oil-filter.min.glb --compress draco
//
// Заливка — как у машин, scripts/upload-3d.mjs (бакет "models").
import { NodeIO } from '@gltf-transform/core'

const [, , input, output] = process.argv
if (!input || !output) {
  console.error('usage: node scripts/prep-part-glb.mjs <in.glb> <out.glb>')
  process.exit(1)
}

const io = new NodeIO()
const doc = await io.read(input)
const root = doc.getRoot()

// STEP отдаёт узлы как NAUO1..N (NEXT_ASSEMBLY_USAGE_OCCURRENCE) — для нас это
// мусор. Осмысленное имя лежит на меше, поэтому переносим его на узел: three.js
// кладёт в Object3D.name именно имя узла, и материал ищется по нему.
const seen = new Map()
let renamed = 0
for (const node of root.listNodes()) {
  const mesh = node.getMesh()
  if (!mesh) continue
  const base = (mesh.getName() || 'part').trim()
  const n = (seen.get(base) ?? 0) + 1
  seen.set(base, n)
  node.setName(n === 1 ? base : `${base}_${n}`)
  renamed++
}

// Текстур в STEP нет и быть не может, но исходник мог пройти через другой
// конвертер — на всякий случай не тащим их в бандл.
let textures = 0
for (const t of root.listTextures()) { t.dispose(); textures++ }

await io.write(output, doc)

const tris = root.listMeshes().reduce((sum, m) => sum + m.listPrimitives().reduce((s, p) => {
  const idx = p.getIndices()
  return s + (idx ? idx.getCount() : p.getAttribute('POSITION').getCount()) / 3
}, 0), 0)

console.log(`узлов переименовано: ${renamed}${textures ? `, текстур удалено: ${textures}` : ''}`)
console.log(`треугольников: ${tris}`)
console.log('имена узлов:', root.listNodes().filter((n) => n.getMesh()).map((n) => n.getName()).join(', '))
