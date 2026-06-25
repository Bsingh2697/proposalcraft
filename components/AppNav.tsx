import Link from 'next/link'
import { LogoutButton } from './LogoutButton'

interface AppNavProps {
  email: string
  active: 'generate' | 'history' | 'settings'
}

export function AppNav({ email, active }: AppNavProps) {
  function navLink(href: string, label: string, key: AppNavProps['active']) {
    return (
      <Link
        href={href}
        className={`text-sm ${active === key ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'}`}
      >
        {label}
      </Link>
    )
  }

  return (
    <nav className="border-b px-6 py-3 flex items-center justify-between">
      <Link href="/generate" className="font-semibold text-lg">ProposalCraft</Link>
      <div className="flex items-center gap-4">
        {navLink('/generate', 'Generate', 'generate')}
        {navLink('/dashboard', 'History', 'history')}
        {navLink('/settings', 'Settings', 'settings')}
        <span className="text-sm text-muted-foreground">{email}</span>
        <LogoutButton />
      </div>
    </nav>
  )
}
