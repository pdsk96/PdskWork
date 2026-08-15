'use client'

import { useLocale } from '@/i18n/LocaleProvider'
import RouteTransition from '@/components/RouteTransition'


export default function ContactPage() {
  const { dict } = useLocale()

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
