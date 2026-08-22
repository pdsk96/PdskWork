'use client'

import { useLocale } from '@/i18n/LocaleProvider'
import RouteTransition from '@/components/RouteTransition'
import ProjectShowcase from '@/components/ProjectShowcase'


export default function WorkPage() {
  const { dict } = useLocale()

  return (
    <RouteTransition>
      <main className="page">
        <section className="glass-card page-card">
          <h1 className="page-title">{dict.nav.work}</h1>
          <p className="page-lead">{dict.hero.subtitle}</p>
        </section>
        <ProjectShowcase />
      </main>
    </RouteTransition>
  )
}
