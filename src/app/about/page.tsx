import { getDictionary } from '@/i18n/dictionaries'
import { defaultLocale, isSupportedLocale } from '@/i18n/locale-server'
import { cookies } from 'next/headers'
import ProjectShowcase from '@/components/ProjectShowcase'
import RouteTransition from '@/components/RouteTransition'


export default async function AboutPage() {
  const store = await cookies()
  const locale = isSupportedLocale(store.get('pdsk_locale')?.value)
    ? store.get('pdsk_locale')!.value
    : defaultLocale
  const dict = getDictionary(locale)

  return (
    <RouteTransition>
      <main className="page">
        <section className="glass-card page-card">
          <h1 className="page-title">{dict.nav.about}</h1>
          <p className="page-lead">{dict.hero.subtitle}</p>
        </section>

        <section className="page-card" aria-label="Project showcase">
          <ProjectShowcase />
        </section>
      </main>
    </RouteTransition>
  )
}
