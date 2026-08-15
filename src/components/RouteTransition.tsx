/// <reference types="react/canary" />
import { ViewTransition, type ViewTransitionClass } from 'react'

/**
 * RouteTransition — Next.js 16 native View Transitions wrapper for route
 * content.
 *
 * Maps directional navigation types to slide keyframes:
 *   - `nav-forward` → content slides left (old) / in from right (new)
 *   - `nav-back`    → content slides right (old) / in from left (new)
 *   - default → `"none"` (no animation for browser back/forward or refresh),
 *     so unrelated transitions never animate the whole page.
 *
 * The animations themselves are defined in `view-transitions.css` (CSS can
 * target the `::view-transition-*` pseudo-elements that styled-jsx cannot).
 * App Router navigations are transitions, so wrapping page content here
 * activates the view transition automatically.
 *
 * Fallback: browsers without the View Transitions API render normally — the
 * transition is simply skipped and content swaps directly (per the Next 16
 * guide). Reduced motion is handled in CSS (animation-duration: 0s).
 */
const NAV_FORWARD: ViewTransitionClass = 'nav-forward'
const NAV_BACK: ViewTransitionClass = 'nav-back'

const enterMap = { 'nav-forward': NAV_FORWARD, 'nav-back': NAV_BACK, default: 'none' as const }
const exitMap = { 'nav-forward': NAV_FORWARD, 'nav-back': NAV_BACK, default: 'none' as const }

export default function RouteTransition({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter={enterMap} exit={exitMap} default="none">
      {children}
    </ViewTransition>
  )
}
