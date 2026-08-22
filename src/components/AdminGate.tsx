'use client'

import { useEffect } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
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
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!loading && !user) {
      const rawNext = searchParams.get('next')
      // Decode URI components to catch encoded path-traversal attempts,
      // then allow only internal /admin paths.
      const decoded = rawNext ? decodeURIComponent(rawNext) : ''
      const safeNext = decoded.startsWith('/admin') && !decoded.startsWith('//') && !decoded.startsWith('/.')
        ? decoded
        : '/admin'
      router.replace(`/admin/login?next=${encodeURIComponent(safeNext)}`)
    }
  }, [loading, user, router, searchParams])

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
