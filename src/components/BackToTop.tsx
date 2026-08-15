'use client'

import { useEffect, useState } from 'react'
import { useLocale } from '@/i18n/LocaleProvider'

/**
 * BackToTop — floating button that appears after scrolling down and smoothly
 * scrolls back to the top. Respects prefers-reduced-motion (instant jump).
 */
export default function BackToTop() {
  const [visible, setVisible] = useState(false)
  const { dict } = useLocale()

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null

  const reduce =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  return (
    <button
      type="button"
      className="back-to-top"
      aria-label={dict.ui.backToTop}
      title={dict.ui.backToTop}
      onClick={() =>
        window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' })
      }
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  )
}
