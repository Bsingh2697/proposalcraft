import { createAdminClient } from '@/lib/supabase/admin'

const FREE_LIMIT = 3

export interface UsageStatus {
  used: number
  limit: number
  canGenerate: boolean
  plan: 'free' | 'pro'
}

export async function getUsageStatus(userId: string): Promise<UsageStatus> {
  const supabase = createAdminClient()

  const profileResult = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', userId)
    .single()

  const plan = (profileResult.data?.plan ?? 'free') as 'free' | 'pro'

  if (plan === 'pro') {
    return { used: 0, limit: Infinity, canGenerate: true, plan }
  }

  // Count proposals generated this calendar month directly from the proposals table.
  // This is always accurate — no separate counter that can fall out of sync.
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { count } = await supabase
    .from('proposals')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', startOfMonth.toISOString())

  const used = count ?? 0
  return {
    used,
    limit: FREE_LIMIT,
    canGenerate: used < FREE_LIMIT,
    plan,
  }
}
