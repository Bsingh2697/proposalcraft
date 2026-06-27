import { describe, it, expect, vi, beforeEach } from 'vitest'

// Hoist the mock create function so we can swap it per test
const mockCreate = vi.fn()

vi.mock('groq-sdk', () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: { completions: { create: mockCreate } },
  })),
}))

// Import AFTER mock is set up
import { generateProposal } from '@/lib/claude'

beforeEach(() => {
  mockCreate.mockReset()
})

describe('generateProposal', () => {
  it('returns the generated proposal text', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: 'Dear hiring manager, I noticed your need for...' } }],
    })

    const result = await generateProposal({
      jobDescription: 'We need a React developer to build a dashboard',
      skills: 'React, TypeScript, 5 years experience',
      tone: 'professional',
      plan: 'free',
      length: 'medium',
      platform: 'general',
      name: '',
      bio: '',
    })

    expect(result).toBe('Dear hiring manager, I noticed your need for...')
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: 'llama-3.3-70b-versatile',
        messages: expect.arrayContaining([
          expect.objectContaining({ role: 'system' }),
          expect.objectContaining({
            role: 'user',
            content: expect.stringContaining('React developer'),
          }),
        ]),
      })
    )
  })

  it('throws when Groq returns empty content', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: null } }],
    })

    await expect(
      generateProposal({
        jobDescription: 'test',
        skills: 'test',
        tone: 'friendly',
        plan: 'free',
        length: 'medium',
        platform: 'general',
        name: '',
        bio: '',
      })
    ).rejects.toThrow('No response from Groq')
  })

  it('includes the job description in the user message', async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: 'some proposal' } }],
    })

    await generateProposal({
      jobDescription: 'Looking for a Python data engineer',
      skills: 'Python, dbt, Snowflake',
      tone: 'bold',
      plan: 'pro',
      length: 'medium',
      platform: 'general',
      name: '',
      bio: '',
    })

    const call = mockCreate.mock.calls[0][0]
    const userMessage = call.messages.find((m: { role: string }) => m.role === 'user')
    expect(userMessage.content).toContain('Python data engineer')
    expect(userMessage.content).toContain('bold')
  })
})
