'use client'

import { useLocale } from '@/i18n/LocaleProvider'
import RouteTransition from '@/components/RouteTransition'

/**
 * LegalPage — renders a localized list of {heading, paragraph} sections.
 * Shared by /privacy and /terms. `sectionKey` selects which dictionary block
 * ('privacy' | 'terms') to render.
 */
export default function LegalPage({ sectionKey }: { sectionKey: 'privacy' | 'terms' }) {
  const { dict } = useLocale()
  const data = dict[sectionKey]
  const locale = dict.nav.home === 'Home' ? 'en-US' : 'id-ID'

  return (
    <RouteTransition>
      <main className="page">
        <section className="glass-card page-card">
          <h1 className="page-title">{data.title}</h1>
          <p className="page-lead legal-updated">
            {data.updated}: {new Date().toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <p className="page-lead">{data.lead}</p>
        </section>

        <section className="page-card legal" aria-label={data.title}>
          {data.sections.map((s, i) => (
            <article key={i} className="legal__section">
              <h2 className="legal__h">{s.h}</h2>
              <p className="legal__p">{s.p}</p>
            </article>
          ))}
        </section>
      </main>
    </RouteTransition>
  )
}
