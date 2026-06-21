# /app/api

Server-side API routes. These files run **only on the server** (Vercel's infrastructure) — they are never sent to or executed in the browser.

This is where all secret API keys are used: Anthropic, Stripe secret key, Stripe webhook secret.

## Why these exist as separate routes

Three operations cannot be done from the browser:
1. **Calling Claude** — the Anthropic API key must stay server-side
2. **Creating a Stripe Checkout session** — the Stripe secret key must stay server-side
3. **Receiving Stripe webhooks** — Stripe calls our server, not the browser

## Routes

| File | Method | URL | Purpose |
|------|--------|-----|---------|
| `generate/route.ts` | POST | `/api/generate` | Auth check → usage check → call Claude → save to DB |
| `stripe/checkout/route.ts` | POST | `/api/stripe/checkout` | Create a Stripe Checkout session, return URL |
| `stripe/webhook/route.ts` | POST | `/api/stripe/webhook` | Handle Stripe events (subscription created/cancelled) |

## Security model

- All routes verify the user's Supabase session before doing anything
- The Stripe webhook route additionally verifies the request signature using `STRIPE_WEBHOOK_SECRET` — this prevents fake webhook calls from anyone on the internet
- All secret env vars (`ANTHROPIC_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`) are available here and only here

## How a route file is structured

```ts
// app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  // 1. Parse request body
  // 2. Verify auth
  // 3. Do the work (call external API, query DB)
  // 4. Return response
  return NextResponse.json({ result: '...' })
}
```
