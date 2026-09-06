import 'server-only'
import { createClient } from '@supabase/supabase-js'

// Server-only: usa service_role, nunca exponha com NEXT_PUBLIC_.
// Requer SUPABASE_SERVICE_ROLE_KEY no .env.local / Vercel.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'
    )
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  })
}
