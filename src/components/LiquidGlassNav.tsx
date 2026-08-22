'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState, useMemo } from 'react'
import { m, useReducedMotion } from 'motion/react'
import { useLocale } from '@/i18n/LocaleProvider'
import LanguageToggle from './LanguageToggle'
import ThemeToggle from './ThemeToggle'
import AmbientSound from './AmbientSound'
import FullscreenToggle from './FullscreenToggle'
import PdskLogo from './PdskLogo'
import { NAV_LINKS } from '@/lib/nav'
import blogSeed from '@/db/blog.json'
import type { BlogPost } from '@/lib/blog-types'
import { formatDate } from '@/lib/blog-utils'

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
  const { dict, locale } = useLocale()
  const pathname = usePathname()
  const reduceMotion = useReducedMotion()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const navRef = useRef<HTMLElement>(null)
  const rafRef = useRef<number | null>(null)
  const pendingRef = useRef<{ x: number; y: number } | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const seedPosts = useMemo<BlogPost[]>(() => blogSeed as BlogPost[], [])

  const matchedPosts = useMemo(() => {
    if (!searchQuery.trim()) return []
    const q = searchQuery.trim().toLowerCase()
    return seedPosts
      .filter((p) => p.published && p.locale === locale)
      .filter((p) => p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q) || p.tags.some((t) => t.toLowerCase().includes(q)))
      .slice(0, 8)
  }, [searchQuery, seedPosts, locale])

  const matchedLinks = useMemo(() => {
    if (!searchQuery.trim()) return []
    const q = searchQuery.trim().toLowerCase()
    return NAV_LINKS.filter((l) => dict.nav[l.navKey].toLowerCase().includes(q))
  }, [searchQuery, dict])

  useEffect(() => {
    if (!searchOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSearchOpen(false)
        setSearchQuery('')
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [searchOpen])

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [searchOpen])

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

  useEffect(() => {
    if (!mobileOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileOpen(false)
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

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

      <nav className="lgnav__inner" aria-label={locale === 'en' ? 'Primary' : 'Utama'}>
        <Link href="/" className="lgnav__brand" aria-label="PdskWork home">
          <PdskLogo size={26} animated={false} />
        </Link>

        <ul className="lgnav__links">
          {NAV_LINKS.map((link) => {
            const safePathname = pathname ?? '/'
            const active =
              link.href === '/'
                ? safePathname === '/'
                : safePathname === link.href || safePathname.startsWith(`${link.href}/`)
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`lgnav__link${active ? ' is-active' : ''}`}
                  aria-current={active ? 'page' : undefined}
                >
                  {dict.nav[link.navKey]}
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
          <FullscreenToggle autoOnFirstGesture />
          <button
            type="button"
            className="lgnav__search-toggle"
            onClick={() => setSearchOpen((v) => !v)}
            aria-expanded={searchOpen}
            aria-controls="lgnav-search-panel"
            aria-label={searchOpen ? 'Close search' : 'Open search'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
          <button
            type="button"
            className="lgnav__hamburger"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-controls="lgnav-mobile-menu"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            <span className="lgnav__hamburger-line" />
            <span className="lgnav__hamburger-line" />
            <span className="lgnav__hamburger-line" />
          </button>
          {/*
            Admin entry is intentionally hidden from the public nav. The admin
            console remains reachable at /admin/login (client-side gated by
            Firebase Auth) — no discovery link is exposed in the UI.
          */}
        </div>

        {searchOpen && (
          <m.div
            id="lgnav-search-panel"
            className="lgnav__search-panel"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
          >
            <div className="lgnav__search-field">
              <svg className="lgnav__search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                ref={searchInputRef}
                className="lgnav__search-input"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={dict.nav.searchPlaceholder || 'Search posts...'}
                aria-label="Search"
              />
              {(matchedLinks.length > 0 || matchedPosts.length > 0) && (
                <span className="lgnav__search-count">
                  {matchedLinks.length + matchedPosts.length}
                </span>
              )}
            </div>
            <div className="lgnav__search-results">
              {matchedLinks.length > 0 && (
                <ul className="lgnav__search-group">
                  {matchedLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="lgnav__search-result"
                        onClick={() => {
                          setSearchOpen(false)
                          setSearchQuery('')
                        }}
                      >
                        {dict.nav[link.navKey]}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              {matchedPosts.length > 0 && (
                <ul className="lgnav__search-group">
                  {matchedPosts.map((post) => (
                    <li key={post.id}>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="lgnav__search-result"
                        onClick={() => {
                          setSearchOpen(false)
                          setSearchQuery('')
                        }}
                      >
                        <span className="lgnav__search-result-title">{post.title}</span>
                        <span className="lgnav__search-result-meta">{formatDate(post.createdAt, locale)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              {searchQuery.trim() && matchedLinks.length === 0 && matchedPosts.length === 0 && (
                <p className="lgnav__search-empty">{dict.nav.noResults || 'No results found.'}</p>
              )}
            </div>
          </m.div>
        )}

        {mobileOpen && (
          <m.nav
            id="lgnav-mobile-menu"
            className="lgnav__mobile-menu"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: reduceMotion ? 0 : 0.22 }}
            aria-label={locale === 'en' ? 'Mobile navigation' : 'Navigasi seluler'}
          >
            <ul className="lgnav__mobile-links">
              {NAV_LINKS.map((link) => {
                const safePathname = pathname ?? '/'
                const active =
                  link.href === '/'
                    ? safePathname === '/'
                    : safePathname === link.href || safePathname.startsWith(`${link.href}/`)
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`lgnav__link${active ? ' is-active' : ''}`}
                      aria-current={active ? 'page' : undefined}
                      onClick={() => setMobileOpen(false)}
                    >
                      {dict.nav[link.navKey]}
                      {active && <span className="lgnav__active-pill" aria-hidden="true" />}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </m.nav>
        )}

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
          display: grid;
          grid-template-columns: 1fr auto 1fr;
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
          justify-self: center;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
          text-decoration: none;
          color: var(--fg, #e9f6ff);
          font-weight: 700;
          letter-spacing: 0.02em;
          transition: opacity 0.2s ease;
        }
        .lgnav__brand:hover {
          opacity: 0.85;
        }
        .lgnav__links {
          justify-self: start;
          display: flex;
          align-items: center;
          gap: 4px;
          list-style: none;
          margin: 0;
          padding: 0;
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
          justify-self: end;
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
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
          .lgnav__inner {
            position: relative;
            gap: 10px;
            padding: 8px;
          }
          .lgnav__actions {
            gap: 6px;
          }
          .lgnav__hamburger {
            display: inline-flex;
          }
          .lgnav__search-toggle {
            display: inline-flex;
          }
        }

        @media (max-width: 380px) {
          .lgnav__inner {
            gap: 8px;
            padding: 6px;
          }
          .lgnav__actions {
            gap: 4px;
          }
          .lgnav__brand svg {
            height: 22px;
            width: auto;
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
