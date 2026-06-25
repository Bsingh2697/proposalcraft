'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface SettingsFormProps {
  initialProfile: {
    freelancer_name: string | null
    freelancer_skills: string | null
    freelancer_bio: string | null
  }
}

export function SettingsForm({ initialProfile }: SettingsFormProps) {
  const [name, setName] = useState(initialProfile.freelancer_name ?? '')
  const [skills, setSkills] = useState(initialProfile.freelancer_skills ?? '')
  const [bio, setBio] = useState(initialProfile.freelancer_bio ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)

    await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        freelancer_name: name,
        freelancer_skills: skills,
        freelancer_bio: bio,
      }),
    })

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Freelancer Profile</CardTitle>
        <CardDescription>
          Save your details once — they&apos;ll auto-fill on every proposal.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Your name</Label>
            <Input
              id="name"
              placeholder="e.g. Rahul Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="skills">Your skills & experience</Label>
            <Textarea
              id="skills"
              placeholder="e.g. React, Node.js, 5 years full-stack experience, built 20+ SaaS apps"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              This gets auto-filled in the proposal form when you click &quot;Load profile&quot;.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Short bio (optional)</Label>
            <Textarea
              id="bio"
              placeholder="e.g. Full-stack developer specializing in SaaS products. Previously worked with 50+ clients on Upwork."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
            />
          </div>

          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Profile'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
