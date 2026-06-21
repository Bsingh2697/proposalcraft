import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/stripe', () => ({ getStripe: vi.fn() }))
vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }))

import { POST } from '@/app/api/stripe/webhook/route'
import { getStripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

function makeRequest(body: string, signature: string | null = 'valid-sig') {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (signature) headers['stripe-signature'] = signature
  return new NextRequest('http://localhost:3000/api/stripe/webhook', {
    method: 'POST',
    headers,
    body,
  })
}

function makeStripe(event: object | null = null, shouldThrow = false) {
  return {
    webhooks: {
      constructEvent: vi.fn().mockImplementation(() => {
        if (shouldThrow) throw new Error('Invalid signature')
        return event
      }),
    },
  }
}

function makeSupabase() {
  const updateMock = vi.fn().mockReturnThis()
  const eqMock = vi.fn().mockResolvedValue({ error: null })
  return {
    from: vi.fn().mockReturnValue({
      update: updateMock,
      eq: eqMock,
    }),
    update: updateMock,
    eq: eqMock,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test'
})

describe('POST /api/stripe/webhook', () => {
  it('returns 400 when stripe-signature header is missing', async () => {
    const res = await POST(makeRequest('{}', null))
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error).toBe('Missing stripe-signature header')
  })

  it('returns 400 when signature verification fails', async () => {
    vi.mocked(getStripe).mockReturnValue(makeStripe(null, true) as never)
    vi.mocked(createClient).mockResolvedValue(makeSupabase() as never)

    const res = await POST(makeRequest('{}'))
    const body = await res.json()

    expect(res.status).toBe(400)
    expect(body.error).toBe('Invalid signature')
  })

  it('sets plan to pro on checkout.session.completed', async () => {
    const event = {
      type: 'checkout.session.completed',
      data: {
        object: {
          client_reference_id: 'user-123',
          subscription: 'sub_abc',
        },
      },
    }
    vi.mocked(getStripe).mockReturnValue(makeStripe(event) as never)

    const supabase = makeSupabase()
    vi.mocked(createClient).mockResolvedValue(supabase as never)

    const res = await POST(makeRequest(JSON.stringify(event)))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.received).toBe(true)
    expect(supabase.from).toHaveBeenCalledWith('profiles')
  })

  it('sets plan to free on customer.subscription.deleted', async () => {
    const event = {
      type: 'customer.subscription.deleted',
      data: {
        object: {
          metadata: { supabase_user_id: 'user-456' },
          status: 'canceled',
        },
      },
    }
    vi.mocked(getStripe).mockReturnValue(makeStripe(event) as never)

    const supabase = makeSupabase()
    vi.mocked(createClient).mockResolvedValue(supabase as never)

    const res = await POST(makeRequest(JSON.stringify(event)))

    expect(res.status).toBe(200)
    expect(supabase.from).toHaveBeenCalledWith('profiles')
  })

  it('returns 200 for unhandled event types without crashing', async () => {
    const event = { type: 'payment_intent.created', data: { object: {} } }
    vi.mocked(getStripe).mockReturnValue(makeStripe(event) as never)
    vi.mocked(createClient).mockResolvedValue(makeSupabase() as never)

    const res = await POST(makeRequest(JSON.stringify(event)))
    expect(res.status).toBe(200)
  })
})
