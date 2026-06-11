'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// Server Action instead of a POST route: Next.js verifies Origin/Host for
// actions, so a third-party page can't force-logout the admin (CSRF).
export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/admin/login')
}
