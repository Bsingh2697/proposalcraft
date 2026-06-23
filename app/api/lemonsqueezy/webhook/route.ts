import { NextRequest, NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('x-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing x-signature header' }, { status: 400 })
  }

  // Verify the request came from Lemon Squeezy
  const digest = crypto
    .createHmac('sha256', process.env.LEMONSQUEEZY_WEBHOOK_SECRET!)
    .update(body)
    .digest('hex')

  if (digest !== signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const payload = JSON.parse(body)
  const eventName: string = payload.meta?.event_name
  const userId: string | undefined = payload.meta?.custom_data?.user_id
  const subscriptionId: string = payload.data?.id
  const status: string = payload.data?.attributes?.status

  if (!userId) {
    return NextResponse.json({ received: true })
  }

  const supabase = await createClient()

  switch (eventName) {
    case 'subscription_created':
      await supabase
        .from('profiles')
        .update({ plan: 'pro', stripe_subscription_id: subscriptionId })
        .eq('id', userId)
      break

    case 'subscription_cancelled':
    case 'subscription_expired':
      await supabase
        .from('profiles')
        .update({ plan: 'free', stripe_subscription_id: null })
        .eq('id', userId)
      break

    case 'subscription_updated':
      await supabase
        .from('profiles')
        .update({ plan: status === 'active' ? 'pro' : 'free' })
        .eq('id', userId)
      break
  }

  return NextResponse.json({ received: true })
}
