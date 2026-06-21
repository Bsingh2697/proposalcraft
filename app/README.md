# /app

This is the Next.js App Router directory. Every folder here maps to a URL route, and every `page.tsx` is a page. Every `route.ts` is a server-side API endpoint.

## How Next.js App Router works

- `page.tsx` → renders a UI page at that URL
- `route.ts` → handles HTTP requests (GET, POST, etc.) at that URL — no UI, just server logic
- `layout.tsx` → wraps all pages inside a folder with shared UI (navbar, auth check, etc.)
- Folders wrapped in `(parentheses)` are **route groups** — they organize code without affecting the URL

## Folder breakdown

```
app/
├── (auth)/          # PUBLIC — login and signup pages, no auth required
│   ├── login/       # → /login
│   └── signup/      # → /signup
│
├── (app)/           # PROTECTED — requires a logged-in Supabase session
│   ├── dashboard/   # → /dashboard  (past proposals list)
│   └── generate/    # → /generate   (main proposal generator)
│
├── api/             # SERVER-ONLY — never rendered in the browser
│   ├── generate/    # POST /api/generate — calls Claude API
│   └── stripe/
│       ├── checkout/ # POST /api/stripe/checkout — creates Stripe Checkout session
│       └── webhook/  # POST /api/stripe/webhook — Stripe event handler
│
├── pricing/         # → /pricing  (public pricing page)
├── layout.tsx       # Root layout — applies to all pages
├── page.tsx         # → / (landing page, public)
└── globals.css      # Global Tailwind styles
```

## Route protection

`middleware.ts` (at the project root) runs before every request and redirects unauthenticated users away from `/(app)/*` routes to `/login`. The `/(auth)/*` and `/pricing` routes are always public.
