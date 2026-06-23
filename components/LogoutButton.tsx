'use client'

import { logout } from '@/app/actions/auth'

export function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        Log out
      </button>
    </form>
  )
}
