'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState, useCallback } from 'react'
import { m, useReducedMotion } from 'motion/react'
import { useLocale } from '@/i18n/LocaleProvider'
import LanguageToggle from './LanguageToggle'
import ThemeToggle from './ThemeToggle'
import AmbientSound from './AmbientSound'
import FullscreenToggle from './FullscreenToggle'
import PdskLogo from './PdskLogo'
import { NAV_LINKS } from '@/lib/nav'
import { getPublishedPosts, type BlogPost } from '@/lib/blog-firestore'
import { formatDate } from '@/lib/blog-utils'
import { useViewMode, type ViewMode } from '@/hooks/useViewMode'

const BREAKPOINT_TABLET = 1024
const BREAKPOINT_MOBILE = 768

export default function LiquidGlassNav() {
  const { dict, locale } = useLocale()
  const pathname = usePathname()
  const reduceMotion = useReducedMotion()
  const viewMode = useViewMode()

  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isLandscape, setIsLandscape] = useState(false)

  const navRef = useRef<HTMLElement>(null)
  const rafRef = useRef<number | null>(null)
  const pendingRef = useRef<{ x: number; y: number } | null>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  const [searchPosts, setSearchPosts] = useState<BlogPost[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const searchDebounceRef = useRef<number | null>(null)
  const allPostsRef = useRef<BlogPost[]>([])
  const postsLoadedRef = useRef(false)

  // Pre-fetch published posts once (or when locale changes) for search.
  useEffect(() => {
    let active = true
    setSearchLoading(true)
    getPublishedPosts(locale)
      .then((posts) => {
        if (active) {
          allPostsRef.current = posts
          postsLoadedRef.current = true
        }
      })
      .catch(() => {
        if (active) postsLoadedRef.current = false
      })
      .finally(() => {
        if (active) setSearchLoading(false)
      })
    return () => {
      active = false
    }
  }, [locale])

  // Search posts from the pre-fetched cache with debounce.
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchPosts([])
      return
    }

    setSearchLoading(true)
    if (searchDebounceRef.current) window.clearTimeout(searchDebounceRef.current)

    searchDebounceRef.current = window.setTimeout(() => {
      const posts = allPostsRef.current
      const q = searchQuery.trim().toLowerCase()
      const matched = posts
        .filter((p) =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
        )
        .slice(0, 8)
      setSearchPosts(matched)
      setSearchLoading(false)
    }, 300)

    return () => {
      if (searchDebounceRef.current) window.clearTimeout(searchDebounceRef.current)
    }
  }, [searchQuery, locale])

  const matchedPosts = searchPosts

  const matchedLinks = NAV_LINKS.filter((l) => {
    if (!searchQuery.trim()) return false
    const q = searchQuery.trim().toLowerCase()
    return dict.nav[l.navKey].toLowerCase().includes(q)
  })

  useEffect(() => {
    const checkLandscape = () => {
      const w = window.innerWidth
      const h = window.innerHeight
      setIsLandscape(w > h && w < 1024)
    }
    checkLandscape()
    window.addEventListener('resize', checkLandscape)
    return () => window.removeEventListener('resize', checkLandscape)
  }, [])

  const handleSearchToggle = useCallback(() => {
    setSearchOpen((v) => {
      const next = !v
      if (next) {
        setMobileOpen(false)
      } else {
        // Clear search state when closing
        setSearchQuery('')
        setSearchPosts([])
      }
      return next
    })
  }, [])

  const handleMobileToggle = useCallback(() => {
    setMobileOpen((v) => {
      const next = !v
      if (next) setSearchOpen(false)
      return next
    })
  }, [])

  const closeAll = useCallback(() => {
    setSearchOpen(false)
    setMobileOpen(false)
    setSearchQuery('')
    setSearchPosts([])
  }, [])

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [searchOpen])

  // Cursor glare (desktop only)
  useEffect(() => {
    if (reduceMotion || viewMode === 'mobile') return
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
  }, [reduceMotion, viewMode])

  // Swipe-to-close gesture for mobile (right-to-left swipe closes the right-side menu)
  useEffect(() => {
    if (viewMode !== 'mobile' || !mobileOpen) return

    function onTouchStart(e: TouchEvent) {
      const touch = e.touches[0]
      touchStartRef.current = { x: touch.clientX, y: touch.clientY }
    }

    function onTouchMove(e: TouchEvent) {
      if (!touchStartRef.current) return
      const touch = e.touches[0]
      const dx = touchStartRef.current.x - touch.clientX
      const dy = Math.abs(touch.clientY - touchStartRef.current.y)
      // Only trigger if horizontal swipe (dx > dy) and moving left (dx > 60)
      if (dx > 60 && dx > dy) {
        setMobileOpen(false)
        touchStartRef.current = null
      }
    }

    function onTouchEnd() {
      touchStartRef.current = null
    }

    document.addEventListener('touchstart', onTouchStart, { passive: true })
    document.addEventListener('touchmove', onTouchMove, { passive: true })
    document.addEventListener('touchend', onTouchEnd)

    return () => {
      document.removeEventListener('touchstart', onTouchStart)
      document.removeEventListener('touchmove', onTouchMove)
      document.removeEventListener('touchend', onTouchEnd)
    }
  }, [viewMode, mobileOpen])

  // Keyboard handling
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && (searchOpen || mobileOpen)) {
        closeAll()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [searchOpen, mobileOpen, closeAll])

  // Body scroll lock
  useEffect(() => {
    if (!mobileOpen && !searchOpen) return
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    document.body.style.paddingRight = `${scrollbarWidth}px`
    return () => {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
  }, [mobileOpen, searchOpen])

  // Close mobile menu on navigation
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const filterId = 'liquid-glass-refract'

  const isMobile = viewMode === 'mobile'
  const isTablet = viewMode === 'tablet'

  return (
    <header ref={navRef} className={`lgnav lgnav--${viewMode}${isLandscape ? ' lgnav--landscape' : ''}`} role="banner">
      {/* SVG filter */}
      <svg className="lgnav__svg" aria-hidden="true" focusable="false">
        <defs>
          <filter id={filterId} x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves="2" seed="7" result="noise" />
            <feGaussianBlur in="noise" stdDeviation="0.4" result="soft" />
            <feDisplacementMap in="SourceGraphic" in2="soft" scale={reduceMotion ? 0 : 9} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>

      {/* Desktop / Tablet top nav */}
      <nav className="lgnav__inner" aria-label={locale === 'en' ? 'Primary' : 'Utama'}>
        <Link href="/" className="lgnav__brand" aria-label="PdskWork home">
          <PdskLogo size={isMobile ? 22 : 26} animated={false} />
        </Link>

        {/* Desktop links */}
        {!isMobile && (
          <ul className="lgnav__links" role="list">
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
        )}

        <div className="lgnav__actions">
          {!isMobile && (
            <>
              <LanguageToggle />
              <ThemeToggle />
              <AmbientSound />
              <FullscreenToggle autoOnFirstGesture />
            </>
          )}
          <button
            type="button"
            className="lgnav__search-toggle"
            onClick={handleSearchToggle}
            aria-expanded={searchOpen}
            aria-controls="lgnav-search-panel"
            aria-label={searchOpen ? 'Close search' : 'Open search'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
          {isMobile && (
            <button
              type="button"
              className="lgnav__hamburger"
              onClick={handleMobileToggle}
              aria-expanded={mobileOpen}
              aria-controls="lgnav-mobile-menu"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              <span className="lgnav__hamburger-line" />
              <span className="lgnav__hamburger-line" />
              <span className="lgnav__hamburger-line" />
            </button>
          )}
        </div>

        {/* Cursor glare (desktop only) */}
        {!isMobile && <span className="lgnav__glare" aria-hidden="true" />}
        <span className="lgnav__refract" aria-hidden="true" />
      </nav>

      {/* ===== OVERLAYS - outside lgnav__inner for proper stacking ===== */}

      {/* Backdrop */}
      {(searchOpen || mobileOpen) && (
        <div
          className="lgnav__backdrop"
          onClick={closeAll}
          aria-label="Close overlays"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') closeAll() }}
        />
      )}

      {/* Search panel */}
      {searchOpen && (
        <m.div
          id="lgnav-search-panel"
          className="lgnav__search-panel"
          initial={{ opacity: 0, y: isMobile ? 0 : -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.2 }}
          role="dialog"
          aria-modal="true"
          aria-label={dict.nav.searchPlaceholder || 'Search'}
        >
          <div className="lgnav__search-header">
            <span className="lgnav__search-title">{dict.nav.searchPlaceholder || 'Search'}</span>
            <button
              type="button"
              className="lgnav__search-close"
              onClick={handleSearchToggle}
              aria-label="Close search"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
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
            {searchQuery.trim() && (
              <button
                type="button"
                className="lgnav__search-clear"
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
            {searchQuery.trim() && (matchedLinks.length > 0 || matchedPosts.length > 0) && (
              <span className="lgnav__search-count">
                {matchedLinks.length + matchedPosts.length}
              </span>
            )}
          </div>
          <div className="lgnav__search-results">
            {matchedLinks.length > 0 && (
              <div className="lgnav__search-group">
                <span className="lgnav__search-group-label">{dict.ui?.navLinks || 'Navigation'}</span>
                <ul>
                  {matchedLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="lgnav__search-result"
                        onClick={() => {
                          setSearchOpen(false)
                          setSearchQuery('')
                          setSearchPosts([])
                        }}
                      >
                        <span className="lgnav__search-result-title">{dict.nav[link.navKey]}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {matchedPosts.length > 0 && (
              <div className="lgnav__search-group">
                <span className="lgnav__search-group-label">{dict.ui?.posts || 'Posts'}</span>
                <ul>
                  {matchedPosts.map((post) => (
                    <li key={post.id}>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="lgnav__search-result"
                        onClick={() => {
                          setSearchOpen(false)
                          setSearchQuery('')
                          setSearchPosts([])
                        }}
                      >
                        <span className="lgnav__search-result-title">{post.title}</span>
                        <span className="lgnav__search-result-meta">{formatDate(post.createdAt, locale)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {searchQuery.trim() && matchedLinks.length === 0 && matchedPosts.length === 0 && !searchLoading && (
              <p className="lgnav__search-empty">{dict.nav.noResults || 'No results found.'}</p>
            )}
            {searchLoading && searchQuery.trim() && (
              <p className="lgnav__search-empty">{dict.ui?.searching || 'Searching...'}</p>
            )}
          </div>
        </m.div>
      )}

      {/* Mobile menu */}
      {mobileOpen && isMobile && (
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
          <div className="lgnav__mobile-settings">
            <span className="lgnav__mobile-settings-label">{dict.ui.settings}</span>
            <div className="lgnav__mobile-settings-row">
              <LanguageToggle />
              <ThemeToggle />
              <AmbientSound />
              <FullscreenToggle autoOnFirstGesture />
            </div>
          </div>
        </m.nav>
      )}

      <style jsx>{`
        .lgnav {
          position: sticky;
          top: 0;
          z-index: 100;
          padding: 10px 16px;
          --mx: 50%;
          --my: 50%;
          isolation: isolate;
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
          justify-content: space-between;
          gap: 12px;
          padding: 8px 14px;
          max-width: var(--maxw, 1180px);
          margin: 0 auto;
          border-radius: 18px;
          border: 1px solid var(--glass-border);
          background: rgba(16, 22, 40, 0.82);
          z-index: 100;
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

        /* Refraction sheen */
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
            filter: none;
            opacity: 0.4;
          }
        }

        /* Cursor glare */
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

        /* Brand */
        .lgnav__brand {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
          text-decoration: none;
          color: var(--fg, #e9f6ff);
          font-weight: 700;
          letter-spacing: 0.02em;
          transition: opacity 0.2s ease;
          flex-shrink: 0;
        }
        .lgnav__brand:hover {
          opacity: 0.85;
        }

        /* Desktop links */
        .lgnav__links {
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
          padding: 8px 14px;
          border-radius: 10px;
          color: var(--fg, #e9f6ff);
          text-decoration: none;
          font-size: 0.95rem;
          transition: color 0.2s ease;
          white-space: nowrap;
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

        /* Actions */
        .lgnav__actions {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
          position: relative;
          z-index: 101;
        }

        /* Hamburger */
        .lgnav__hamburger {
          display: none;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 5px;
          width: 44px;
          height: 44px;
          padding: 0;
          border: 1px solid var(--glass-border);
          border-radius: 10px;
          background: var(--glass-bg);
          color: var(--fg);
          cursor: pointer;
          backdrop-filter: blur(var(--glass-blur));
          -webkit-backdrop-filter: blur(var(--glass-blur));
          transition: border-color 0.2s ease, color 0.2s ease;
        }
        .lgnav__hamburger:hover {
          border-color: var(--cyan);
          color: var(--cyan);
        }
        .lgnav__hamburger:focus-visible {
          outline: none;
          box-shadow: var(--focus-ring);
        }
        .lgnav__hamburger-line {
          display: block;
          width: 18px;
          height: 2px;
          border-radius: 2px;
          background: currentColor;
          transition: transform 0.2s ease, opacity 0.2s ease;
        }
        .lgnav__hamburger[aria-expanded='true'] .lgnav__hamburger-line:nth-child(1) {
          transform: translateY(7px) rotate(45deg);
        }
        .lgnav__hamburger[aria-expanded='true'] .lgnav__hamburger-line:nth-child(2) {
          opacity: 0;
        }
        .lgnav__hamburger[aria-expanded='true'] .lgnav__hamburger-line:nth-child(3) {
          transform: translateY(-7px) rotate(-45deg);
        }

        /* Backdrop */
        .lgnav__backdrop {
          position: fixed;
          inset: 0;
          z-index: 50;
          background: rgba(5, 6, 10, 0.45);
          -webkit-backdrop-filter: blur(2px);
          backdrop-filter: blur(2px);
          cursor: pointer;
        }

        /* Mobile menu */
        .lgnav__mobile-menu {
          position: absolute;
          top: calc(100% + 10px);
          right: 16px;
          width: min(300px, calc(100vw - 32px));
          max-height: calc(100vh - 120px);
          overflow-y: auto;
          padding: 14px;
          border-radius: 16px;
          border: 1px solid var(--glass-border);
          background: rgba(16, 22, 40, 0.92);
          -webkit-backdrop-filter: blur(18px) saturate(150%);
          backdrop-filter: blur(18px) saturate(150%);
          box-shadow:
            0 18px 50px -20px rgba(0, 0, 0, 0.7),
            inset 0 1px 0 rgba(255, 255, 255, 0.14);
          z-index: 10;
        }
        .lgnav__mobile-links {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .lgnav__mobile-links .lgnav__link {
          display: flex;
          align-items: center;
          padding: 14px 16px;
          border-radius: 10px;
          color: var(--fg);
          text-decoration: none;
          font-size: 1rem;
          font-weight: 500;
          transition: color 0.2s ease, background 0.2s ease;
        }
        .lgnav__mobile-links .lgnav__link:hover {
          color: var(--cyan);
          background: rgba(0, 240, 255, 0.08);
        }
        .lgnav__mobile-links .lgnav__link.is-active {
          color: #ffffff;
          background: rgba(0, 240, 255, 0.12);
        }
        .lgnav__mobile-links .lgnav__active-pill {
          display: none;
        }

        /* Mobile settings section */
        .lgnav__mobile-settings {
          margin-top: 14px;
          padding-top: 14px;
          border-top: 1px solid var(--glass-border);
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .lgnav__mobile-settings-label {
          font-size: 0.72rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--fg-muted);
          padding: 0 4px;
        }
        .lgnav__mobile-settings-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 4px;
          flex-wrap: nowrap;
        }
        .lgnav__mobile-settings-row > * {
          flex: 1 1 0;
          min-width: 0;
        }

        /* Search */
        .lgnav__search-toggle {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          padding: 0;
          border: 1px solid var(--glass-border);
          border-radius: 10px;
          background: var(--glass-bg);
          color: var(--fg);
          cursor: pointer;
          backdrop-filter: blur(var(--glass-blur));
          -webkit-backdrop-filter: blur(var(--glass-blur));
          transition: border-color 0.2s ease, color 0.2s ease;
        }
        .lgnav__search-toggle:hover {
          border-color: var(--cyan);
          color: var(--cyan);
        }
        .lgnav__search-toggle:focus-visible {
          outline: none;
          box-shadow: var(--focus-ring);
        }

        .lgnav__search-panel {
          position: absolute;
          top: calc(100% + 10px);
          right: 16px;
          width: min(360px, calc(100vw - 32px));
          max-height: min(480px, calc(100vh - 120px));
          display: flex;
          flex-direction: column;
          padding: 14px;
          border-radius: 16px;
          border: 1px solid var(--glass-border);
          background: rgba(16, 22, 40, 0.92);
          -webkit-backdrop-filter: blur(18px) saturate(150%);
          backdrop-filter: blur(18px) saturate(150%);
          box-shadow:
            0 18px 50px -20px rgba(0, 0, 0, 0.7),
            inset 0 1px 0 rgba(255, 255, 255, 0.14);
          z-index: 10;
        }
        .lgnav__search-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
          flex-shrink: 0;
        }
        .lgnav__search-title {
          font-size: 0.78rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--fg-muted);
        }
        .lgnav__search-close {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          padding: 0;
          border: 1px solid var(--glass-border);
          border-radius: 8px;
          background: transparent;
          color: var(--fg-muted);
          cursor: pointer;
          transition: color 0.2s ease, border-color 0.2s ease;
        }
        .lgnav__search-close:hover {
          color: var(--fg);
          border-color: var(--cyan);
        }
        .lgnav__search-close:focus-visible {
          outline: none;
          box-shadow: var(--focus-ring);
        }
        .lgnav__search-field {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 14px;
          border-radius: 10px;
          border: 1px solid var(--glass-border);
          background: rgba(5, 6, 10, 0.45);
          flex-shrink: 0;
        }
        .lgnav__search-icon {
          color: var(--fg-muted);
          flex-shrink: 0;
        }
        .lgnav__search-input {
          flex: 1;
          background: transparent;
          border: 0;
          color: var(--fg);
          font-size: 1rem;
          outline: none;
          min-width: 0;
        }
        .lgnav__search-input::placeholder {
          color: var(--fg-muted);
        }
        .lgnav__search-count {
          font-size: 0.75rem;
          color: var(--cyan);
          background: rgba(0, 240, 255, 0.12);
          padding: 2px 8px;
          border-radius: 999px;
          font-weight: 700;
          flex-shrink: 0;
        }
        .lgnav__search-clear {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          padding: 0;
          border: 0;
          border-radius: 6px;
          background: transparent;
          color: var(--fg-muted);
          cursor: pointer;
          flex-shrink: 0;
          transition: color 0.2s ease, background 0.2s ease;
        }
        .lgnav__search-clear:hover {
          color: var(--fg);
          background: rgba(255, 255, 255, 0.08);
        }
        .lgnav__search-clear:focus-visible {
          outline: none;
          box-shadow: var(--focus-ring);
        }
        .lgnav__search-results {
          margin-top: 10px;
          overflow-y: auto;
          flex: 1;
          min-height: 0;
        }
        .lgnav__search-group {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .lgnav__search-group + .lgnav__search-group {
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid var(--glass-border);
        }
        .lgnav__search-group-label {
          font-size: 0.68rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--fg-muted);
          padding: 4px 12px 2px;
        }
        .lgnav__search-group ul {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .lgnav__search-result {
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding: 10px 12px;
          border-radius: 10px;
          color: var(--fg);
          text-decoration: none;
          font-size: 0.92rem;
          transition: background 0.2s ease, color 0.2s ease;
        }
        .lgnav__search-result:hover {
          background: rgba(0, 240, 255, 0.08);
          color: var(--cyan);
        }
        .lgnav__search-result-title {
          font-weight: 600;
        }
        .lgnav__search-result-meta {
          font-size: 0.78rem;
          color: var(--fg-muted);
        }
        .lgnav__search-empty {
          margin: 8px 10px 0;
          color: var(--fg-muted);
          font-size: 0.88rem;
        }

        /* Tablet: show compact links */
        @media (max-width: ${BREAKPOINT_TABLET}px) and (min-width: ${BREAKPOINT_MOBILE}px) {
          .lgnav__links {
            gap: 2px;
          }
          .lgnav__link {
            padding: 8px 10px;
            font-size: 0.88rem;
          }
          .lgnav__actions {
            gap: 4px;
          }
          .lgnav__search-toggle,
          .lgnav__hamburger {
            width: 40px;
            height: 40px;
          }
        }

        /* Mobile: hide top links, show hamburger */
        @media (max-width: ${BREAKPOINT_MOBILE}px) {
          .lgnav__links {
            display: none;
          }
          .lgnav__inner {
            gap: 8px;
            padding: 6px 10px;
          }
          .lgnav__actions {
            gap: 4px;
          }
          .lgnav__hamburger {
            display: inline-flex;
          }
          .lgnav__search-toggle {
            display: inline-flex;
            width: 44px;
            height: 44px;
          }
        }

        /* Small mobile */
        @media (max-width: 380px) {
          .lgnav__inner {
            gap: 6px;
            padding: 6px 8px;
          }
          .lgnav__actions {
            gap: 2px;
          }
          .lgnav__brand svg {
            height: 22px;
            width: auto;
          }
        }

        /* Landscape mobile optimization */
        @media (max-width: 1024px) and (orientation: landscape) {
          .lgnav {
            padding: 6px 12px;
          }
          .lgnav__inner {
            padding: 6px 12px;
            gap: 10px;
          }
        }

        /* Reduced motion */
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
