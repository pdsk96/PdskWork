'use client'

import Link from 'next/link'
import { m, useReducedMotion } from 'motion/react'
import { useLocale } from '@/i18n/LocaleProvider'
import RouteTransition from '@/components/RouteTransition'
import GlitchText from '@/components/GlitchText'
import CyberHero from '@/components/CyberHero'
import PdskLogo from '@/components/PdskLogo'

/**
 * /welcome — an immersive greeting page.
 *
 * Rich welcome copy (bilingual) layered over the CyberHero 3D scene, with a
 * fullscreen + ambient CTA, a "what you'll find" pillars grid, by-the-numbers
 * stats, and a closing invitation. Multimedia: R3F scene, kinetic glitch type,
 * animated glass cards.
 */
function requestFs() {
  const el = document.documentElement
  const req =
    el.requestFullscreen?.bind(el) ??
    (el as unknown as { webkitRequestFullscreen?: () => Promise<void> }).webkitRequestFullscreen?.bind(el)
  void req?.().catch(() => {})
}

export default function WelcomePage() {
  const { dict } = useLocale()
  const w = dict.welcome
  const reduce = useReducedMotion()

  return (
    <RouteTransition>
      <main className="page welcome">
        {/* Multimedia background: the cursor-reactive 3D scene */}
        <div className="welcome__bg" aria-hidden="true">
          <CyberHero />
        </div>

        <section className="welcome__hero glass-card">
          <m.span
            className="welcome__kicker"
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {w.kicker}
          </m.span>

          <h1 className="welcome__title">
            <GlitchText text={w.title} as="span" />
          </h1>

          <p className="welcome__lead">{w.lead}</p>

          <div className="welcome__cta">
            <button type="button" className="primary-btn" onClick={requestFs}>
              {w.enter}
            </button>
            <Link href="/work" className="ghost-btn" transitionTypes={['nav-forward']}>
              {w.explore}
            </Link>
          </div>
          <p className="welcome__cta-hint">{w.enterHint}</p>
        </section>

        <section className="welcome__section glass-card" aria-labelledby="welcome-greeting">
          <h2 id="welcome-greeting" className="section-title">{w.greeting}</h2>
          <p className="section-lead">{w.greetingBody}</p>
          <PdskLogo size={24} />
        </section>

        <section className="welcome__section" aria-labelledby="welcome-pillars">
          <h2 id="welcome-pillars" className="section-title welcome__section-title">{w.pillarsTitle}</h2>
          <div className="welcome__pillars">
            {w.pillars.map((pillar, i) => (
              <m.article
                key={i}
                className="glass-card welcome__pillar"
                initial={reduce ? false : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <span className="welcome__pillar-idx" aria-hidden="true">0{i + 1}</span>
                <h3 className="welcome__pillar-h">{pillar.h}</h3>
                <p className="welcome__pillar-p">{pillar.p}</p>
              </m.article>
            ))}
          </div>
        </section>

        <section className="welcome__section glass-card welcome__stats" aria-labelledby="welcome-stats">
          <h2 id="welcome-stats" className="section-title">{w.statsTitle}</h2>
          <div className="welcome__stats-grid">
            {w.stats.map((s, i) => (
              <div key={i} className="welcome__stat">
                <span className="welcome__stat-n">{s.n}</span>
                <span className="welcome__stat-l">{s.l}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="welcome__section glass-card welcome__closing" aria-labelledby="welcome-closing">
          <h2 id="welcome-closing" className="section-title">{w.closingTitle}</h2>
          <p className="section-lead">{w.closingBody}</p>
          <div className="welcome__cta">
            <Link href="/work" className="primary-btn" transitionTypes={['nav-forward']}>
              {w.explore}
            </Link>
            <Link href="/blog" className="ghost-btn" transitionTypes={['nav-forward']}>
              {w.readBlog}
            </Link>
            <Link href="/contact" className="ghost-btn" transitionTypes={['nav-forward']}>
              {w.sayHi}
            </Link>
          </div>
        </section>
      </main>
    </RouteTransition>
  )
}
