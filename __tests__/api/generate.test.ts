import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// Mock all external dependencies
vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }))
vi.mock('@/lib/claude', () => ({ generateProposal: vi.fn() }))
vi.mock('@/lib/usage', () => ({
  getUsageStatus: vi.fn(),
  incrementUsage: vi.fn(),
}))

import { POST } from '@/app/api/generate/route'
import { createClient } from '@/lib/supabase/server'
import { generateProposal } from '@/lib/claude'
import { getUsageStatus, incrementUsage } from '@/lib/usage'

function makeRequest(body: object) {
  return new NextRequest('http://localhost:3000/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

function makeSupabase(user: object | null, insertError: null | object = null) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user },
        error: user ? null : { message: 'Not authenticated' },
      }),
    },
    from: vi.fn().mockReturnValue({
      insert: vi.fn().mockResolvedValue({ error: insertError }),
    }),
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(incrementUsage).mockResolvedValue(undefined)
})

describe('POST /api/generate', () => {
  it('returns 401 when user is not logged in', async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabase(null) as never)

    const res = await POST(makeRequest({ jobDescription: 'test job' }))
    const body = await res.json()

    expect(res.status).toBe(401)
    expect(body.error).toBe('Unauthorized')
  })

  it('returns 403 when free user has hit the monthly limit', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabase({ id: 'user-1', email: 'test@test.com' }) as never
    )
    vi.mocked(getUsageStatus).mockResolvedValue({
      used: 3,
      limit: 3,
      canGenerate: false,
      plan: 'free',
    })

    const res = await POST(makeRequest({ jobDescription: 'test job' }))
    const body = await res.json()

    expect(res.status).toBe(403)
    expect(body.error).toContain('Monthly limit reached')
  })

  it('returns 400 when job description is missing', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabase({ id: 'user-1', email: 'test@test.com' }) as never
    )
    vi.mocked(getUsageStatus).mockResolvedValue({
      used: 0, limit: 3, canGenerate: true, plan: 'free',
    })

    const res = await POST(makeRequest({ jobDescription: '   ' }))
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error).toBe('Job description is required')
  })

  it('returns the generated proposal on success', async () => {
    const fakeProposal = 'Hi, I noticed you need a React developer...'

    vi.mocked(createClient).mockResolvedValue(
      makeSupabase({ id: 'user-1', email: 'test@test.com' }) as never
    )
    vi.mocked(getUsageStatus).mockResolvedValue({
      used: 1, limit: 3, canGenerate: true, plan: 'free',
    })
    vi.mocked(generateProposal).mockResolvedValue(fakeProposal)

    const res = await POST(makeRequest({
      jobDescription: 'Looking for a React developer',
      skills: 'React, TypeScript',
      tone: 'professional',
    }))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.proposal).toBe(fakeProposal)
    expect(generateProposal).toHaveBeenCalledWith(
      expect.objectContaining({ tone: 'professional', plan: 'free' })
    )
    expect(incrementUsage).toHaveBeenCalledWith('user-1')
  })

  it('increments usage after successful generation', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabase({ id: 'user-99' }) as never
    )
    vi.mocked(getUsageStatus).mockResolvedValue({
      used: 0, limit: 3, canGenerate: true, plan: 'free',
    })
    vi.mocked(generateProposal).mockResolvedValue('A great proposal')

    await POST(makeRequest({ jobDescription: 'some job' }))

    expect(incrementUsage).toHaveBeenCalledWith('user-99')
  })

  it('does not call Claude when user is unauthenticated', async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabase(null) as never)

    await POST(makeRequest({ jobDescription: 'some job' }))

    expect(generateProposal).not.toHaveBeenCalled()
  })
})
