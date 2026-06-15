// Convert one or more STL meshes into a single binary GLB (geometry only).
// Usage: node scripts/stl-to-glb.mjs out.glb in1.stl [in2.stl ...]
// Run from the project root so `three` resolves. Follow with:
//   gltf-transform optimize out.glb final.glb --compress draco --simplify-ratio 0.3
import * as THREE from 'three'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'
import { readFileSync, writeFileSync } from 'node:fs'

// GLTFExporter (binary) uses the browser FileReader to pack Blobs — polyfill it
globalThis.FileReader ??= class {
  #fire() {
    const ev = { target: this }
    this.onload?.(ev); this.onloadend?.(ev)
    this._l?.forEach((fn) => fn(ev))
  }
  addEventListener(t, fn) { if (t === 'load' || t === 'loadend') (this._l ??= []).push(fn) }
  readAsArrayBuffer(blob) { blob.arrayBuffer().then((ab) => { this.result = ab; this.#fire() }) }
  readAsDataURL(blob) {
    blob.arrayBuffer().then((ab) => {
      this.result = `data:${blob.type || 'application/octet-stream'};base64,${Buffer.from(ab).toString('base64')}`
      this.#fire()
    })
  }
}

const out = process.argv[2]
const inputs = process.argv.slice(3)
const scene = new THREE.Scene()
const loader = new STLLoader()

for (const f of inputs) {
  const buf = readFileSync(f)
  const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
  const geo = loader.parse(ab)
  if (!geo.attributes.normal) geo.computeVertexNormals()
  scene.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0x999999 })))
  console.log(`loaded ${f}: ${geo.attributes.position.count} verts`)
}

const exporter = new GLTFExporter()
const result = await exporter.parseAsync(scene, { binary: true })
writeFileSync(out, Buffer.from(result))
console.log('wrote', out)
