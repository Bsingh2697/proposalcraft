import Stripe from 'stripe'

// Singleton Stripe instance used across all API routes.
// STRIPE_SECRET_KEY is server-only (no NEXT_PUBLIC_ prefix).
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
})
