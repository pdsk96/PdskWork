'use client'

import Link from 'next/link'
import { m } from 'motion/react'
import { useReducedMotion } from 'motion/react'
import { useLocale } from '@/i18n/LocaleProvider'
import RouteTransition from '@/components/RouteTransition'
import GlitchText from '@/components/GlitchText'
import { NAV_LINKS } from '@/lib/nav'

/**
 * Custom 404 — cyberpunk "signal lost" themed not-found page.
 *
 * Next.js renders `not-found.tsx` at the root for any unmatched route (and
 * for thrown notFound()). Bilingual, accessible, with quick links back.
 */
export default function NotFound() {
  const { dict } = useLocale()
  const reduceMotion = useReducedMotion()
  const code = dict.nav.home === 'Home' ? 'en-US' : 'id-ID'

  return (
    <RouteTransition>
      <main className="page not-found">
        <section className="glass-card page-card not-found__card">
          <m.div
            className="not-found__code"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: ['easeOut'] }}
          >
            <GlitchText text="404" as="span" />
          </m.div>

          <h1 className="page-title">{dict.notFound.title}</h1>
          <p className="page-lead">{dict.notFound.lead}</p>

          <div className="not-found__actions">
            <Link href="/" className="primary-btn" transitionTypes={['nav-back']}>
              {dict.notFound.home}
            </Link>
            <Link href="/blog" className="ghost-btn" transitionTypes={['nav-forward']}>
              {dict.nav.blog}
            </Link>
            <Link href="/faq" className="ghost-btn" transitionTypes={['nav-forward']}>
              {dict.nav.faq}
            </Link>
          </div>

          <nav className="not-found__links" aria-label={dict.ui.footerNav}>
            {NAV_LINKS.filter((l) => l.href !== '/').map((link) => (
              <Link key={link.href} href={link.href} className="not-found__link" transitionTypes={[link.transitionType]}>
                {dict.nav[link.navKey]}
              </Link>
            ))}
          </nav>

          <p className="not-found__meta" aria-live="polite">
            {dict.notFound.path}: <code>{typeof window !== 'undefined' ? window.location.pathname : '/'}</code>
          </p>
        </section>
      </main>
    </RouteTransition>
  )
}
