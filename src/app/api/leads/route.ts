import { createHmac } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { LeadFormData } from '@/lib/types'

export const runtime = 'nodejs'

// ── simple in-memory rate limit (per warm instance) ──
const RATE = new Map<string, { count: number; ts: number }>()
const WINDOW_MS = 60_000
const MAX_PER_WINDOW = 5

function clientIp(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for')
  return xff?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'
}

function rateLimited(ip: string): boolean {
  const now = Date.now()
  const rec = RATE.get(ip)
  if (!rec || now - rec.ts > WINDOW_MS) { RATE.set(ip, { count: 1, ts: now }); return false }
  rec.count += 1
  return rec.count > MAX_PER_WINDOW
}

// strip control characters + clamp length (defense against injection / junk payloads)
function clean(v: unknown, max = 500): string | null {
  if (typeof v !== 'string') return null
  let out = ''
  for (const ch of v) {
    const code = ch.charCodeAt(0)
    if (code < 32 || code === 127) continue // skip control chars
    out += ch
  }
  out = out.trim().slice(0, max)
  return out.length ? out : null
}

const PHONE_RE = /^[+\d][\d\s().-]{6,20}$/

export async function POST(req: NextRequest) {
  try {
    const ip = clientIp(req)
    if (rateLimited(ip)) {
      return NextResponse.json({ error: 'Слишком много запросов. Попробуйте позже.' }, { status: 429 })
    }

    let body: LeadFormData & { consent?: boolean }
    try {
      body = await req.json()
    } catch {
      return NextResponse.json({ error: 'Некорректный запрос' }, { status: 400 })
    }

    // ── RK compliance: explicit consent is mandatory ──
    if (body.consent !== true) {
      return NextResponse.json(
        { error: 'Требуется согласие на обработку персональных данных' },
        { status: 422 }
      )
    }

    const name = clean(body.name, 120)
    const phone = clean(body.phone, 30)
    const message = clean(body.message, 2000)
    const carModel = clean(body.car_model, 120)

    if (!name || !phone) {
      return NextResponse.json({ error: 'Имя и телефон обязательны' }, { status: 400 })
    }
    if (!PHONE_RE.test(phone)) {
      return NextResponse.json({ error: 'Некорректный номер телефона' }, { status: 400 })
    }

    const source = ['website', 'calculator', 'product'].includes(body.source as string)
      ? body.source : 'website'

    const supabase = createAdminClient()
    const { error } = await supabase.from('leads').insert({
      name, phone, message, car_model: carModel, source,
      metadata: {
        ...pickMetadata(body.metadata),
        consent: true,
        consent_at: new Date().toISOString(),
        ip_hash: hashIp(ip),
      },
    })

    if (error) throw error

    // TODO Phase 6: forward to n8n/CRM webhook (server-side only)
    // if (process.env.N8N_WEBHOOK_URL) {
    //   await fetch(process.env.N8N_WEBHOOK_URL, {
    //     method: 'POST', headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ name, phone, carModel, source }),
    //   }).catch(() => {})
    // }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err) {
    console.error('[leads/POST]', err)
    return NextResponse.json({ error: 'Не удалось отправить заявку. Попробуйте ещё раз.' }, { status: 500 })
  }
}

// client metadata is untrusted: keep only known keys, clamp each value
// (otherwise arbitrary multi-MB JSON would land in jsonb via service role)
const METADATA_KEYS = ['page', 'referrer', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const

function pickMetadata(raw: unknown): Record<string, string> {
  if (typeof raw !== 'object' || !raw) return {}
  const out: Record<string, string> = {}
  for (const key of METADATA_KEYS) {
    const v = clean((raw as Record<string, unknown>)[key], 300)
    if (v) out[key] = v
  }
  return out
}

// keyed non-reversible IP fingerprint for abuse auditing (raw IP not stored —
// RK compliance). HMAC, not plain hash: IPv4 space is brute-forceable.
const IP_HASH_KEY = process.env.LEAD_IP_HASH_SALT || process.env.SUPABASE_SERVICE_ROLE_KEY || 'damu-auto'

function hashIp(ip: string): string {
  return `ip_${createHmac('sha256', IP_HASH_KEY).update(ip).digest('hex').slice(0, 24)}`
}
