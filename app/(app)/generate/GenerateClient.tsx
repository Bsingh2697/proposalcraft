'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProposalForm } from '@/components/ProposalForm'
import type { FormInputs } from '@/components/ProposalForm'
import { ProposalOutput } from '@/components/ProposalOutput'
import { UsageBadge } from '@/components/UsageBadge'
import type { UsageStatus } from '@/lib/usage'

interface GenerateClientProps {
  usageStatus: UsageStatus
}

export function GenerateClient({ usageStatus: initialUsageStatus }: GenerateClientProps) {
  const router = useRouter()
  const [proposal, setProposal] = useState<string | null>(null)
  const [usage, setUsage] = useState(initialUsageStatus)
  const [lastInputs, setLastInputs] = useState<FormInputs | null>(null)
  const [regenerating, setRegenerating] = useState(false)

  function incrementUsageDisplay() {
    setUsage((prev) => ({
      ...prev,
      used: prev.used + 1,
      canGenerate: prev.used + 1 < prev.limit,
    }))
  }

  function handleResult(text: string, inputs: FormInputs) {
    setProposal(text)
    setLastInputs(inputs)
    incrementUsageDisplay()
  }

  async function handleRegenerate() {
    if (!lastInputs || regenerating) return
    setRegenerating(true)
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lastInputs),
      })
      const data = await res.json()
      if (res.ok) {
        setProposal(data.proposal)
        incrementUsageDisplay()
      }
    } finally {
      setRegenerating(false)
    }
  }

  function handleReset() {
    setProposal(null)
    setLastInputs(null)
    router.refresh()
  }

  function handleUpgradeClick() {
    router.push('/pricing')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Generate Proposal</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Paste a job posting and get a tailored proposal in seconds.
          </p>
        </div>
        <UsageBadge used={usage.used} plan={usage.plan} />
      </div>

      {!usage.canGenerate && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          You&apos;ve used all 3 free proposals this month.{' '}
          <button onClick={handleUpgradeClick} className="underline font-medium">
            Upgrade to Pro
          </button>{' '}
          for unlimited proposals ($9/month).
        </div>
      )}

      {proposal ? (
        <ProposalOutput
          proposal={proposal}
          onReset={handleReset}
          onRegenerate={handleRegenerate}
          regenerating={regenerating}
        />
      ) : (
        <ProposalForm
          onResult={handleResult}
          canGenerate={usage.canGenerate}
          onUpgradeClick={handleUpgradeClick}
        />
      )}
    </div>
  )
}
