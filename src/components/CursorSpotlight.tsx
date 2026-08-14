'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion'

/**
 * Cursor-follow spotlight — 2026 "liquid glass" trend.
 *
 * A soft radial glow tracks the pointer. On touch devices and when the user
 * prefers reduced motion, the spotlight stays static (centered) and non-animated
 * so it never becomes a vestibular hazard.
 */
export default function CursorSpotlight() {
  const reduceMotion = useReducedMotion()
  const [enabled, setEnabled] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const x = useMotionValue(-1000)
  const y = useMotionValue(-1000)
  const sx = useSpring(x, { stiffness: 350, damping: 40, mass: 0.6 })
  const sy = useSpring(y, { stiffness: 350, damping: 40, mass: 0.6 })

  useEffect(() => {
    if (reduceMotion) return

    const isTouch =
      typeof window !== 'undefined' &&
      window.matchMedia('(hover: none), (pointer: coarse)').matches
    if (isTouch) return

    setEnabled(true)

    function onMove(e: PointerEvent) {
      if (e.pointerType === 'touch') return
      x.set(e.clientX)
      y.set(e.clientY)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [reduceMotion, x, y])

  // Static, centered glow for reduced-motion / touch users.
  const staticStyle: React.CSSProperties = reduceMotion
    ? {
        background:
          'radial-gradient(600px circle at 50% 0%, rgba(0,240,255,0.10), transparent 60%)',
        opacity: 1,
      }
    : {}

  return (
    <div
      ref={containerRef}
      className="cursor-spotlight"
      aria-hidden="true"
      data-enabled={enabled ? 'true' : 'false'}
      style={staticStyle}
    >
      {!reduceMotion && (
        <motion.div
          className="cursor-spotlight__glow"
          style={{ left: sx, top: sy }}
        />
      )}
    </div>
  )
}
