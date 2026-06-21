# /__tests__

Unit tests using Vitest + React Testing Library.

## Run tests

```bash
pnpm test          # run all tests once
pnpm test:watch    # re-run on file changes (great during development)
```

## Structure

```
__tests__/
├── lib/
│   ├── usage.test.ts       # getUsageStatus — free/pro limits, monthly resets
│   └── claude.test.ts      # generateProposal — Groq API response handling
├── api/
│   ├── generate.test.ts    # POST /api/generate — auth, limits, success, failure
│   └── webhook.test.ts     # POST /api/stripe/webhook — signature, plan updates
└── components/
    └── UsageBadge.test.tsx # Badge rendering for free/pro/limit states
```

## What each test covers

| File | Tests |
|------|-------|
| `lib/usage.test.ts` | Pro users bypass limits, free users blocked at 3, monthly reset resets counter |
| `lib/claude.test.ts` | Correct model used, proposal returned, error thrown on empty response |
| `api/generate.test.ts` | 401 for unauth, 403 at limit, 400 for missing job, 200 with proposal + usage increment |
| `api/webhook.test.ts` | 400 for missing sig, 400 for bad sig, plan=pro on checkout, plan=free on cancel |
| `components/UsageBadge.test.tsx` | Pro label, remaining count, singular/plural, limit reached |

## Mocking strategy

All external services (Supabase, Groq, Stripe) are mocked with `vi.mock()`.
Tests verify our logic, not third-party APIs — those have their own test suites.
