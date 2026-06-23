import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createCheckout } from '@/lib/lemonsqueezy'

export async function POST() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const url = await createCheckout(user.id, user.email!)
    return NextResponse.json({ url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create checkout'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
