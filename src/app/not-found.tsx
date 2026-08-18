'use client'

import Link from 'next/link'
import { m } from 'motion/react'
import { useReducedMotion } from 'motion/react'
import { useLocale } from '@/i18n/LocaleProvider'
import RouteTransition from '@/components/RouteTransition'
import GlitchText from '@/components/GlitchText'
import { NAV_LINKS } from '@/lib/nav'
import { useEffect, useState } from 'react'

export default function NotFound() {
  const { dict, locale } = useLocale()
  const reduceMotion = useReducedMotion()
  const [path, setPath] = useState('/')

  useEffect(() => {
    setPath(window.location.pathname)
  }, [])

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
            <Link href="/" className="primary-btn">
              {dict.notFound.home}
            </Link>
            <Link href="/blog" className="ghost-btn">
              {dict.nav.blog}
            </Link>
            <Link href="/faq" className="ghost-btn">
              {dict.nav.faq}
            </Link>
          </div>

          <nav className="not-found__links" aria-label={dict.ui.footerNav}>
            {NAV_LINKS.filter((l) => l.href !== '/').map((link) => (
              <Link key={link.href} href={link.href} className="not-found__link">
                {dict.nav[link.navKey]}
              </Link>
            ))}
          </nav>

          <p className="not-found__meta" aria-live="polite">
            {dict.notFound.path}: <code>{path}</code>
          </p>
        </section>
      </main>
    </RouteTransition>
  )
}
