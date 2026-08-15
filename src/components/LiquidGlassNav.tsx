'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'motion/react'
import { useLocale } from '@/i18n/LocaleProvider'
import LanguageToggle from './LanguageToggle'
import ThemeToggle from './ThemeToggle'
import AmbientSound from './AmbientSound'

const NAV_LINKS = [
  { href: '/', key: 'home' as const, type: 'nav-back' },
  { href: '/work', key: 'work' as const, type: 'nav-forward' },
  { href: '/about', key: 'about' as const, type: 'nav-forward' },
  { href: '/contact', key: 'contact' as const, type: 'nav-forward' },
] as const

/**
 * LiquidGlassNav — refractive glass navbar.
 *
 * - Frosted backdrop-blur surface.
 * - An inline SVG filter (feDisplacementMap + feGaussianBlur + feTurbulence)
 *   distorts the frosted layer for a subtle liquid-glass refraction sheen.
 * - A cursor-follow glare writes the pointer position to CSS custom props
 *   --mx / --my via a throttled rAF handler (no React state per move), so the
 *   glare gradient updates without re-rendering the bar.
 * - `@supports` on backdrop-filter: where unsupported, a static opaque
 *   glassmorphism fallback (solid translucent background) is used.
 * - prefers-reduced-motion disables the glare tracking and SVG turbulence
 *   animation (turbulence stays static).
 *
 * `transitionTypes` on links tag navigations for the Next 16 View
 * Transitions route transitions (home = back, others = forward).
 */
export default function LiquidGlassNav() {
  const { dict } = useLocale()
  const pathname = usePathname()
  const reduceMotion = useReducedMotion()

  const navRef = useRef<HTMLElement>(null)
  const rafRef = useRef<number | null>(null)
  const pendingRef = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    if (reduceMotion) return
    if (!navRef.current) return

    function schedule() {
      if (rafRef.current != null) return
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null
        const p = pendingRef.current
        const node = navRef.current
        if (!p || !node) return
        const rect = node.getBoundingClientRect()
        const mx = ((p.x - rect.left) / rect.width) * 100
        const my = ((p.y - rect.top) / rect.height) * 100
        node.style.setProperty('--mx', `${mx}%`)
        node.style.setProperty('--my', `${my}%`)
      })
    }

    function onMove(e: PointerEvent) {
      if (e.pointerType === 'touch') return
      pendingRef.current = { x: e.clientX, y: e.clientY }
      schedule()
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      if (rafRef.current != null) window.cancelAnimationFrame(rafRef.current)
    }
  }, [reduceMotion])

  const filterId = 'liquid-glass-refract'

  return (
    <header ref={navRef} className="lgnav" role="banner">
      {/* SVG filter: turbulence + displacement produce a refraction sheen. */}
      <svg className="lgnav__svg" aria-hidden="true" focusable="false">
        <defs>
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.012 0.02"
              numOctaves="2"
              seed="7"
              result="noise"
            />
            <feGaussianBlur in="noise" stdDeviation="0.4" result="soft" />
            <feDisplacementMap
              in="SourceGraphic"
              in2="soft"
              scale={reduceMotion ? 0 : 9}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      <nav className="lgnav__inner" aria-label={dict.nav.home === 'Home' ? 'Primary' : 'Utama'}>
        <Link href="/" className="lgnav__brand" aria-label="PdskWork home" transitionTypes={['nav-back']}>
          <span className="lgnav__brand-mark" aria-hidden="true" />
          <span className="lgnav__brand-text">PdskWork</span>
        </Link>

        <ul className="lgnav__links">
          {NAV_LINKS.map((link) => {
            const active =
              link.href === '/'
                ? pathname === '/'
                : pathname === link.href || pathname.startsWith(`${link.href}/`)
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`lgnav__link${active ? ' is-active' : ''}`}
                  aria-current={active ? 'page' : undefined}
                  transitionTypes={[link.type]}
                >
                  {dict.nav[link.key]}
                  {active && <span className="lgnav__active-pill" aria-hidden="true" />}
                </Link>
              </li>
            )
          })}
        </ul>

        <div className="lgnav__actions">
          <LanguageToggle />
          <ThemeToggle />
          <AmbientSound />
          <Link href="/admin" className="lgnav__admin" transitionTypes={['nav-forward']}>
            {dict.nav.admin}
          </Link>
        </div>

        {/* cursor-follow glare (driven by --mx/--my) */}
        <span className="lgnav__glare" aria-hidden="true" />
        {/* refraction sheen layer uses the SVG filter */}
        <span className="lgnav__refract" aria-hidden="true" />
      </nav>

      <style jsx>{`
        .lgnav {
          position: sticky;
          top: 0;
          z-index: 50;
          padding: 12px 20px;
          --mx: 50%;
          --my: 50%;
        }
        .lgnav__svg {
          position: absolute;
          width: 0;
          height: 0;
        }
        .lgnav__inner {
          position: relative;
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 8px 12px;
          max-width: var(--maxw, 1180px);
          margin: 0 auto;
          border-radius: 18px;
          border: 1px solid rgba(120, 200, 255, 0.22);
          /* glass surface (works without backdrop-filter via @supports fallback) */
          background: rgba(16, 22, 40, 0.82);
        }
        @supports ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px))) {
          .lgnav__inner {
            background: rgba(16, 22, 40, 0.55);
            -webkit-backdrop-filter: blur(18px) saturate(150%);
            backdrop-filter: blur(18px) saturate(150%);
            box-shadow:
              inset 0 1px 0 rgba(255, 255, 255, 0.14),
              0 18px 50px -24px rgba(0, 0, 0, 0.7);
          }
        }
        /* refraction sheen: the blurred frosted edge distorted by the SVG filter */
        .lgnav__refract {
          position: absolute;
          inset: 0;
          border-radius: 18px;
          pointer-events: none;
          opacity: 0.6;
          background: linear-gradient(
            180deg,
            rgba(0, 240, 255, 0.08),
            transparent 30%,
            transparent 70%,
            rgba(255, 43, 214, 0.05)
          );
          filter: url(#${filterId});
        }
        @supports not ((-webkit-backdrop-filter: blur(1px)) or (backdrop-filter: blur(1px))) {
          .lgnav__refract {
            /* no refraction without blur support; keep a static sheen */
            filter: none;
            opacity: 0.4;
          }
        }
        /* cursor-follow glare, positioned via CSS vars */
        .lgnav__glare {
          position: absolute;
          inset: 0;
          border-radius: 18px;
          pointer-events: none;
          opacity: 0;
          background: radial-gradient(
            140px circle at var(--mx) var(--my),
            rgba(0, 240, 255, 0.22),
            transparent 60%
          );
          transition: opacity 0.25s ease;
          mix-blend-mode: screen;
        }
        .lgnav__inner:hover .lgnav__glare {
          opacity: 1;
        }
        .lgnav[data-reduce='on'] .lgnav__glare,
        :global(.lgnav__glare) {
          /* glare disabled under reduced motion via JS (no tracking); keep static */
        }

        .lgnav__brand {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          color: var(--fg, #e9f6ff);
          font-weight: 700;
          letter-spacing: 0.02em;
        }
        .lgnav__brand-mark {
          width: 22px;
          height: 22px;
          border-radius: 7px;
          background: conic-gradient(from 120deg, #00f0ff, #7a5cff, #ff2bd6, #00f0ff);
          box-shadow: 0 0 12px rgba(0, 240, 255, 0.6);
        }
        .lgnav__links {
          display: flex;
          align-items: center;
          gap: 4px;
          list-style: none;
          margin: 0;
          padding: 0;
          margin-left: auto;
        }
        .lgnav__link {
          position: relative;
          display: inline-flex;
          align-items: center;
          padding: 8px 12px;
          border-radius: 10px;
          color: var(--fg, #e9f6ff);
          text-decoration: none;
          font-size: 0.95rem;
          transition: color 0.2s ease;
        }
        .lgnav__link:hover {
          color: #00f0ff;
        }
        .lgnav__link.is-active {
          color: #ffffff;
        }
        .lgnav__active-pill {
          position: absolute;
          inset: 0;
          border-radius: 10px;
          background: linear-gradient(180deg, rgba(0, 240, 255, 0.22), rgba(122, 92, 255, 0.18));
          border: 1px solid rgba(0, 240, 255, 0.35);
          z-index: -1;
        }
        .lgnav__actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .lgnav__admin {
          text-decoration: none;
          font-size: 0.9rem;
          padding: 7px 12px;
          border-radius: 10px;
          border: 1px solid rgba(120, 200, 255, 0.22);
          color: var(--fg, #e9f6ff);
        }
        .lgnav__admin:hover {
          border-color: #00f0ff;
          color: #00f0ff;
        }

        @media (max-width: 720px) {
          .lgnav__links {
            display: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .lgnav__glare {
            display: none;
          }
          .lgnav__refract {
            filter: none;
            opacity: 0.35;
          }
        }
      `}</style>
    </header>
  )
}
