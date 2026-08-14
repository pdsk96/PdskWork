'use client'

import { useId } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

type GlitchTextProps = {
  /** Text to render. */
  children: string
  /** Rendered HTML tag. */
  as?: 'h1' | 'h2' | 'h3' | 'span' | 'p'
  className?: string
  /** DOM id (forwarded to the rendered element, e.g. for aria-labelledby). */
  id?: string
  /** Disable the glitch layers entirely (e.g. inside reduced-motion). */
  stable?: boolean
}

/**
 * GlitchText — cyberpunk kinetic typography.
 *
 * Three stacked copies of the same text are offset and clipped by animated
 * CSS keyframes so cyan/magenta channels "tear" apart and snap back. Under
 * `prefers-reduced-motion` only the base layer renders (no tearing).
 *
 * Pure CSS animation keeps it cheap: no per-frame JS, and the layers are
 * `aria-hidden` so screen readers announce the text exactly once.
 */
export default function GlitchText({
  children,
  as = 'span',
  className,
  id,
  stable = false,
}: GlitchTextProps) {
  const reduceMotion = useReducedMotion()
  const scopeId = useId().replace(/[:]/g, '')
  const Tag = motion[as]
  const animate = !stable && !reduceMotion

  return (
    <Tag
      id={id}
      className={`glitch${className ? ` ${className}` : ''}`}
      data-glitch={animate ? 'on' : 'off'}
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-15% 0px' }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <span className="glitch__base">{children}</span>
      {animate && (
        <>
          <span className="glitch__layer glitch__layer--cyan" aria-hidden="true">
            {children}
          </span>
          <span className="glitch__layer glitch__layer--magenta" aria-hidden="true">
            {children}
          </span>
        </>
      )}
      <span className="glitch__clip" aria-hidden="true">
        <span className="glitch__scanline" style={{ animationName: `glitch-scan-${scopeId}` }} />
      </span>
      <style>{`
        @keyframes glitch-scan-${scopeId} {
          0%, 100% { transform: translateY(-120%); }
          50% { transform: translateY(120%); }
        }
      `}</style>
    </Tag>
  )
}
