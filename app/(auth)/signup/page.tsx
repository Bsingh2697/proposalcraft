// force-dynamic: this page renders Supabase client at runtime, not build time
export const dynamic = 'force-dynamic'

import { SignupForm } from './SignupForm'

export default function SignupPage() {
  return <SignupForm />
}
