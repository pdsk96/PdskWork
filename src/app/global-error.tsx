'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { useLocale } from '@/i18n/LocaleProvider'

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  const { dict } = useLocale()

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Global error:', error)
    }
  }, [error])

  return (
    <html lang="en">
      <body>
        <main className="page">
          <section className="glass-card page-card" style={{ maxWidth: '600px', margin: '4rem auto', textAlign: 'center' }}>
            <h1 style={{ fontSize: '4rem', margin: 0, background: 'linear-gradient(120deg, var(--cyan), var(--magenta))', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
              500
            </h1>
            <h2 className="page-title" style={{ marginTop: '1rem' }}>Signal lost</h2>
            <p className="page-lead">The grid encountered an unexpected fault. The error has been logged.</p>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap', marginTop: '1.5rem' }}>
              <button type="button" className="primary-btn" onClick={reset}>
                Reconnect
              </button>
              <Link href="/" className="ghost-btn">
                Return to base
              </Link>
            </div>
          </section>
        </main>
      </body>
    </html>
  )
}
