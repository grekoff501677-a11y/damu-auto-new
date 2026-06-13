// One-off: upload the optimized Coolray GLB to Supabase Storage (public
// bucket "models") and print its public URL. Reads keys from .env.local.
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split(/\r?\n/)
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()])
)

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)

// ensure a public bucket
await sb.storage.createBucket('models', { public: true, fileSizeLimit: '20MB' }).catch(() => {})

const file = readFileSync(process.argv[2])
const path = process.argv[3] || 'coolray.glb'
const { error } = await sb.storage.from('models').upload(path, file, {
  contentType: 'model/gltf-binary',
  upsert: true,
})
if (error) { console.error('UPLOAD ERROR:', error.message); process.exit(1) }

const { data } = sb.storage.from('models').getPublicUrl(path)
console.log('PUBLIC_URL:', data.publicUrl)
