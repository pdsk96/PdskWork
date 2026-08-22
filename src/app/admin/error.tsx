'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { useLocale } from '@/i18n/LocaleProvider'

export default function AdminError({ error, reset }: { error: Error; reset: () => void }) {
  const { dict } = useLocale()

  useEffect(() => {
    // Log error to console in development
    if (process.env.NODE_ENV !== 'production') {
      console.error('Admin route error:', error)
    }
  }, [error])

  return (
    <main className="auth-shell">
      <section className="glass-card admin-console">
        <h2 className="auth-title">Something went wrong</h2>
        <p className="admin-welcome">The admin console encountered an unexpected error.</p>
        <div className="glass-card" style={{ padding: '1rem', margin: '1rem 0', background: 'rgba(255,0,0,0.05)' }}>
          <code style={{ fontSize: '0.85rem', wordBreak: 'break-word' }}>{error.message}</code>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button type="button" className="primary-btn" onClick={reset}>
            Try again
          </button>
          <Link href="/admin" className="ghost-btn">
            ← Back to admin
          </Link>
        </div>
      </section>
    </main>
  )
}
