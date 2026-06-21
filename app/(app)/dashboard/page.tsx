import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getUsageStatus } from '@/lib/usage'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { UsageBadge } from '@/components/UsageBadge'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ upgraded?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [{ data: proposals }, usageStatus, params] = await Promise.all([
    supabase
      .from('proposals')
      .select('id, job_description, tone, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    getUsageStatus(user.id),
    searchParams,
  ])

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b px-6 py-3 flex items-center justify-between">
        <Link href="/generate" className="font-semibold text-lg">ProposalCraft</Link>
        <div className="flex items-center gap-4">
          <Link href="/generate" className="text-sm text-muted-foreground hover:text-foreground">
            Generate
          </Link>
          <span className="text-sm text-muted-foreground">{user.email}</span>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Proposal History</h1>
          <UsageBadge used={usageStatus.used} plan={usageStatus.plan} />
        </div>

        {params.upgraded && (
          <div className="rounded-md bg-green-50 border border-green-200 p-4 text-sm text-green-800">
            Welcome to Pro! You now have unlimited proposals.
          </div>
        )}

        {usageStatus.plan === 'free' && (
          <div className="rounded-md border p-4 flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Upgrade to Pro</p>
              <p className="text-muted-foreground text-sm">Unlimited proposals for $9/month.</p>
            </div>
            <Link href="/pricing">
              <Button size="sm">Upgrade</Button>
            </Link>
          </div>
        )}

        {!proposals || proposals.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <p>No proposals yet.</p>
              <Link href="/generate">
                <Button className="mt-4">Generate your first proposal</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {proposals.map((p) => (
              <Card key={p.id}>
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
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground">
                    {new Date(p.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
