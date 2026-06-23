# ProposalCraft — Project Documentation

AI-powered freelance proposal generator. Paste a job description → get a tailored proposal in seconds.

**Live URL:** https://proposalcraft-rouge.vercel.app

---

## What it does

1. User signs up (email or Google)
2. Pastes a job posting
3. AI generates a professional proposal
4. Free users get 3 proposals/month, Pro users get unlimited ($9/month)

---

## Tech Stack

| What | Tool | Why |
|---|---|---|
| Framework | Next.js 16 | Full-stack — pages + API in one repo |
| Language | TypeScript | Type safety everywhere |
| Database + Auth | Supabase | Postgres DB + login built-in |
| AI | Groq (llama-3.3-70b) | Free tier, fast |
| Payments | Lemon Squeezy | Works in India, handles subscriptions |
| Styling | Tailwind CSS + shadcn/ui | Fast, clean UI components |
| Hosting | Vercel | Auto-deploys on every git push |
| Package manager | pnpm | Faster than npm |

---

## Project Structure

```
proposalcraft/
│
├── proxy.ts                          ← Runs before EVERY request
│                                       Checks if user is logged in
│                                       Redirects to /login if not
│
├── .env.local                        ← Secret keys (never committed to git)
├── .env.local.example                ← Template showing which keys are needed
│
├── lib/                              ← Shared utilities
│   ├── supabase/
│   │   ├── client.ts                 ← Supabase for browser (Client Components)
│   │   ├── server.ts                 ← Supabase for server (API routes, Server Components)
│   │   └── schema.sql                ← Full database setup — run once in Supabase SQL editor
│   ├── groq.ts                       ← AI proposal generation using Groq
│   ├── lemonsqueezy.ts               ← Create Lemon Squeezy checkout sessions
│   ├── stripe.ts                     ← (Old, unused — replaced by Lemon Squeezy)
│   └── usage.ts                      ← Check + increment proposal usage per user
│
├── app/                              ← All pages and API routes
│   │
│   ├── page.tsx                      ← Landing page (public, anyone can see)
│   ├── pricing/page.tsx              ← Pricing page (Free vs Pro)
│   ├── privacy/page.tsx              ← Privacy policy
│   ├── terms/page.tsx                ← Terms of service
│   │
│   ├── (auth)/                       ← Login + Signup pages (public)
│   │   ├── login/
│   │   │   ├── page.tsx              ← Server wrapper
│   │   │   └── LoginForm.tsx         ← Email/password + Google login form
│   │   └── signup/
│   │       ├── page.tsx              ← Server wrapper
│   │       └── SignupForm.tsx        ← Signup form
│   │
│   ├── auth/
│   │   └── callback/route.ts         ← Google OAuth lands here after login
│   │                                   Exchanges code → session → redirects to /generate
│   │
│   ├── (app)/                        ← Protected pages (must be logged in)
│   │   ├── generate/
│   │   │   ├── page.tsx              ← Fetches user + usage from DB (server)
│   │   │   └── GenerateClient.tsx    ← Form + proposal output (client)
│   │   └── dashboard/
│   │       └── page.tsx              ← Shows past proposals + upgrade CTA
│   │
│   ├── actions/
│   │   └── auth.ts                   ← Server Action: logout (clears session + redirects)
│   │
│   └── api/                          ← Backend API routes
│       ├── generate/route.ts         ← POST: generate a proposal (main feature)
│       └── lemonsqueezy/
│           ├── checkout/route.ts     ← POST: create Lemon Squeezy checkout URL
│           └── webhook/route.ts      ← POST: Lemon Squeezy calls this after payment
│
└── components/                       ← Reusable UI components
    ├── ProposalForm.tsx              ← Job description + skills + tone form
    ├── ProposalOutput.tsx            ← Generated proposal with copy button
    ├── UsageBadge.tsx                ← "2 free proposals left" badge
    ├── LogoutButton.tsx              ← Logout button in nav
    └── ui/                           ← shadcn/ui base components (Button, Card, etc.)
```

---

## How a Request Flows

### User visits any page
```
Browser → proxy.ts runs first
         → Is user logged in?
            NO  + trying to visit /generate or /dashboard → redirect to /login
            YES + trying to visit /login or /signup       → redirect to /generate
            Else → show the page normally
```

### User generates a proposal
```
User fills form → POST /api/generate
                → 1. Is user logged in? (if not → 401 error)
                → 2. Have they hit the 3/month limit? (if yes → 403 error)
                → 3. Send job description to Groq AI
                → 4. Save proposal to database
                → 5. Increment usage counter
                → 6. Return proposal text to browser
Browser shows proposal, badge updates immediately
```

### User upgrades to Pro
```
User clicks "Upgrade" → POST /api/lemonsqueezy/checkout
                      → Creates a checkout session with Lemon Squeezy
                      → Returns a URL
Browser redirects to Lemon Squeezy checkout page
User pays → Lemon Squeezy calls POST /api/lemonsqueezy/webhook
          → We verify the request is really from LS (signature check)
          → Update user's plan to 'pro' in database
User now has unlimited proposals
```

### Google login flow
```
User clicks "Continue with Google"
→ Redirected to Google
→ Google redirects back to /auth/callback?code=xxx
→ /auth/callback exchanges code for a session
→ User is redirected to /generate
```

---

## Database (Supabase)

Three tables. Every user can only see their own data (Row Level Security).

```
profiles
  id                    → same as Supabase auth user ID
  plan                  → 'free' or 'pro'
  stripe_subscription_id → stores Lemon Squeezy subscription ID

proposals
  id, user_id
  job_description       → what the user pasted
  skills, tone          → form inputs
  output                → the generated proposal
  created_at

usage
  user_id
  proposals_this_month  → resets to 0 every month
  reset_at              → date when it will reset
```

**Auto-trigger:** When a new user signs up, Supabase automatically creates a row in `profiles` and `usage` for them.

---

## Environment Variables

All stored in `.env.local` locally, and in Vercel dashboard for production.

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL        → your Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY   → public key (safe to expose)
SUPABASE_SERVICE_ROLE_KEY       → private key (never expose)

# AI
GROQ_API_KEY                    → from console.groq.com

# Payments
LEMONSQUEEZY_API_KEY            → from app.lemonsqueezy.com → Settings → API
LEMONSQUEEZY_STORE_ID           → 415939
LEMONSQUEEZY_VARIANT_ID         → 1828834
LEMONSQUEEZY_WEBHOOK_SECRET     → secret you set when creating the webhook

# App
NEXT_PUBLIC_APP_URL             → http://localhost:3000 (dev) or https://proposalcraft-rouge.vercel.app (prod)
```

---

## Local Development

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Open in browser
http://localhost:3000
```

---

## Deployment

Vercel auto-deploys on every `git push` to `main`.

```bash
git add .
git commit -m "your message"
git push
# Vercel picks it up automatically
```

---

## Free vs Pro

| | Free | Pro |
|---|---|---|
| Proposals | 3 / month | Unlimited |
| Price | $0 | $9/month |
| AI model | Groq llama-3.3-70b | Groq llama-3.3-70b |

---

## Things Still Pending

- [ ] Lemon Squeezy store activation (1-3 days) — needed for payments to work
- [ ] Update LS webhook URL to production URL after activation
- [ ] Google OAuth consent screen verification (shows Supabase URL until verified)
