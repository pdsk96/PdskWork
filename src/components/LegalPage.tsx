'use client'

import { useEffect, useState } from 'react'
import { useLocale } from '@/i18n/LocaleProvider'
import RouteTransition from '@/components/RouteTransition'

export default function LegalPage({ sectionKey }: { sectionKey: 'privacy' | 'terms' }) {
  const { dict, locale } = useLocale()
  const data = dict[sectionKey]
  const [updated, setUpdated] = useState('')

  useEffect(() => {
    setUpdated(
      new Date().toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    )
  }, [locale])

  return (
    <RouteTransition>
      <main className="page">
        <section className="glass-card page-card">
          <h1 className="page-title">{data.title}</h1>
          <p className="page-lead legal-updated">
            {data.updated}: {updated}
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
