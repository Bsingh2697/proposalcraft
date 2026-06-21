import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { UsageBadge } from '@/components/UsageBadge'

describe('UsageBadge', () => {
  it('shows "Pro — Unlimited" for pro users', () => {
    render(<UsageBadge used={0} plan="pro" />)
    expect(screen.getByText('Pro — Unlimited')).toBeInTheDocument()
  })

  it('shows remaining proposals for free users', () => {
    render(<UsageBadge used={1} plan="free" />)
    expect(screen.getByText('2 free proposals left')).toBeInTheDocument()
  })

  it('shows singular "proposal" when 1 remains', () => {
    render(<UsageBadge used={2} plan="free" />)
    expect(screen.getByText('1 free proposal left')).toBeInTheDocument()
  })

  it('shows "Limit reached" when all 3 free proposals are used', () => {
    render(<UsageBadge used={3} plan="free" />)
    expect(screen.getByText('Limit reached')).toBeInTheDocument()
  })
})
