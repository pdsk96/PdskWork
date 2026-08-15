'use client'

import { m, useReducedMotion } from 'motion/react'
import GlassPanel from '@/components/GlassPanel'
import { useLocale } from '@/i18n/LocaleProvider'

/**
 * ProjectShowcase — a bento grid of liquid-glass panels summarizing the
 * PdskWork creative practice. Fully additive (own component); used by the
 * about page below the existing intro card.
 *
 * Animation respects prefers-reduced-motion (no transform entrance).
 */
export default function ProjectShowcase() {
  const { dict } = useLocale()
  const reduceMotion = useReducedMotion()

  const items = [
    {
      accent: 'cyan' as const,
      label: dict.nav.work,
      title: dict.showcase.realtime3d,
      body: dict.showcase.realtime3dBody,
      span: { gridColumn: 'span 2', gridRow: 'span 2' } as React.CSSProperties,
    },
    {
      accent: 'magenta' as const,
      label: 'Motion',
      title: dict.showcase.kineticType,
      body: dict.showcase.kineticTypeBody,
    },
    {
      accent: 'violet' as const,
      label: 'Glass',
      title: dict.showcase.liquidSurfaces,
      body: dict.showcase.liquidSurfacesBody,
    },
    {
      accent: 'cyan' as const,
      label: 'Stack',
      title: dict.showcase.stackTitle,
      body: dict.showcase.stackBody,
      span: { gridColumn: 'span 2' } as React.CSSProperties,
    },
  ]

  return (
    <div className="bento">
      {items.map((item, i) => (
        <m.div
          key={i}
          initial={reduceMotion ? false : { opacity: 0, y: 22 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: ['easeOut'], delay: i * 0.05 }}
          style={item.span}
        >
          <GlassPanel accent={item.accent} label={item.label} style={{ height: '100%' }}>
            <h3 className="bento__title">{item.title}</h3>
            <p className="bento__body">{item.body}</p>
          </GlassPanel>
        </m.div>
      ))}
      <style jsx>{`
        .bento {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-auto-rows: minmax(150px, auto);
          gap: 16px;
        }
        .bento__title {
          margin: 0 0 8px;
          font-size: clamp(1.05rem, 2.2vw, 1.4rem);
          line-height: 1.15;
        }
        .bento__body {
          margin: 0;
          color: var(--fg-muted, #9fb3c8);
          font-size: 0.92rem;
        }
        @media (max-width: 720px) {
          .bento {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}
