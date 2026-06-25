import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { scoreProposal } from '@/lib/claude'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { proposalText } = await req.json()
  if (!proposalText?.trim()) return NextResponse.json({ error: 'No proposal text' }, { status: 400 })

  const result = await scoreProposal(proposalText.trim())
  return NextResponse.json(result)
}
