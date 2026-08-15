'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAdminAuth } from '@/lib/use-admin-auth'

/**
 * AdminGate — client-side auth guard for admin pages.
 *
 * Static export has no server/middleware, so route protection runs in the
 * browser: while Firebase Auth state is loading, a skeleton renders; once
 * resolved, unauthenticated visitors are redirected to the login page with a
 * `next` param so they return here after signing in. Authenticated visitors
 * see the gated content.
 */
export default function AdminGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAdminAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !user) {
      const next = encodeURIComponent(pathname ?? '/admin')
      router.replace(`/admin/login?next=${next}`)
    }
  }, [loading, user, router, pathname])

  if (loading || !user) {
    return (
      <main className="auth-shell" aria-busy="true">
        <section className="glass-card admin-console">
          <div className="skeleton skeleton--title" />
          <div className="skeleton skeleton--lead" />
        </section>
      </main>
    )
  }

  return <>{children}</>
}
