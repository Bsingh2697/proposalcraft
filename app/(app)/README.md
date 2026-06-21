# /app/(app)

Protected pages — only accessible when the user is logged in. If an unauthenticated user tries to visit any of these URLs, `middleware.ts` redirects them to `/login`.

The `(app)` parentheses make this a **route group** that organizes the authenticated section without affecting URLs.

## Pages

| File | URL | Purpose |
|------|-----|---------|
| `generate/page.tsx` | `/generate` | Main proposal generator — the core product |
| `dashboard/page.tsx` | `/dashboard` | History of all past proposals with copy/delete |

## Shared layout

`layout.tsx` (if present) wraps both pages with a shared navbar showing the user's email, usage badge, and a link to the dashboard.

## Data flow on these pages

```
User visits /generate
       ↓
middleware.ts checks Supabase session cookie
       ↓ (if valid)
page.tsx renders (can be a Server Component — reads session server-side)
       ↓
User fills form and submits
       ↓
POST /api/generate  ← server route handles Claude call + DB save
       ↓
Page displays the returned proposal
```
