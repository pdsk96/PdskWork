'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLocale } from '@/i18n/LocaleProvider'
import { useAdminAuth } from '@/lib/use-admin-auth'
import AdminGate from '@/components/AdminGate'
import AdminNav from '@/components/AdminNav'

export default function AdminPage() {
  return (
    <AdminGate>
      <AdminConsole />
    </AdminGate>
  )
}

function AdminConsole() {
  const { dict } = useLocale()
  const { signOutAdmin } = useAdminAuth()
  const router = useRouter()

  async function onLogout() {
    await signOutAdmin()
    router.push('/admin/login')
  }

  return (
    <main className="auth-shell">
      <section className="glass-card admin-console">
        <h1 className="auth-title">{dict.admin.title}</h1>
        <p className="admin-welcome">{dict.admin.welcome}</p>

        <AdminNav />

        <button type="button" className="ghost-btn" onClick={onLogout} style={{ marginTop: '1rem' }}>
          {dict.admin.logout}
        </button>
      </section>
    </main>
  )
}

