'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface ProposalOutputProps {
  proposal: string
  onReset: () => void
  onRegenerate: () => Promise<void>
  regenerating?: boolean
}

export function ProposalOutput({ proposal, onReset, onRegenerate, regenerating }: ProposalOutputProps) {
  const [text, setText] = useState(proposal)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setText(proposal)
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
          <Button size="sm" variant="ghost" onClick={onReset}>
            New proposal
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
