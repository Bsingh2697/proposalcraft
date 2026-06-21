import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Use this inside API routes and Server Components.
// Creates a Supabase client that runs on the server and reads the
// session from the HTTP request's cookie header.
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // setAll is called from Server Components where cookies can't be set.
            // This is safe to ignore — middleware refreshes the session.
          }
        },
      },
    }
  )
}
