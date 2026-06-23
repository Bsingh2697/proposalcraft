'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProposalForm } from '@/components/ProposalForm'
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

  function handleResult(text: string) {
    setProposal(text)
    setUsage((prev) => ({
      ...prev,
      used: prev.used + 1,
      canGenerate: prev.used + 1 < prev.limit,
    }))
  }

  function handleReset() {
    setProposal(null)
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
        <ProposalOutput proposal={proposal} onReset={handleReset} />
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
