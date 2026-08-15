import { redirect } from 'next/navigation'
import Link from 'next/link'
import { isAuthenticated } from '@/lib/auth'
import { getLocaleDict } from '@/i18n/locale-server'


export default async function AdminPage() {
  if (!(await isAuthenticated())) {
    redirect('/admin/login?next=/admin')
  }

  const { dict } = await getLocaleDict()

  return (
    <main className="auth-shell">
      <section className="glass-card admin-console">
        <h1 className="auth-title">{dict.admin.title}</h1>
        <p className="admin-welcome">{dict.admin.welcome}</p>

        <nav className="admin-nav" aria-label={dict.admin.title}>
          <Link href="/admin/blog" className="primary-btn">{dict.blog.adminTitle}</Link>
        </nav>

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
