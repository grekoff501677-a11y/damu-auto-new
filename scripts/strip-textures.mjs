// Strip all textures from a GLB (geometry-only) — for the wireframe car
// render, textures only bloat the file. Usage:
//   node scripts/strip-textures.mjs in.glb out.glb
// Follow with: gltf-transform optimize out.glb final.glb --compress draco
import { NodeIO } from '@gltf-transform/core'

const io = new NodeIO()
const doc = await io.read(process.argv[2])
const root = doc.getRoot()

let textures = 0
for (const t of root.listTextures()) { t.dispose(); textures++ }

await io.write(process.argv[3], doc)
console.log(`stripped ${textures} textures → ${process.argv[3]}`)
