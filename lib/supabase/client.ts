import { createBrowserClient } from '@supabase/ssr'

// Use this inside Client Components ("use client").
// Creates a Supabase client that runs in the browser and reads the
// session from the browser's cookie storage.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
