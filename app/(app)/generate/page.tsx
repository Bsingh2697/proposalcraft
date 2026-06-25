import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getUsageStatus } from '@/lib/usage'
import { AppNav } from '@/components/AppNav'
import { GenerateClient } from './GenerateClient'

export default async function GeneratePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const [usageStatus, { data: profile }] = await Promise.all([
    getUsageStatus(user.id),
    admin.from('profiles').select('freelancer_name, freelancer_skills, freelancer_bio').eq('id', user.id).single(),
  ])

  return (
    <div className="min-h-screen bg-background">
      <AppNav email={user.email!} active="generate" />
      <main className="max-w-2xl mx-auto px-4 py-10">
        <GenerateClient usageStatus={usageStatus} savedProfile={profile} />
      </main>
    </div>
  )
}
