import { getLocaleDict } from '@/i18n/locale-server'
import RouteTransition from '@/components/RouteTransition'


export default async function ContactPage() {
  const { dict } = await getLocaleDict()

  return (
    <RouteTransition>
      <main className="page">
        <section className="glass-card page-card">
          <h1 className="page-title">{dict.nav.contact}</h1>
          <p className="page-lead">{dict.hero.subtitle}</p>
        </section>
      </main>
    </RouteTransition>
  )
}
