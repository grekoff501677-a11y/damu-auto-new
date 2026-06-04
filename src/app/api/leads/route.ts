import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { LeadFormData } from '@/lib/types'

export async function POST(req: NextRequest) {
  try {
    const body: LeadFormData = await req.json()

    // Basic validation
    if (!body.name?.trim() || !body.phone?.trim()) {
      return NextResponse.json(
        { error: 'Имя и телефон обязательны' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const { error } = await supabase.from('leads').insert({
      name:      body.name.trim(),
      phone:     body.phone.trim(),
      message:   body.message?.trim() ?? null,
      car_model: body.car_model?.trim() ?? null,
      source:    body.source ?? 'website',
      metadata:  {
        ...body.metadata,
        userAgent: req.headers.get('user-agent'),
        referer:   req.headers.get('referer'),
      },
    })

    if (error) throw error

    // TODO Phase 6: trigger n8n/CRM webhook here
    // await fetch(process.env.N8N_WEBHOOK_URL!, { method: 'POST', body: JSON.stringify(body) })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err) {
    console.error('[leads/POST]', err)
    return NextResponse.json(
      { error: 'Не удалось отправить заявку. Попробуйте ещё раз.' },
      { status: 500 }
    )
  }
}
