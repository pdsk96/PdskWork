'use client'

import { useLocale } from '@/i18n/LocaleProvider'
import ProjectShowcase from '@/components/ProjectShowcase'
import RouteTransition from '@/components/RouteTransition'


export default function AboutPage() {
  const { dict } = useLocale()

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
