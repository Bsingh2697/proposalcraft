'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface ProposalFormProps {
  onResult: (proposal: string) => void
  canGenerate: boolean
  onUpgradeClick: () => void
}

export function ProposalForm({ onResult, canGenerate, onUpgradeClick }: ProposalFormProps) {
  const [jobDescription, setJobDescription] = useState('')
  const [skills, setSkills] = useState('')
  const [tone, setTone] = useState<'professional' | 'friendly' | 'bold'>('professional')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!canGenerate) { onUpgradeClick(); return }

    setLoading(true)
    setError('')

    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobDescription, skills, tone }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Something went wrong. Please try again.')
    } else {
      if (data.saveError) {
        setError(`DB save failed: ${data.saveError}`)
      }
      onResult(data.proposal)
    }

    setLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate a Proposal</CardTitle>
        <CardDescription>
          Paste the job posting below and we&apos;ll write a tailored proposal in seconds.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="job">Job description *</Label>
            <Textarea
              id="job"
              placeholder="Paste the full job posting or client message here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={6}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="skills">Your relevant skills</Label>
            <Input
              id="skills"
              placeholder="e.g. React, Node.js, 5 years full-stack experience"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tone">Tone</Label>
            <Select value={tone} onValueChange={(v) => setTone(v as typeof tone)}>
              <SelectTrigger id="tone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional — formal but warm</SelectItem>
                <SelectItem value="friendly">Friendly — conversational</SelectItem>
                <SelectItem value="bold">Bold — confident and direct</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button
            type="submit"
            className="w-full"
            disabled={loading || !jobDescription.trim()}
          >
            {loading ? 'Generating...' : canGenerate ? 'Generate Proposal' : 'Upgrade to Generate'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
