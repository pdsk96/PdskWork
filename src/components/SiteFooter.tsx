'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useLocale } from '@/i18n/LocaleProvider'
import ShareButtons from './ShareButtons'
import { NAV_LINKS } from '@/lib/nav'

/**
 * SiteFooter — bilingual footer with tagline, quick navigation, share buttons,
 * and an RSS feed link. Drives return visits and cross-page discovery.
 */
export default function SiteFooter() {
  const { dict } = useLocale()
  // Defer the current year to mount (Cache Components disallows `new Date()`
  // during prerender of a Client Component).
  const [year, setYear] = useState<number>()
  useEffect(() => {
    setYear(new Date().getFullYear())
  }, [])

  return (
    <footer className="site-footer" role="contentinfo">
      <div className="site-footer__inner">
        <div className="site-footer__col site-footer__brand">
          <div className="site-footer__logo" aria-hidden="true">⚡ PdskWork</div>
          <p className="site-footer__tagline">{dict.ui.footerTagline}</p>
        </div>

        <nav className="site-footer__col" aria-label={dict.ui.footerNav}>
          <h2 className="site-footer__heading">{dict.ui.footerNav}</h2>
          <ul className="site-footer__list">
            {NAV_LINKS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="site-footer__link" transitionTypes={[item.transitionType]}>
                  {dict.nav[item.navKey]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="site-footer__col site-footer__connect">
          <h2 className="site-footer__heading">{dict.ui.footerConnect}</h2>
          <ShareButtons />
          <a className="site-footer__feed" href="/feed.xml" target="_blank" rel="noopener noreferrer">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19 7.38 20 6.18 20A2.18 2.18 0 0 1 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1z" />
            </svg>
            {dict.ui.feed}
          </a>
        </div>
      </div>

      <div className="site-footer__bar">
        <span>{year ? `© ${year} PdskWork. ${dict.ui.footerRights}` : `© PdskWork. ${dict.ui.footerRights}`}</span>
      </div>
    </footer>
  )
}
