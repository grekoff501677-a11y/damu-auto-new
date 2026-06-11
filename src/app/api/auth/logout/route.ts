import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// Kept as a secondary logout path (admin UI uses the logout Server Action).
// Same-origin check prevents CSRF: a third-party page must not be able to
// force-logout the admin via an auto-submitted cross-site form.
export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin')
  const host = req.headers.get('host')
  if (!origin || !host || new URL(origin).host !== host) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}
