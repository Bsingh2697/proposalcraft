# Session Log — 2026-06-21

## What we built

**ProposalCraft** — an AI-powered freelance proposal generator SaaS.

Freelancers paste a job description → Claude AI writes a tailored proposal in seconds.
Free tier: 3 proposals/month. Pro tier: $9/month unlimited.

---

## What was decided

| Decision | Why |
|----------|-----|
| Niche: freelance proposals | 5M+ Upwork freelancers, clear pain, obvious ROI |
| Subscription at $9/month | Low enough to impulse-buy, high enough to matter |
| Claude haiku (free) / sonnet (pro) | haiku costs ~$0.001/proposal, sonnet is higher quality |
| Supabase over custom auth | Built-in auth + RLS = secure without writing auth code |
| Next.js 16 App Router | Full-stack in one repo, Server Actions, no separate backend |
| Lazy SDK initialization | Stripe + Anthropic clients created at runtime, not build time |

---

## Technologies used (and why)

| Tech | Purpose |
|------|---------|
| **Next.js 16** | Full-stack framework — pages + API routes in one repo |
| **TypeScript** | Type safety across Supabase/Stripe/Claude response shapes |
| **Supabase** | Postgres DB + auth (email + Google OAuth) + Row Level Security |
| **Stripe** | Subscription billing — Checkout, webhooks, Customer Portal |
| **Claude API** | AI proposal generation (haiku for free users, sonnet for pro) |
| **Tailwind CSS** | Utility-first styling — fast UI without switching to CSS files |
| **shadcn/ui** | Pre-built accessible components (Button, Card, Input, etc.) copied into the project |
| **Resend** | Transactional email (welcome emails, usage alerts) |
| **Vercel** | Zero-config deployment for Next.js, free tier |
| **pnpm** | Faster package manager than npm |

---

## Every file we created

```
proposalcraft/
│
├── proxy.ts                          # Route protection (renamed from middleware in Next.js 16)
│                                     # Redirects unauthenticated users to /login
│
├── .env.local.example                # Template for all required env vars (safe to commit)
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # Supabase browser client (used in Client Components)
│   │   ├── server.ts                 # Supabase server client (used in API routes)
│   │   └── schema.sql                # Full DB schema — run this in Supabase SQL editor
│   ├── claude.ts                     # Anthropic SDK wrapper — generateProposal() function
│   ├── stripe.ts                     # Stripe singleton — getStripe() lazy getter
│   └── usage.ts                      # Usage tracking — getUsageStatus() + incrementUsage()
│
├── app/
│   ├── page.tsx                      # Landing page (public, static)
│   │
│   ├── (auth)/                       # Public auth pages (no login required)
│   │   ├── login/
│   │   │   ├── page.tsx              # Server wrapper with force-dynamic
│   │   │   └── LoginForm.tsx         # Client component — email/password + Google OAuth
│   │   └── signup/
│   │       ├── page.tsx              # Server wrapper with force-dynamic
│   │       └── SignupForm.tsx        # Client component — signup form
│   │
│   ├── (app)/                        # Protected pages (require login)
│   │   ├── generate/
│   │   │   ├── page.tsx              # Server component — fetches user + usage from DB
│   │   │   └── GenerateClient.tsx    # Client component — form + output state
│   │   └── dashboard/
│   │       └── page.tsx              # Past proposals list, upgrade CTA
│   │
│   ├── pricing/
│   │   └── page.tsx                  # Pricing page — Free vs Pro cards
│   │
│   └── api/
│       ├── generate/
│       │   └── route.ts              # POST — auth check → usage check → Claude → save
│       └── stripe/
│           ├── checkout/
│           │   └── route.ts          # POST — creates Stripe Checkout session
│           └── webhook/
│               └── route.ts          # POST — handles Stripe events (sub created/cancelled)
│
└── components/
    ├── ProposalForm.tsx              # Job description + skills + tone form
    ├── ProposalOutput.tsx            # Generated proposal with Copy button
    ├── UsageBadge.tsx                # "2 of 3 free proposals left" badge
    └── ui/                           # shadcn/ui components (Button, Card, Input, etc.)
```

---

## Database schema (Supabase)

Three tables — all with Row Level Security so users can only access their own data.

```
profiles      id, stripe_customer_id, stripe_subscription_id, plan ('free'|'pro')
proposals     id, user_id, job_description, skills, tone, output, created_at
usage         user_id, proposals_this_month, reset_at
```

A Postgres trigger auto-creates a `profiles` + `usage` row whenever a new user signs up.

---

## How the 3 server-side API routes work

### POST /api/generate
```
Browser → sends { jobDescription, skills, tone }
Server  → 1. verifies Supabase session
          2. checks usage table (blocks if free user hit limit)
          3. calls Claude API with ANTHROPIC_API_KEY (never leaves server)
          4. saves result to proposals table
          5. increments usage counter
        → returns { proposal: "..." }
```

### POST /api/stripe/checkout
```
Browser → clicks "Upgrade to Pro"
Server  → 1. verifies Supabase session
          2. gets/creates Stripe customer for this user
          3. creates Checkout session with STRIPE_SECRET_KEY (never leaves server)
        → returns { url: "https://checkout.stripe.com/..." }
Browser → redirects to that Stripe-hosted URL (we never touch card data)
```

### POST /api/stripe/webhook (Stripe calls us, not the browser)
```
Stripe  → sends event after payment
Server  → 1. verifies request signature with STRIPE_WEBHOOK_SECRET
          2. on checkout.session.completed → sets plan='pro' in Supabase
          3. on customer.subscription.deleted → sets plan='free' in Supabase
        → returns { received: true }
```

---

## Build issues we fixed (and why)

| Issue | Fix |
|-------|-----|
| `middleware.ts` deprecated in Next.js 16 | Renamed to `proxy.ts`, function renamed `middleware` → `proxy` |
| `Stripe.CheckoutSession` doesn't exist | Correct type is `Stripe.Checkout.Session` |
| Stripe/Anthropic clients throw at build time | Lazy-initialize with a getter function — clients created only at request time |
| Auth pages crash during static prerender | Split into server wrapper (`dynamic = 'force-dynamic'`) + client form component |
| Wrong Stripe API version | Updated to `'2026-05-27.dahlia'` (what stripe@22 expects) |

---

## GitHub repo

**https://github.com/Bsingh2697/proposalcraft**

3 commits on `main`, clean build, all TypeScript passing.

---

## Next steps (continue from here)

### Step 1 — Supabase setup (~15 min)
1. Go to [supabase.com](https://supabase.com) → New project
2. SQL Editor → New query → paste contents of `lib/supabase/schema.sql` → Run
3. Authentication → Providers → Enable Google (needs Google Cloud OAuth credentials)
4. Settings → API → copy these 3 values into `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### Step 2 — Anthropic API key (~2 min)
1. Go to [console.anthropic.com](https://console.anthropic.com) → API Keys → Create key
2. Add to `.env.local` as `ANTHROPIC_API_KEY`

### Step 3 — Stripe setup (~10 min)
1. [dashboard.stripe.com](https://dashboard.stripe.com) → Products → Create product
   - Name: "ProposalCraft Pro"
   - Price: $9.00 / month / recurring
2. Copy the **Price ID** (starts with `price_`) → `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID`
3. Developers → API Keys → copy:
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_SECRET_KEY`

### Step 4 — Fill .env.local
```bash
cp .env.local.example .env.local
# fill in all values
```

### Step 5 — Run locally and test
```bash
pnpm dev
# open http://localhost:3000
```

Test this flow end-to-end:
- [ ] Sign up with email
- [ ] Generate a proposal (use any job description)
- [ ] Generate 3 proposals → confirm 4th is blocked
- [ ] Click "Upgrade" → Stripe test checkout appears
- [ ] For webhook testing in a separate terminal: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
- [ ] Complete test payment → confirm plan flips to pro in Supabase dashboard

### Step 6 — Deploy to Vercel
```bash
pnpm add -g vercel    # if not installed
vercel --prod
```
- Set all env vars from `.env.local` in the Vercel dashboard
- In Stripe dashboard → Developers → Webhooks → Add endpoint:
  `https://your-domain.vercel.app/api/stripe/webhook`
  Events to listen for: `checkout.session.completed`, `customer.subscription.deleted`, `customer.subscription.updated`
- Copy the webhook signing secret → `STRIPE_WEBHOOK_SECRET` in Vercel env vars

### Step 7 — Launch
- Post on [r/freelance](https://reddit.com/r/freelance) and [r/Upwork](https://reddit.com/r/Upwork)
- Submit to [Product Hunt](https://producthunt.com) (schedule for Tuesday — peaks Tue/Wed)
- Post on [Indie Hackers](https://indiehackers.com) → Show IH
- Tweet: "Built an AI freelance proposal generator in a weekend"

---

## Cost to run (0 paying users)

| Service | Monthly cost |
|---------|-------------|
| Vercel | $0 (free tier) |
| Supabase | $0 (free tier) |
| Claude API | ~$0.01 per 100 proposals |
| Stripe | $0 (only pay per transaction: 2.9% + 30¢) |
| Domain | ~$1/month (~$12/year) |
| **Total** | **~$1/month** |

First paying user ($9) covers ~9 months of fixed costs.
