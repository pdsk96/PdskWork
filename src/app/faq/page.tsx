'use client'

import Link from 'next/link'
import { useLocale } from '@/i18n/LocaleProvider'
import RouteTransition from '@/components/RouteTransition'

/**
 * FAQ page — accordion of common questions, driven by the localized
 * `dict.faq.items` list. Uses native <details>/<summary> for keyboard
 * accessibility and no JS state.
 */
export default function FaqPage() {
  const { dict } = useLocale()
  const { faq } = dict

  return (
    <RouteTransition>
      <main className="page">
        <section className="glass-card page-card">
          <h1 className="page-title">{faq.title}</h1>
          <p className="page-lead">{faq.lead}</p>
        </section>

        <section className="page-card faq" aria-label={faq.title}>
          {faq.items.map((item, i) => (
            <details key={i} className="faq__item">
              <summary className="faq__q">{item.q}</summary>
              <p className="faq__a">{item.a}</p>
            </details>
          ))}
        </section>

        <section className="page-card faq__contact">
          <p>
            {dict.nav.contact} →{' '}
            <Link href="/contact" className="faq__link" transitionTypes={['nav-forward']}>
              {dict.nav.contact}
            </Link>
          </p>
        </section>
      </main>
    </RouteTransition>
  )
}
