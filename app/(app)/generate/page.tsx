import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getUsageStatus } from '@/lib/usage'
import { GenerateClient } from './GenerateClient'

export default async function GeneratePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const usageStatus = await getUsageStatus(user.id)

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b px-6 py-3 flex items-center justify-between">
        <Link href="/generate" className="font-semibold text-lg">ProposalCraft</Link>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
            History
          </Link>
          <span className="text-sm text-muted-foreground">{user.email}</span>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-4 py-10">
        <GenerateClient usageStatus={usageStatus} />
      </main>
    </div>
  )
}
