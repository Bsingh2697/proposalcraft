import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data } = await admin
    .from('profiles')
    .select('freelancer_name, freelancer_skills, freelancer_bio')
    .eq('id', user.id)
    .single()

  return NextResponse.json(data ?? {})
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { freelancer_name, freelancer_skills, freelancer_bio } = body

  const admin = createAdminClient()
  const { error } = await admin
    .from('profiles')
    .update({
      freelancer_name: freelancer_name?.trim() || null,
      freelancer_skills: freelancer_skills?.trim() || null,
      freelancer_bio: freelancer_bio?.trim() || null,
    })
    .eq('id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
