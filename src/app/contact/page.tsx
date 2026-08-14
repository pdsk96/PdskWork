import { getDictionary } from '@/i18n/dictionaries'
import { defaultLocale, isSupportedLocale } from '@/i18n/locale-server'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export default async function ContactPage() {
  const store = await cookies()
  const locale = isSupportedLocale(store.get('pdsk_locale')?.value)
    ? store.get('pdsk_locale')!.value
    : defaultLocale
  const dict = getDictionary(locale)

  return (
    <main className="page">
      <section className="glass-card page-card">
        <h1 className="page-title">{dict.nav.contact}</h1>
        <p className="page-lead">{dict.hero.subtitle}</p>
      </section>
    </main>
  )
}
