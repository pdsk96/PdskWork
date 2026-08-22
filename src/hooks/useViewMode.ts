import { useEffect, useState } from 'react'

const BREAKPOINT_TABLET = 1024
const BREAKPOINT_MOBILE = 768

export type ViewMode = 'desktop' | 'tablet' | 'mobile'

/**
 * Shared hook for responsive view mode detection.
 * Returns 'desktop' | 'tablet' | 'mobile' based on window width.
 */
export function useViewMode(): ViewMode {
  const [mode, setMode] = useState<ViewMode>(() => {
    if (typeof window === 'undefined') return 'desktop'
    if (window.innerWidth < BREAKPOINT_MOBILE) return 'mobile'
    if (window.innerWidth < BREAKPOINT_TABLET) return 'tablet'
    return 'desktop'
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mql = window.matchMedia(`(max-width: ${BREAKPOINT_MOBILE - 1}px)`)
    const mqlTablet = window.matchMedia(`(max-width: ${BREAKPOINT_TABLET - 1}px)`)

    const update = () => {
      const w = window.innerWidth
      setMode(w < BREAKPOINT_MOBILE ? 'mobile' : w < BREAKPOINT_TABLET ? 'tablet' : 'desktop')
    }

    mql.addEventListener('change', update)
    mqlTablet.addEventListener('change', update)
    return () => {
      mql.removeEventListener('change', update)
      mqlTablet.removeEventListener('change', update)
    }
  }, [])

  return mode
}
