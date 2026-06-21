# /lib

Shared utility modules used by both pages and API routes. No UI here — pure logic and SDK wrappers.

## Files

```
lib/
├── supabase/
│   ├── client.ts        # Supabase client for use in browser (Client Components)
│   ├── server.ts        # Supabase client for use on the server (API routes, Server Components)
│   └── schema.sql       # Full database schema — run this in Supabase SQL editor to set up tables
│
├── claude.ts            # Anthropic SDK wrapper — generates proposals using Claude API
├── stripe.ts            # Stripe SDK singleton — used in API routes for Checkout and webhooks
└── usage.ts             # Usage tracking — check if user is under limit, increment after generation
```

## Why two Supabase clients?

Supabase needs different clients depending on the context:

| Client | File | Used in | Why different? |
|--------|------|---------|----------------|
| Browser client | `client.ts` | Client Components (`"use client"`) | Uses `localStorage` / cookies accessible to the browser |
| Server client | `server.ts` | API routes, Server Components | Uses `cookies()` from Next.js headers — only available server-side |

The key difference: on the server, the Supabase client reads the session from the HTTP request's cookie header. On the client, it reads from the browser's cookie storage.

## Module responsibilities

### `claude.ts`

Wraps the `@anthropic-ai/sdk` to expose a single `generateProposal()` function. Handles model selection (haiku for free users, sonnet for pro users) and the system prompt.

### `stripe.ts`

Exports a singleton Stripe instance initialized with `STRIPE_SECRET_KEY`. Imported in `api/stripe/checkout/route.ts` and `api/stripe/webhook/route.ts`.

### `usage.ts`

Two functions:
- `checkUsage(userId)` → returns `{ used, limit, canGenerate }` — checks the `usage` table
- `incrementUsage(userId)` → adds 1 to `proposals_this_month` in the `usage` table

Also handles monthly reset: if `reset_at` is in the past, it resets the counter before checking.
