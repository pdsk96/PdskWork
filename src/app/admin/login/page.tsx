'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLocale } from '@/i18n/LocaleProvider'
import { useAdminAuth } from '@/lib/use-admin-auth'

function LoginForm() {
  const { dict } = useLocale()
  const router = useRouter()
  const params = useSearchParams()
  const { signIn } = useAdminAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const next = params.get('next') ?? '/admin'
    try {
      await signIn(email, password)
      router.push(next)
    } catch {
      setError(dict.admin.invalid)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="glass-card auth-form" onSubmit={onSubmit}>
      <h1 className="auth-title">{dict.admin.loginTitle}</h1>
      <label className="field">
        <span className="field-label">{dict.admin.emailLabel}</span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="field-input"
        />
      </label>
      <label className="field">
        <span className="field-label">{dict.admin.passwordLabel}</span>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="field-input"
          aria-describedby={error ? 'auth-error' : undefined}
        />
      </label>
      {error ? (
        <p id="auth-error" role="alert" className="auth-error">
          {error}
        </p>
      ) : null}
      <button type="submit" className="primary-btn" disabled={loading}>
        {loading ? '…' : dict.admin.submit}
      </button>
    </form>
  )
}

export default function AdminLoginPage() {
  return (
    <main className="auth-shell">
      <Suspense fallback={<div className="glass-card auth-form" aria-busy="true" />}>
        <LoginForm />
      </Suspense>
    </main>
  )
}
