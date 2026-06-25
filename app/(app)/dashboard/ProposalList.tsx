'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface Proposal {
  id: string
  job_description: string
  tone: string
  output: string
  created_at: string
}

export function ProposalList({ proposals }: { proposals: Proposal[] }) {
  const [items, setItems] = useState(proposals)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [confirming, setConfirming] = useState<string | null>(null)

  async function handleCopy(id: string, text: string) {
    await navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  async function handleDelete(id: string) {
    await fetch(`/api/proposals/${id}`, { method: 'DELETE' })
    setItems((prev) => prev.filter((p) => p.id !== id))
    setConfirming(null)
    if (expanded === id) setExpanded(null)
  }

  return (
    <div className="space-y-3">
      {items.map((p) => (
        <Card
          key={p.id}
          className="cursor-pointer hover:border-foreground/30 transition-colors"
          onClick={() => setExpanded(expanded === p.id ? null : p.id)}
        >
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-sm font-medium line-clamp-2">
                {p.job_description.slice(0, 120)}
                {p.job_description.length > 120 ? '...' : ''}
              </CardTitle>
              <Badge variant="outline" className="shrink-0 capitalize">
                {p.tone}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <p className="text-xs text-muted-foreground">
              {new Date(p.created_at).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric',
              })}
            </p>

            {expanded === p.id && (
              <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                <p className="text-sm whitespace-pre-wrap border rounded-md p-3 bg-muted/50">
                  {p.output}
                </p>
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" variant="outline" onClick={() => handleCopy(p.id, p.output)}>
                    {copied === p.id ? 'Copied!' : 'Copy Proposal'}
                  </Button>
                  {confirming === p.id ? (
                    <>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(p.id)}>
                        Confirm Delete
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => { e.stopPropagation(); setConfirming(null) }}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={(e) => { e.stopPropagation(); setConfirming(p.id) }}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
