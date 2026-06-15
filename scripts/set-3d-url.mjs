// Set car_models.model_3d_url for one slug (data update; column must exist).
// Usage: node scripts/set-3d-url.mjs <slug> <url>
import { readFileSync } from 'node:fs'
const env = Object.fromEntries(
  readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    .split(/\r?\n/).filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()])
)
const [slug, url] = process.argv.slice(2)
const res = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/car_models?slug=eq.${slug}`, {
  method: 'PATCH',
  headers: {
    apikey: env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  },
  body: JSON.stringify({ model_3d_url: url }),
})
const data = await res.json().catch(() => null)
console.log(`HTTP ${res.status}, updated rows: ${Array.isArray(data) ? data.length : 0}`)
if (!res.ok) console.error(JSON.stringify(data))
