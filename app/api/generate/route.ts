import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { generateProposal } from '@/lib/claude'
import { getUsageStatus, incrementUsage } from '@/lib/usage'

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  // 1. Verify the user is logged in
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Check usage limits
  const usageStatus = await getUsageStatus(user.id)
  if (!usageStatus.canGenerate) {
    return NextResponse.json(
      { error: 'Monthly limit reached. Upgrade to Pro for unlimited proposals.' },
      { status: 403 }
    )
  }

  // 3. Parse and validate the request body
  const body = await req.json()
  const { jobDescription, skills, tone } = body

  if (!jobDescription?.trim()) {
    return NextResponse.json({ error: 'Job description is required' }, { status: 400 })
  }

  // 4. Generate the proposal using Claude
  const proposal = await generateProposal({
    jobDescription: jobDescription.trim(),
    skills: skills?.trim() ?? '',
    tone: tone ?? 'professional',
    plan: usageStatus.plan,
  })

  // 5. Save to database and increment usage counter in parallel
  await Promise.all([
    supabase.from('proposals').insert({
      user_id: user.id,
      job_description: jobDescription.trim(),
      skills: skills?.trim() ?? '',
      tone: tone ?? 'professional',
      output: proposal,
    }),
    incrementUsage(user.id),
  ])

  revalidatePath('/generate')
  return NextResponse.json({ proposal })
}
