import Stripe from 'stripe'

let _stripe: Stripe | null = null

// Lazily initialized so the key is not required at build time.
// STRIPE_SECRET_KEY is server-only (no NEXT_PUBLIC_ prefix).
export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-05-27.dahlia',
    })
  }
  return _stripe
}
