'use client'

import { motion, useReducedMotion } from 'framer-motion'
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

  const easeOut = ['easeOut'] as const

  const items = [
    {
      accent: 'cyan' as const,
      label: dict.nav.work,
      title:
        dict.nav.work === 'Work' ? 'Real-time 3D scenes' : 'Adegan 3D real-time',
      body:
        dict.nav.work === 'Work'
          ? 'React Three Fiber meshes that react to cursor and scroll without per-frame allocations.'
          : 'Mesh R3F yang merespons kursor & gulir tanpa alokasi per-frame.',
      span: { gridColumn: 'span 2', gridRow: 'span 2' } as React.CSSProperties,
    },
    {
      accent: 'magenta' as const,
      label: 'Motion',
      title: dict.nav.work === 'Work' ? 'Kinetic type' : 'Tipografi kinetik',
      body:
        dict.nav.work === 'Work'
          ? 'Scramble + gradient glitch text guarded by prefers-reduced-motion.'
          : 'Teks glitch scramble + gradien, dengan pengaman prefers-reduced-motion.',
    },
    {
      accent: 'violet' as const,
      label: 'Glass',
      title: dict.nav.work === 'Work' ? 'Liquid surfaces' : 'Permukaan cair',
      body:
        dict.nav.work === 'Work'
          ? 'Frosted backdrop-blur panels with accent glow.'
          : 'Panel kaca buram backdrop-blur dengan glow aksen.',
    },
    {
      accent: 'cyan' as const,
      label: 'Stack',
      title: 'Next.js 16 + R3F',
      body:
        dict.nav.work === 'Work'
          ? 'App Router, Turbopack, React 19, Framer Motion.'
          : 'App Router, Turbopack, React 19, Framer Motion.',
      span: { gridColumn: 'span 2' } as React.CSSProperties,
    },
  ]

  return (
    <div className="bento">
      {items.map((item, i) => (
        <motion.div
          key={i}
          initial={reduceMotion ? false : { opacity: 0, y: 22 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: easeOut, delay: i * 0.05 }}
          style={item.span}
        >
          <GlassPanel accent={item.accent} label={item.label} style={{ height: '100%' }}>
            <h3 className="bento__title">{item.title}</h3>
            <p className="bento__body">{item.body}</p>
          </GlassPanel>
        </motion.div>
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
