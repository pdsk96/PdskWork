'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { m, useMotionValue, useReducedMotion, useTransform } from 'motion/react'
import { useLocale } from '@/i18n/LocaleProvider'
import LanguageToggle from './LanguageToggle'

const NAV_LINKS = [
  { href: '/', key: 'home' as const },
  { href: '/work', key: 'work' as const },
  { href: '/about', key: 'about' as const },
  { href: '/contact', key: 'contact' as const },
]

/**
 * Liquid-glass navbar.
 *
 * Frosted translucent surface with a refractive gradient border, a moving
 * sheen highlight that follows the pointer across the bar, and an animated
 * active-link pill. Entrance animation is suppressed under reduced-motion.
 */
export default function Navbar() {
  const { dict } = useLocale()
  const pathname = usePathname()
  const reduceMotion = useReducedMotion()

  const sheenX = useMotionValue(0)

  function onPointerMove(e: React.PointerEvent<HTMLElement>) {
    if (reduceMotion) return
    const rect = e.currentTarget.getBoundingClientRect()
    sheenX.set(((e.clientX - rect.left) / rect.width) * 100)
  }

  const sheenBackground = useTransform(
    sheenX,
    (x) =>
      `linear-gradient(90deg, transparent 0%, rgba(0,240,255,0.16) ${x}%, transparent 100%)`,
  )

  const sheenStyle = reduceMotion ? undefined : { background: sheenBackground }

  return (
    <m.header
      className="navbar"
      role="banner"
      initial={reduceMotion ? false : { y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <nav
        className="glass navbar__inner"
        aria-label={dict.nav.home === 'Home' ? 'Primary' : 'Utama'}
        onPointerMove={onPointerMove}
      >
        <Link href="/" className="navbar__brand" aria-label="PdskWork home">
          <span className="navbar__brand-mark" aria-hidden="true" />
          <span className="navbar__brand-text">PdskWork</span>
        </Link>

        <ul className="navbar__links">
          {NAV_LINKS.map((link) => {
            const active =
              link.href === '/'
                ? pathname === '/'
                : pathname === link.href || pathname.startsWith(`${link.href}/`)
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`navbar__link${active ? ' is-active' : ''}`}
                  aria-current={active ? 'page' : undefined}
                >
                  {dict.nav[link.key]}
                  {active && !reduceMotion ? (
                    <m.span
                      layoutId="nav-active-pill"
                      className="navbar__active-pill"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  ) : null}
                </Link>
              </li>
            )
          })}
        </ul>

        <div className="navbar__actions">
          <LanguageToggle />
          <Link href="/admin" className="navbar__admin">
            {dict.nav.admin}
          </Link>
        </div>

        {!reduceMotion ? (
          <m.div className="navbar__sheen" style={sheenStyle} aria-hidden="true" />
        ) : null}
      </nav>
    </m.header>
  )
}
