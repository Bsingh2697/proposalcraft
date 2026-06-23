'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const features = {
  free: [
    '3 proposals per month',
    'Professional, Friendly, Bold tones',
    'Proposal history',
    'Standard quality (Claude Haiku)',
  ],
  pro: [
    'Unlimited proposals',
    'Professional, Friendly, Bold tones',
    'Full proposal history',
    'Higher quality output (Claude Sonnet)',
    'Priority generation speed',
  ],
}

export default function PricingPage() {
  const [loading, setLoading] = useState(false)

  async function handleUpgrade() {
    setLoading(true)
    const res = await fetch('/api/lemonsqueezy/checkout', { method: 'POST' })
    const data = await res.json()

    if (data.url) {
      window.location.href = data.url
    } else {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b px-6 py-3 flex items-center justify-between">
        <Link href="/" className="font-semibold text-lg">ProposalCraft</Link>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">Sign in</Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Get started free</Button>
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3">Simple pricing</h1>
          <p className="text-muted-foreground text-lg">Start free. Upgrade when you need more.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Free */}
          <Card>
            <CardHeader>
              <CardTitle>Free</CardTitle>
              <CardDescription>Perfect to get started</CardDescription>
              <div className="pt-2">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-muted-foreground"> / month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {features.free.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <span className="text-green-500">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="block">
                <Button variant="outline" className="w-full">Get started free</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Pro */}
          <Card className="border-primary">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Pro</CardTitle>
                <Badge>Most popular</Badge>
              </div>
              <CardDescription>For serious freelancers</CardDescription>
              <div className="pt-2">
                <span className="text-4xl font-bold">$9</span>
                <span className="text-muted-foreground"> / month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {features.pro.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <span className="text-green-500">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Button className="w-full" onClick={handleUpgrade} disabled={loading}>
                {loading ? 'Redirecting...' : 'Upgrade to Pro'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
