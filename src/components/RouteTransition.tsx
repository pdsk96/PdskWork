'use client'

/**
 * RouteTransition — lightweight wrapper for route content.
 *
 * Previously used React canary <ViewTransition>, which is unavailable in
 * stable React 19. This component now renders children directly. View
 * transition animations are a progressive enhancement handled elsewhere
 * (or via native startViewTransition if added in the future).
 */
export default function RouteTransition({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
