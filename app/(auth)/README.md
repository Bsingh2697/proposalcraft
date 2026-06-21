# /app/(auth)

Public authentication pages. Anyone can access these — no login required.

The `(auth)` parentheses make this a **route group**: it organizes files without adding `/auth/` to the URL. So `/app/(auth)/login/page.tsx` is served at `/login`, not `/auth/login`.

## Pages

| File | URL | Purpose |
|------|-----|---------|
| `login/page.tsx` | `/login` | Email/password login + Google OAuth button |
| `signup/page.tsx` | `/signup` | New account creation |

## How auth works

Both pages use the **Supabase Auth UI** or custom forms that call Supabase's auth methods:

```ts
// Login
await supabase.auth.signInWithPassword({ email, password })

// Signup
await supabase.auth.signUp({ email, password })

// Google OAuth
await supabase.auth.signInWithOAuth({ provider: 'google' })
```

After a successful login/signup, Supabase sets a session cookie. The middleware reads this cookie on every request to know who the user is.

## After login

Users are redirected to `/generate` (the main app page).
