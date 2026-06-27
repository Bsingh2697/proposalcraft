import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getUsageStatus } from '@/lib/usage'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UsageBadge } from '@/components/UsageBadge'
import { AppNav } from '@/components/AppNav'
import { ProposalList } from './ProposalList'

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
      .select('id, job_description, tone, output, created_at')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: false }),
    getUsageStatus(user.id),
    searchParams,
  ])

  const allProposals = proposals ?? []

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)
  const thisMonth = allProposals.filter(p => new Date(p.created_at) >= startOfMonth).length

  const toneCounts = allProposals.reduce((acc, p) => {
    acc[p.tone] = (acc[p.tone] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)
  const topTone = Object.entries(toneCounts).sort(([, a], [, b]) => b - a)[0]?.[0]

  return (
    <div className="min-h-screen bg-background">
      <AppNav email={user.email!} active="history" />

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Proposal History</h1>
          <UsageBadge used={usageStatus.used} plan={usageStatus.plan} />
        </div>

        {allProposals.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            <Card>
              <CardContent className="pt-4 pb-4">
                <p className="text-2xl font-bold">{allProposals.length}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Total generated</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4">
                <p className="text-2xl font-bold">{thisMonth}</p>
                <p className="text-xs text-muted-foreground mt-0.5">This month</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4">
                <p className="text-2xl font-bold capitalize">{topTone ?? '—'}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Favorite tone</p>
              </CardContent>
            </Card>
          </div>
        )}

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

        {allProposals.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <p>No proposals yet.</p>
              <Link href="/generate">
                <Button className="mt-4">Generate your first proposal</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <ProposalList proposals={allProposals} />
        )}
      </main>
    </div>
  )
}
