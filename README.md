# ProposalCraft

AI-powered freelance proposal generator. Paste a job description → get a tailored, professional proposal in seconds.

## What it does

Freelancers on Upwork, Fiverr, and Toptal spend hours writing proposals. ProposalCraft uses Claude AI to generate high-quality, personalized proposals in under 10 seconds.

## Revenue model

| Plan | Price | Limit |
|------|-------|-------|
| Free | $0 | 3 proposals/month |
| Pro | $9/month | Unlimited proposals |

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router + TypeScript) |
| Auth + Database | Supabase (Postgres + RLS) |
| Payments | Stripe (Checkout + Webhooks) |
| AI | Claude API (Anthropic) |
| Styling | Tailwind CSS + shadcn/ui |
| Email | Resend |
| Hosting | Vercel |

## Project structure

```
proposalcraft/
├── app/                     # Next.js App Router pages and API routes
│   ├── (auth)/              # Login and signup pages (public)
│   ├── (app)/               # Protected pages (requires login)
│   ├── api/                 # Server-side API routes (secrets live here)
│   └── pricing/             # Public pricing page
├── components/              # Reusable React components
│   └── ui/                  # shadcn/ui base components
├── lib/                     # Shared utility modules
│   └── supabase/            # Supabase client factories
└── middleware.ts             # Route protection (redirects unauthenticated users)
```

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/yourusername/proposalcraft.git
cd proposalcraft
pnpm install
```

### 2. Set up environment variables

```bash
cp .env.local.example .env.local
# Fill in all values — see .env.local.example for descriptions
```

### 3. Set up Supabase

- Create a project at [supabase.com](https://supabase.com)
- Run the SQL in `lib/supabase/schema.sql` in the Supabase SQL editor
- Enable Google OAuth under Authentication → Providers

### 4. Set up Stripe

- Create a product "ProposalCraft Pro" at $9/month in the Stripe dashboard
- Copy the Price ID to `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID`
- For local webhook testing: `stripe listen --forward-to localhost:3000/api/stripe/webhook`

### 5. Run locally

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment

```bash
vercel --prod
```

Set all environment variables from `.env.local.example` in the Vercel dashboard.
Add the Stripe webhook endpoint: `https://yourdomain.com/api/stripe/webhook`

## Cost estimate (Month 1, 0 paying users)

| Service | Cost |
|---------|------|
| Vercel | $0 (free tier) |
| Supabase | $0 (free tier) |
| Claude API (haiku) | ~$0.01 per 100 proposals |
| Stripe | 2.9% + 30¢ per transaction only |
| Domain | ~$12/year |
| **Total fixed** | **~$1/month** |
