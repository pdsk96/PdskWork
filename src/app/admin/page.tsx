import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import { getDictionary } from '@/i18n/dictionaries'
import { cookies } from 'next/headers'
import { defaultLocale, isSupportedLocale } from '@/i18n/locale-server'


export default async function AdminPage() {
  if (!(await isAuthenticated())) {
    redirect('/admin/login?next=/admin')
  }

  const store = await cookies()
  const locale = isSupportedLocale(store.get('pdsk_locale')?.value) ? store.get('pdsk_locale')!.value : defaultLocale
  const dict = getDictionary(locale)

  return (
    <main className="auth-shell">
      <section className="glass-card admin-console">
        <h1 className="auth-title">{dict.admin.title}</h1>
        <p className="admin-welcome">{dict.admin.welcome}</p>
        <form action="/api/admin/session" method="post">
          <input type="hidden" name="_method" value="DELETE" />
          <button type="submit" className="ghost-btn">
            {dict.admin.logout}
          </button>
        </form>
      </section>
    </main>
  )
}
