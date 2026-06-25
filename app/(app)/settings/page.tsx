import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { AppNav } from '@/components/AppNav'
import { SettingsForm } from './SettingsForm'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('freelancer_name, freelancer_skills, freelancer_bio')
    .eq('id', user.id)
    .single()

  return (
    <div className="min-h-screen bg-background">
      <AppNav email={user.email!} active="settings" />
      <main className="max-w-2xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        <SettingsForm
          initialProfile={profile ?? { freelancer_name: null, freelancer_skills: null, freelancer_bio: null }}
        />
      </main>
    </div>
  )
}
