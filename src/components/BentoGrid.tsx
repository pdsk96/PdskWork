'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { useLocale } from '@/i18n/LocaleProvider'
import GlassPanel from './GlassPanel'
import GlitchText from './GlitchText'

/**
 * BentoGrid — cyberpunk bento section.
 *
 * A responsive grid of GlassPanels showcasing the iteration-1 motion
 * foundation. Each tile is a panel with a kinetic title; the layout uses
 * column spans so the grid reads as a "bento" on wide screens and collapses
 * to a single column on mobile. Entrance reveals respect reduced-motion.
 */
export default function BentoGrid() {
  const { dict } = useLocale()
  const b = dict.bento
  const reduceMotion = useReducedMotion()

  const reveal = reduceMotion
    ? undefined
    : {
        hidden: { opacity: 0, y: 24 },
        show: (i: number) => ({
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: i * 0.06 },
        }),
      }

  return (
    <section className="bento" aria-labelledby="bento-title">
      <header className="bento__head">
        <span className="bento__kicker">{b.sectionLabel}</span>
        <GlitchText as="h2" className="bento__title" id="bento-title">
          {b.title}
        </GlitchText>
        <p className="bento__lead">{b.lead}</p>
      </header>

      <div className="bento__grid">
        <motion.div
          className="bento__cell bento__cell--feature"
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-12% 0px' }}
          custom={0}
        >
          <GlassPanel span={2} label={b.r3dTitle} ariaLabel={b.r3dTitle}>
            <p className="bento__body">{b.r3dBody}</p>
            <div className="bento__viz bento__viz--orbit" aria-hidden="true">
              <span className="bento__orbit" />
              <span className="bento__orbit bento__orbit--alt" />
              <span className="bento__core" />
            </div>
          </GlassPanel>
        </motion.div>

        <motion.div
          className="bento__cell"
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-12% 0px' }}
          custom={1}
        >
          <GlassPanel label={b.kineticTitle} ariaLabel={b.kineticTitle}>
            <p className="bento__body">{b.kineticBody}</p>
            <div className="bento__viz bento__viz--type" aria-hidden="true">
              <GlitchText as="span" className="bento__type-sample">
                GL//TCH
              </GlitchText>
            </div>
          </GlassPanel>
        </motion.div>

        <motion.div
          className="bento__cell"
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-12% 0px' }}
          custom={2}
        >
          <GlassPanel label={b.glassTitle} ariaLabel={b.glassTitle}>
            <p className="bento__body">{b.glassBody}</p>
            <div className="bento__viz bento__viz--glass" aria-hidden="true">
              <span className="bento__shard" />
              <span className="bento__shard bento__shard--2" />
              <span className="bento__shard bento__shard--3" />
            </div>
          </GlassPanel>
        </motion.div>

        <motion.div
          className="bento__cell"
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-12% 0px' }}
          custom={3}
        >
          <GlassPanel label={b.perfTitle} ariaLabel={b.perfTitle}>
            <p className="bento__body">{b.perfBody}</p>
            <div className="bento__viz bento__viz--bars" aria-hidden="true">
              <span className="bento__bar" style={{ height: '60%' }} />
              <span className="bento__bar" style={{ height: '85%' }} />
              <span className="bento__bar bento__bar--warn" style={{ height: '40%' }} />
              <span className="bento__bar" style={{ height: '92%' }} />
            </div>
          </GlassPanel>
        </motion.div>

        <motion.div
          className="bento__cell bento__cell--cta"
          variants={reveal}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-12% 0px' }}
          custom={4}
        >
          <GlassPanel span={2} label={b.a11yTitle} ariaLabel={b.a11yTitle}>
            <p className="bento__body">{b.a11yBody}</p>
            <Link href="/work" className="primary-btn bento__cta">
              {b.cta}
            </Link>
          </GlassPanel>
        </motion.div>
      </div>
    </section>
  )
}
