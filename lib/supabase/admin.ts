import { createClient } from '@supabase/supabase-js'

// Server-only admin client — uses service role key, bypasses RLS.
// Never import this in client components or expose to the browser.
// Use only when the caller has already verified the user's identity.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
