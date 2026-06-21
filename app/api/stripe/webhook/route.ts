import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  // 1. Verify the request actually came from Stripe
  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = await createClient()

  // 2. Handle the events we care about
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.client_reference_id

      if (userId && session.subscription) {
        await supabase
          .from('profiles')
          .update({
            plan: 'pro',
            stripe_subscription_id: session.subscription as string,
          })
          .eq('id', userId)
      }
      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const userId = subscription.metadata?.supabase_user_id

      if (userId) {
        await supabase
          .from('profiles')
          .update({ plan: 'free', stripe_subscription_id: null })
          .eq('id', userId)
      }
      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription
      const userId = subscription.metadata?.supabase_user_id
      const isActive = subscription.status === 'active'

      if (userId) {
        await supabase
          .from('profiles')
          .update({ plan: isActive ? 'pro' : 'free' })
          .eq('id', userId)
      }
      break
    }
  }

  return NextResponse.json({ received: true })
}
