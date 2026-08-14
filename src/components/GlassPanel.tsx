'use client'

import { useRef } from 'react'
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  type MotionValue,
} from 'framer-motion'

type GlassPanelProps = {
  children: React.ReactNode
  className?: string
  /** Bento span hints: column span on wide screens. */
  span?: 1 | 2 | 3
  /** Heading rendered in the panel header for context. */
  label?: string
  /** ARIA label fallback when there is no visible heading. */
  ariaLabel?: string
  /** Disable the pointer-reactive tilt + sheen (e.g. reduce-motion). */
  interactive?: boolean
  as?: 'article' | 'section' | 'div'
}

/**
 * GlassPanel — liquid-glass surface.
 *
 * Frosted translucent card with a refractive top sheen (`.glass`) plus a
 * pointer-reactive radial highlight and a subtle 3D tilt that spring back to
 * rest. Tilt + sheen are disabled under `prefers-reduced-motion` and on touch,
 * leaving a clean static glass card that still meets AA contrast.
 */
export default function GlassPanel({
  children,
  className,
  span = 1,
  label,
  ariaLabel,
  interactive = true,
  as = 'article',
}: GlassPanelProps) {
  const reduceMotion = useReducedMotion()
  const ref = useRef<HTMLElement>(null)

  const px = useMotionValue(50)
  const py = useMotionValue(50)
  const rotateX = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 })
  const rotateY = useSpring(useMotionValue(0), { stiffness: 200, damping: 20 })

  const highlight = useMotionTemplate`radial-gradient(220px circle at ${px}% ${py}%, rgba(0,240,255,0.20), transparent 60%)`
  const transform = useMotionTemplate`perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`

  const live = interactive && !reduceMotion
  const Tag = motion[as]

  function onPointerMove(e: React.PointerEvent<HTMLElement>) {
    if (!live || !ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const fx = (e.clientX - rect.left) / rect.width
    const fy = (e.clientY - rect.top) / rect.height
    px.set(fx * 100)
    py.set(fy * 100)
    ;(rotateX as MotionValue<number>).set((0.5 - fy) * 8)
    ;(rotateY as MotionValue<number>).set((fx - 0.5) * 10)
  }

  function onPointerLeave() {
    if (!live) return
    ;(rotateX as MotionValue<number>).set(0)
    ;(rotateY as MotionValue<number>).set(0)
    px.set(50)
    py.set(50)
  }

  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement>}
      className={`glass glass-panel${span > 1 ? ` glass-panel--span-${span}` : ''}${
        className ? ` ${className}` : ''
      }`}
      style={live ? { transform } : undefined}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-12% 0px' }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      aria-label={ariaLabel}
    >
      {label && (
        <header className="glass-panel__label">
          <span className="glass-panel__tag" aria-hidden="true" />
          {label}
        </header>
      )}
      <div className="glass-panel__body">{children}</div>
      {live && <motion.div className="glass-panel__highlight" style={{ background: highlight }} aria-hidden="true" />}
    </Tag>
  )
}
