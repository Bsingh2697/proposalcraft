import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock the Supabase server client before importing usage.ts
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

import { getUsageStatus } from '@/lib/usage'
import { createClient } from '@/lib/supabase/server'

// Helper to build a fake Supabase client
function makeSupabase({
  plan = 'free',
  proposalsThisMonth = 0,
  resetAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days in future
}: {
  plan?: string
  proposalsThisMonth?: number
  resetAt?: string
} = {}) {
  return {
    from: vi.fn().mockImplementation((table: string) => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: table === 'profiles'
          ? { plan }
          : { proposals_this_month: proposalsThisMonth, reset_at: resetAt },
        error: null,
      }),
      update: vi.fn().mockReturnThis(),
    })),
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getUsageStatus', () => {
  it('returns unlimited for pro users', async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabase({ plan: 'pro' }) as never)

    const status = await getUsageStatus('user-123')

    expect(status.plan).toBe('pro')
    expect(status.canGenerate).toBe(true)
    expect(status.limit).toBe(Infinity)
  })

  it('allows generation when free user is under the limit', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabase({ plan: 'free', proposalsThisMonth: 1 }) as never
    )

    const status = await getUsageStatus('user-123')

    expect(status.plan).toBe('free')
    expect(status.used).toBe(1)
    expect(status.limit).toBe(3)
    expect(status.canGenerate).toBe(true)
  })

  it('blocks generation when free user hits the 3-proposal limit', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabase({ plan: 'free', proposalsThisMonth: 3 }) as never
    )

    const status = await getUsageStatus('user-123')

    expect(status.canGenerate).toBe(false)
    expect(status.used).toBe(3)
  })

  it('resets counter and allows generation when reset_at is in the past', async () => {
    const pastDate = new Date(Date.now() - 1000).toISOString() // 1 second ago

    const fakeClient = makeSupabase({ plan: 'free', proposalsThisMonth: 3, resetAt: pastDate })
    vi.mocked(createClient).mockResolvedValue(fakeClient as never)

    const status = await getUsageStatus('user-123')

    expect(status.canGenerate).toBe(true)
    expect(status.used).toBe(0)
  })

  it('allows generation when no usage row exists yet', async () => {
    const fakeClient = {
      from: vi.fn().mockImplementation((table: string) => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: table === 'profiles' ? { plan: 'free' } : null,
          error: null,
        }),
        update: vi.fn().mockReturnThis(),
      })),
    }
    vi.mocked(createClient).mockResolvedValue(fakeClient as never)

    const status = await getUsageStatus('user-123')

    expect(status.canGenerate).toBe(true)
    expect(status.used).toBe(0)
  })
})
