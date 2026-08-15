import { getLocaleDict } from '@/i18n/locale-server'
import ProjectShowcase from '@/components/ProjectShowcase'
import RouteTransition from '@/components/RouteTransition'


export default async function AboutPage() {
  const { dict } = await getLocaleDict()

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
