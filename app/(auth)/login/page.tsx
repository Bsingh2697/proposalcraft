// force-dynamic: this page renders Supabase client at runtime, not build time
export const dynamic = 'force-dynamic'

import { LoginForm } from './LoginForm'

export default function LoginPage() {
  return <LoginForm />
}
