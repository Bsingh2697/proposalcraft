'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

export interface FormInputs {
  jobDescription: string
  skills: string
  tone: 'professional' | 'friendly' | 'bold'
  length: 'short' | 'medium' | 'long'
}

interface ProposalFormProps {
  onResult: (proposal: string, inputs: FormInputs) => void
  canGenerate: boolean
  onUpgradeClick: () => void
}

export function ProposalForm({ onResult, canGenerate, onUpgradeClick }: ProposalFormProps) {
  const [jobDescription, setJobDescription] = useState('')
  const [skills, setSkills] = useState('')
  const [tone, setTone] = useState<'professional' | 'friendly' | 'bold'>('professional')
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium')
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
      body: JSON.stringify({ jobDescription, skills, tone, length }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Something went wrong. Please try again.')
    } else {
      onResult(data.proposal, { jobDescription, skills, tone, length })
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
              <Select value={tone} onValueChange={(v) => setTone(v as typeof tone)}>
                <SelectTrigger id="tone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="friendly">Friendly</SelectItem>
                  <SelectItem value="bold">Bold</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="length">Length</Label>
              <Select value={length} onValueChange={(v) => setLength(v as typeof length)}>
                <SelectTrigger id="length">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short (80–120 words)</SelectItem>
                  <SelectItem value="medium">Medium (150–200 words)</SelectItem>
                  <SelectItem value="long">Long (250–300 words)</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
