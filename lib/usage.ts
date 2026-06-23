import { createClient } from '@/lib/supabase/server'

const FREE_LIMIT = 3

export interface UsageStatus {
  used: number
  limit: number
  canGenerate: boolean
  plan: 'free' | 'pro'
}

export async function getUsageStatus(userId: string): Promise<UsageStatus> {
  const supabase = await createClient()

  // Fetch user plan and usage in parallel
  const [profileResult, usageResult] = await Promise.all([
    supabase.from('profiles').select('plan').eq('id', userId).single(),
    supabase.from('usage').select('proposals_this_month, reset_at').eq('user_id', userId).single(),
  ])

  const plan = (profileResult.data?.plan ?? 'free') as 'free' | 'pro'

  if (plan === 'pro') {
    return { used: 0, limit: Infinity, canGenerate: true, plan }
  }

  const usage = usageResult.data
  if (!usage) {
    return { used: 0, limit: FREE_LIMIT, canGenerate: true, plan }
  }

  // Reset counter if the monthly window has passed
  if (new Date(usage.reset_at) <= new Date()) {
    await supabase
      .from('usage')
      .update({
        proposals_this_month: 0,
        reset_at: getNextMonthStart(),
      })
      .eq('user_id', userId)

    return { used: 0, limit: FREE_LIMIT, canGenerate: true, plan }
  }

  const used = usage.proposals_this_month
  return {
    used,
    limit: FREE_LIMIT,
    canGenerate: used < FREE_LIMIT,
    plan,
  }
}

export async function incrementUsage(userId: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.rpc('increment_usage', { p_user_id: userId })
  if (error) throw error
}

function getNextMonthStart(): string {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString()
}
