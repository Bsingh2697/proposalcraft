import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateProposal } from '@/lib/claude'
import { getUsageStatus } from '@/lib/usage'

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const usageStatus = await getUsageStatus(user.id)
  if (!usageStatus.canGenerate) {
    return NextResponse.json(
      { error: 'Monthly limit reached. Upgrade to Pro for unlimited proposals.' },
      { status: 403 }
    )
  }

  const body = await req.json()
  const { jobDescription, skills, tone, length } = body

  if (!jobDescription?.trim()) {
    return NextResponse.json({ error: 'Job description is required' }, { status: 400 })
  }

  const proposal = await generateProposal({
    jobDescription: jobDescription.trim(),
    skills: skills?.trim() ?? '',
    tone: tone ?? 'professional',
    length: length ?? 'medium',
    plan: usageStatus.plan,
  })

  const admin = createAdminClient()
  const { error: insertError } = await admin.from('proposals').insert({
    user_id: user.id,
    job_description: jobDescription.trim(),
    skills: skills?.trim() ?? '',
    tone: tone ?? 'professional',
    output: proposal,
  })
  if (insertError) {
    console.error('Failed to save proposal:', insertError)
  }

  revalidatePath('/generate')
  return NextResponse.json({ proposal })
}
