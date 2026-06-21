'use client'

import { Badge } from '@/components/ui/badge'

interface UsageBadgeProps {
  used: number
  plan: 'free' | 'pro'
}

export function UsageBadge({ used, plan }: UsageBadgeProps) {
  if (plan === 'pro') {
    return <Badge variant="default">Pro — Unlimited</Badge>
  }

  const remaining = 3 - used
  const variant = remaining === 0 ? 'destructive' : remaining === 1 ? 'secondary' : 'outline'

  return (
    <Badge variant={variant}>
      {remaining === 0 ? 'Limit reached' : `${remaining} free proposal${remaining !== 1 ? 's' : ''} left`}
    </Badge>
  )
}
