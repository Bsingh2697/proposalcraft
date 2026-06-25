'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'

interface ProposalScore {
  score: number
  strengths: string[]
  improvements: string[]
}

interface ProposalOutputProps {
  proposal: string
  onReset: () => void
  onRegenerate: () => Promise<void>
  regenerating?: boolean
}

export function ProposalOutput({ proposal, onReset, onRegenerate, regenerating }: ProposalOutputProps) {
  const [text, setText] = useState(proposal)
  const [copied, setCopied] = useState(false)
  const [scoring, setScoring] = useState(false)
  const [score, setScore] = useState<ProposalScore | null>(null)

  useEffect(() => {
    setText(proposal)
    setScore(null)
  }, [proposal])

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length

  async function handleCopy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleDownload() {
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'proposal.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleScore() {
    setScoring(true)
    try {
      const res = await fetch('/api/score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proposalText: text }),
      })
      if (res.ok) setScore(await res.json())
    } finally {
      setScoring(false)
    }
  }

  const scoreBadgeClass = score
    ? score.score >= 8
      ? 'bg-green-100 text-green-800 border-green-200'
      : score.score >= 6
        ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
        : 'bg-red-100 text-red-800 border-red-200'
    : ''

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Your Proposal</CardTitle>
          <span className="text-xs text-muted-foreground">{wordCount} words</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={12}
          className="resize-none text-sm leading-relaxed"
        />

        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={handleCopy}>
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          <Button size="sm" variant="outline" onClick={handleDownload}>
            Download .txt
          </Button>
          <Button size="sm" variant="outline" onClick={onRegenerate} disabled={regenerating}>
            {regenerating ? 'Generating...' : 'Regenerate'}
          </Button>
          <Button size="sm" variant="outline" onClick={handleScore} disabled={scoring || !!score}>
            {scoring ? 'Scoring...' : score ? `Score: ${score.score}/10` : 'Check Quality'}
          </Button>
          <Button size="sm" variant="ghost" onClick={onReset}>
            New proposal
          </Button>
        </div>

        {score && (
          <div className="rounded-md border p-3 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Quality Score</span>
              <Badge variant="outline" className={scoreBadgeClass}>
                {score.score}/10
              </Badge>
            </div>
            {score.strengths.length > 0 && (
              <ul className="space-y-1">
                {score.strengths.map((s, i) => (
                  <li key={i} className="text-xs text-green-700 flex gap-1.5">
                    <span className="shrink-0">✓</span><span>{s}</span>
                  </li>
                ))}
              </ul>
            )}
            {score.improvements.length > 0 && (
              <ul className="space-y-1">
                {score.improvements.map((s, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex gap-1.5">
                    <span className="shrink-0">↗</span><span>{s}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
